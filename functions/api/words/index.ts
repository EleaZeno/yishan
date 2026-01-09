
import { Env, verifyToken, jsonResponse, PagesFunction, ensureTables } from '../../utils';

async function getUser(request: Request, secret: string) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.split(' ')[1];
        return await verifyToken(token, secret);
    } catch { return null; }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    await ensureTables(env.DB);
    const user = await getUser(request, env.JWT_SECRET || 'dev-secret');
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'library';
    
    try {
        if (mode === 'study') {
            const now = Date.now();
            const { results } = await env.DB.prepare(
                'SELECT * FROM words WHERE user_id = ? AND is_deleted = 0 AND due_date <= ? ORDER BY due_date ASC LIMIT 100'
            ).bind(user.sub, now).all();
            return jsonResponse(results.map((r: any) => ({
                ...r, 
                weight: r.strength, 
                stability: r.interval, 
                totalExposure: r.repetitions, 
                dueDate: r.due_date,
                tags: r.tags ? JSON.parse(r.tags) : []
            })));
        } else {
            const page = parseInt(url.searchParams.get('page') || '1');
            const limit = parseInt(url.searchParams.get('limit') || '20');
            const search = url.searchParams.get('search') || '';
            const offset = (page - 1) * limit;

            let query = 'SELECT * FROM words WHERE user_id = ? AND is_deleted = 0';
            const params: any[] = [user.sub];

            if (search) {
                query += ' AND (term LIKE ? OR definition LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const { results } = await env.DB.prepare(query).bind(...params).all();
            return jsonResponse(results.map((r: any) => ({
                ...r, 
                weight: r.strength, 
                stability: r.interval, 
                totalExposure: r.repetitions, 
                dueDate: r.due_date,
                tags: r.tags ? JSON.parse(r.tags) : []
            })));
        }
    } catch (e: any) {
        return jsonResponse({ error: e.message }, 500);
    }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    await ensureTables(env.DB);
    const user = await getUser(request, env.JWT_SECRET || 'dev-secret');
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    try {
        const word = await request.json() as any;
        if (!word.id || !word.term) return jsonResponse({ error: 'Invalid data' }, 400);

        // 检查是否已存在
        const existing = await env.DB.prepare('SELECT id FROM words WHERE user_id = ? AND term = ? AND is_deleted = 0').bind(user.sub, word.term).first();
        if (existing) return jsonResponse({ error: 'Word already in your library' }, 409);

        // Map frontend properties to DB columns
        await env.DB.prepare(
            `INSERT INTO words (
                id, user_id, term, definition, phonetic, example_sentence, 
                example_translation, tags, strength, interval, due_date, 
                repetitions, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            word.id, user.sub, word.term, word.definition, word.phonetic || null,
            word.exampleSentence || null, word.exampleTranslation || null,
            JSON.stringify(word.tags || []), 
            word.weight || 0, // Map weight -> strength
            word.stability || 0, // Map stability -> interval
            word.dueDate || Date.now(), // Map dueDate -> due_date
            word.totalExposure || 0, // Map totalExposure -> repetitions
            word.createdAt || Date.now()
        ).run();

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ error: e.message }, 500);
    }
}