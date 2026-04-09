/**
 * yishan Cloudflare Worker - API Backend
 * Handles auth, words CRUD, sync, and algorithm stats
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bearerAuth } from 'hono/bearer-auth'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and, lte, desc, sql, asc } from 'drizzle-orm'
import {
  users, words, reviewLogs, syncMeta, achievements,
  studyPlans, statsDaily, userSessions
} from './schema'
import { hashPassword, verifyPassword, generateToken, generateId } from './utils'
import type { Env } from './types'

// ============================================================
// App Setup
// ============================================================
const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
  origin: ['https://yishan-96f.pages.dev', 'http://localhost:5173'],
  credentials: true,
}))

// ============================================================
// Helper: Auth Middleware (simplified JWT-like token auth)
// ============================================================
const authenticate = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const token = authHeader.slice(7)
  try {
    // Token = base64(userId:expiresAt)
    const [userId, expiresAt] = Buffer.from(token, 'base64').toString().split(':')
    if (parseInt(expiresAt) < Date.now()) {
      return c.json({ error: 'Token expired' }, 401)
    }
    c.set('userId', userId)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

// ============================================================
// Auth Routes
// ============================================================
app.post('/api/auth/register', async (c) => {
  const DB = drizzle(c.env.YISHAN_DB)
  const body = await c.req.json<{ email: string; password: string; name?: string }>()
  
  if (!body.email || !body.password) {
    return c.json({ error: 'Email and password required' }, 400)
  }
  
  // Check if user exists
  const existing = await DB.select().from(users).where(eq(users.email, body.email)).get()
  if (existing) {
    return c.json({ error: 'Email already registered' }, 409)
  }
  
  const userId = generateId()
  const passwordHash = await hashPassword(body.password)
  
  await DB.insert(users).values({
    id: userId,
    email: body.email,
    name: body.name || body.email.split('@')[0],
    passwordHash,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  })
  
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  const token = Buffer.from(`${userId}:${expiresAt}`).toString('base64')
  
  return c.json({
    token,
    user: { id: userId, email: body.email, name: body.name }
  })
})

app.post('/api/auth/login', async (c) => {
  const DB = drizzle(c.env.YISHAN_DB)
  const body = await c.req.json<{ email: string; password: string }>()
  
  if (!body.email || !body.password) {
    return c.json({ error: 'Email and password required' }, 400)
  }
  
  const user = await DB.select().from(users).where(eq(users.email, body.email)).get()
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
  
  const valid = await verifyPassword(body.password, user.passwordHash)
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
  
  // Update last login
  await DB.update(users)
    .set({ lastLoginAt: Math.floor(Date.now() / 1000) })
    .where(eq(users.id, user.id))
  
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000
  const token = Buffer.from(`${user.id}:${expiresAt}`).toString('base64')
  
  return c.json({
    token,
    user: { id: user.id, email: user.email, name: user.name }
  })
})

// ============================================================
// Words Routes (with sync support)
// ============================================================

// GET /api/words?mode=study - get due words
// GET /api/words?mode=library&page=1&limit=20 - get all words paginated
// GET /api/words?mode=sync&since=timestamp&deviceId=xxx - sync changes since timestamp
app.get('/api/words', authenticate, async (c) => {
  const DB = drizzle(c.env.YISHAN_DB)
  const userId = c.get('userId')
  const mode = c.req.query('mode')
  
  if (mode === 'study') {
    const now = Math.floor(Date.now() / 1000)
    const result = await DB.select().from(words)
      .where(and(eq(words.userId, userId), lte(words.dueDate, now * 1000)))
      .orderBy(asc(words.dueDate))
      .limit(50)
    
    return c.json(result.map(formatWord))
  }
  
  if (mode === 'library') {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = (page - 1) * limit
    
    const result = await DB.select().from(words)
      .where(and(eq(words.userId, userId), sql`${words.deletedAt} IS NULL`))
      .orderBy(desc(words.createdAt))
      .limit(limit)
      .offset(offset)
    
    const total = await DB.select({ count: sql<number>`count(*)` }).from(words)
      .where(and(eq(words.userId, userId), sql`${words.deletedAt} IS NULL`))
      .get()
    
    return c.json({
      words: result.map(formatWord),
      total: total?.count || 0,
      page,
      limit,
    })
  }
  
  if (mode === 'sync') {
    const since = parseInt(c.req.query('since') || '0') * 1000 // Convert to ms
    const deviceId = c.req.query('deviceId')
    
    // Get changes since timestamp (both updated and deleted)
    const result = await DB.select().from(words)
      .where(and(eq(words.userId, userId), sql`${words.updatedAt} > ${since / 1000}`))
    
    return c.json({
      words: result.map(formatWord),
      serverTime: Math.floor(Date.now() / 1000),
    })
  }
  
  // Default: return recent words for stats
  const result = await DB.select().from(words)
    .where(and(eq(words.userId, userId), sql`${words.deletedAt} IS NULL`))
    .limit(1000)
  
  return c.json(result.map(formatWord))
})

// POST /api/words - create word
app.post('/api/words', authenticate, async (c) => {
  const DB = drizzle(c.env.YISHAN_DB)
  const userId = c.get('userId')
  const body = await c.req.json()
  
  const wordId = generateId()
  const now = Math.floor(Date.now() / 1000)
  
  await DB.insert(words).values({
    id: wordId,
    userId,
    term: body.term,
    phonetic: body.phonetic || null,
    definition: body.definition,
    exampleSentence: body.exampleSentence || null,
    exampleTranslation: body.exampleTranslation || null,
    contentType: body.contentType || 'word',
    tags: JSON.stringify(body.tags || []),
    notes: body.notes || null,
    alpha: body.alpha || 1,
    beta: body.beta || 1,
    halflife: body.halflife || 1440,
    lastSeen: now,
    totalExposure: 0,
    dueDate: now * 1000,
    createdAt: now,
    updatedAt: now,
  })
  
  return c.json({ id: wordId, ...body }, 201)
})

// POST /api/words/batch - batch import words
app.post('/api/words/batch', authenticate, async (c) => {
  const DB = drizzle(c.env.YISHAN_DB)
  const userId = c.get('userId')
  const body = await c.req.json<any[]>()
  
  const now = Math.floor(Date.now() / 1000)
  const values = body.map((w) => ({
    id: w.id || generateId(),
    userId,
    term: w.term,
    phonetic: w.phonetic || null,
    definition: w.definition,
    exampleSentence: w.exampleSentence || null,
    exampleTranslation: w.exampleTranslation || null,
    contentType: w.contentType || 'word',
    tags: JSON.stringify(w.tags || []),
    notes: w.notes || null,
    alpha: w.alpha || 1,
    beta: w.beta || 1,
    halflife: w.halflife || 1440,
    lastSeen: now,
    totalExposure: 0,
    dueDate: now * 1000,
    createdAt: now,
    updatedAt: now,
  }))
  
  await DB.insert(words).values(values)
  
  return c.json({ count: values.length }, 201)
})

// PUT /api/words/:id - update word (and log review)
app.put('/api/words/:id', authenticate, async (c) => {
  const DB = drizzle(c.env.YISHAN_DB)
  const userId = c.get('userId')
  const wordId = c.req.param('id')
  const body = await c.req.json()
  
  const now = Math.floor(Date.now() / 1000)
  
  // Update word
  await DB.update(words).set({
    term: body.term,
    phonetic: body.phonetic,
    definition: body.definition,
    exampleSentence: body.exampleSentence,
    exampleTranslation: body.exampleTranslation,
    contentType: body.contentType,
    tags: JSON.stringify(body.tags || []),
    notes: body.notes,
    alpha: body.alpha,
    beta: body.beta,
    halflife: body.halflife,
    lastSeen: body.lastSeen,
    totalExposure: body.totalExposure,
    dueDate: body.dueDate,
    updatedAt: now,
  }).where(and(eq(words.id, wordId), eq(words.userId, userId)))
  
  // Log review interaction if provided
  if (body.review) {
    const logId = generateId()
    await DB.insert(reviewLogs).values({
      id: logId,
      wordId,
      userId,
      direction: body.review.direction,
      durationMs: body.review.durationMs,
      isFlipped: body.review.isFlipped ? 1 : 0,
      audioPlayedCount: body.review.audioPlayedCount || 0,
      predictedProb: body.review.predictedProb,
      reviewTime: now,
    })
  }
  
  return c.json({ success: true })
})

// DELETE /api/words/:id - soft delete
app.delete('/api/words/:id', authenticate, async (c) => {
  const DB = drizzle(c.env.YISHAN_DB)
  const userId = c.get('userId')
  const wordId = c.req.param('id')
  
  const now = Math.floor(Date.now() / 1000)
  await DB.update(words).set({ deletedAt: now, updatedAt: now })
    .where(and(eq(words.id, wordId), eq(words.userId, userId)))
  
  return c.json({ success: true })
})

// ============================================================
// Sync Routes
// ============================================================
app.post('/api/sync', authenticate, async (c) => {
  const DB = drizzle(c.env.YISHAN_DB)
  const userId = c.get('userId')
  const body = await c.req.json<{
    deviceId: string
    lastSyncAt: number
    changes: any[]
  }>()
  
  const now = Math.floor(Date.now() / 1000)
  
  // Process incoming changes from this device
  for (const change of body.changes || []) {
    if (change.action === 'upsert') {
      const existing = await DB.select({ id: words.id }).from(words)
        .where(and(eq(words.id, change.word.id), eq(words.userId, userId))).get()
      
      if (existing) {
        await DB.update(words).set({
          ...change.word,
          updatedAt: now,
        }).where(eq(words.id, change.word.id))
      } else {
        await DB.insert(words).values({
          ...change.word,
          userId,
          createdAt: now,
          updatedAt: now,
        })
      }
    } else if (change.action === 'delete') {
      await DB.update(words).set({ deletedAt: now, updatedAt: now })
        .where(and(eq(words.id, change.wordId), eq(words.userId, userId)))
    }
  }
  
  // Get all changes since lastSyncAt from OTHER devices
  const serverChanges = await DB.select().from(words)
    .where(and(
      eq(words.userId, userId),
      sql`${words.updatedAt} > ${body.lastSyncAt / 1000}`
    ))
  
  // Update sync metadata
  const existingMeta = await DB.select().from(syncMeta)
    .where(eq(syncMeta.userId, userId)).get()
  
  if (existingMeta) {
    await DB.update(syncMeta).set({
      lastSyncAt: now,
      syncVersion: existingMeta.syncVersion + 1,
      deviceId: body.deviceId,
    }).where(eq(syncMeta.userId, userId))
  } else {
    await DB.insert(syncMeta).values({
      userId,
      lastSyncAt: now,
      syncVersion: 1,
      deviceId: body.deviceId,
    })
  }
  
  return c.json({
    changes: serverChanges.map(formatWord),
    syncVersion: (existingMeta?.syncVersion || 0) + 1,
    serverTime: now,
  })
})

// ============================================================
// Stats Routes
// ============================================================
app.get('/api/stats', authenticate, async (c) => {
  const DB = drizzle(c.env.YISHAN_DB)
  const userId = c.get('userId')
  
  // Get all words for stats computation
  const allWords = await DB.select().from(words)
    .where(and(eq(words.userId, userId), sql`${words.deletedAt} IS NULL`))
  
  const now = Date.now()
  const totalSignals = allWords.length
  const dueWords = allWords.filter(w => w.dueDate && w.dueDate <= now).length
  
  // Calculate average recall probability using halflife decay
  let totalProb = 0
  for (const w of allWords) {
    if (w.lastSeen && w.halflife) {
      const elapsed = (now - w.lastSeen) / 60000 // minutes
      const prob = Math.pow(0.5, elapsed / w.halflife)
      totalProb += Math.min(1, Math.max(0, prob))
    }
  }
  const avgRecallProb = totalSignals > 0 ? Math.round((totalProb / totalSignals) * 100) : 0
  
  // Connectivity: % of words with halflife > 1 week
  const connectivity = totalSignals > 0
    ? Math.round((allWords.filter(w => w.halflife > 10080).length / totalSignals) * 100)
    : 0
  
  // Recent review logs for streak calculation
  const recentLogs = await DB.select().from(reviewLogs)
    .where(eq(reviewLogs.userId, userId))
    .orderBy(desc(reviewLogs.reviewTime))
    .limit(100)
  
  // Calculate streak
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dayStart = Math.floor(checkDate.getTime() / 1000)
    const dayEnd = dayStart + 86400
    
    const hasReview = recentLogs.some(l => l.reviewTime >= dayStart && l.reviewTime < dayEnd)
    if (hasReview) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  
  return c.json({
    totalSignals,
    fadingSignals: dueWords,
    averageRecallProb: avgRecallProb,
    connectivity,
    streak,
    masteredWords: allWords.filter(w => w.halflife > 43200).length, // > 30 days
  })
})

// ============================================================
// User Settings Routes
// ============================================================
app.get('/api/user/settings', authenticate, async (c) => {
  const DB = drizzle(c.env.YISHAN_DB)
  const userId = c.get('userId')
  
  const user = await DB.select().from(users).where(eq(users.id, userId)).get()
  if (!user) return c.json({ error: 'User not found' }, 404)
  
  return c.json({
    language: user.settings ? JSON.parse(user.settings as string).language || 'zh' : 'zh',
    theme: user.settings ? JSON.parse(user.settings as string).theme || 'light' : 'light',
    dailyGoal: user.settings ? JSON.parse(user.settings as string).dailyGoal || 50 : 50,
    reviewTimes: user.settings ? JSON.parse(user.settings as string).reviewTimes || [] : [],
  })
})

app.put('/api/user/settings', authenticate, async (c) => {
  const DB = drizzle(c.env.YISHan_DB)
  const userId = c.get('userId')
  const body = await c.req.json()
  
  const user = await DB.select().from(users).where(eq(users.id, userId)).get()
  if (!user) return c.json({ error: 'User not found' }, 404)
  
  const currentSettings = user.settings ? JSON.parse(user.settings as string) : {}
  const newSettings = { ...currentSettings, ...body }
  
  await DB.update(users).set({
    settings: JSON.stringify(newSettings),
    updatedAt: Math.floor(Date.now() / 1000),
  }).where(eq(users.id, userId))
  
  return c.json({ success: true })
})

// ============================================================
// Health Check
// ============================================================
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }))

// ============================================================
// Helper Functions
// ============================================================
function formatWord(w: any) {
  return {
    id: w.id,
    term: w.term,
    phonetic: w.phonetic,
    definition: w.definition,
    exampleSentence: w.exampleSentence,
    exampleTranslation: w.exampleTranslation,
    contentType: w.contentType,
    tags: w.tags ? JSON.parse(w.tags) : [],
    notes: w.notes,
    alpha: w.alpha,
    beta: w.beta,
    halflife: w.halflife,
    lastSeen: w.lastSeen,
    totalExposure: w.totalExposure,
    dueDate: w.dueDate,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
    deletedAt: w.deletedAt,
  }
}

export default app
