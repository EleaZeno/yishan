import { Env, hashPassword, signToken, jsonResponse, PagesFunction } from '../../utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  try {
    const { email, password } = await request.json() as any;

    const userRecord = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<any>();
    
    if (!userRecord) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const { hash: inputHash } = await hashPassword(password, userRecord.salt);
    
    if (inputHash !== userRecord.password_hash) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    const user = { id: userRecord.id, email: userRecord.email };
    const token = await signToken({ sub: userRecord.id, email: userRecord.email }, env.JWT_SECRET || 'dev-secret');

    return jsonResponse({ user, token });
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
};