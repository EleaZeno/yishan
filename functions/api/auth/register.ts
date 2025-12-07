import { Env, hashPassword, signToken, jsonResponse, PagesFunction } from '../../utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  try {
    const { email, password } = await request.json() as any;

    if (!email || !password || password.length < 6) {
      return jsonResponse({ error: 'Invalid email or password (min 6 chars)' }, 400);
    }

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) {
      return jsonResponse({ error: 'User already exists' }, 409);
    }

    const { hash, salt } = await hashPassword(password);
    const userId = crypto.randomUUID();
    const createdAt = Date.now();

    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, email, hash, salt, createdAt).run();

    const user = { id: userId, email };
    const token = await signToken({ sub: userId, email }, env.JWT_SECRET || 'dev-secret');

    return jsonResponse({ user, token });
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
};