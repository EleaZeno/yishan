import { Env, verifyToken, jsonResponse, PagesFunction } from '../../utils';

async function getUser(request: Request, secret: string) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.split(' ')[1];
        return await verifyToken(token, secret);
    } catch {
        return null;
    }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const user = await getUser(request, env.JWT_SECRET || 'dev-secret');
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const id = params.id as string;
    const word = await request.json() as any;

    if (word.id !== id) return jsonResponse({ error: 'ID mismatch' }, 400);

    const res = await env.DB.prepare(
        'UPDATE words SET data = ?, due_date = ? WHERE id = ? AND user_id = ?'
    ).bind(
        JSON.stringify(word),
        word.dueDate,
        id,
        user.sub
    ).run();

    if (res.meta.changes === 0) return jsonResponse({ error: 'Not found' }, 404);

    return jsonResponse({ success: true });
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const user = await getUser(request, env.JWT_SECRET || 'dev-secret');
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const id = params.id as string;

    // Soft delete
    await env.DB.prepare(
        'UPDATE words SET is_deleted = 1 WHERE id = ? AND user_id = ?'
    ).bind(id, user.sub).run();

    // Hard delete alternative:
    // await env.DB.prepare('DELETE FROM words WHERE id = ? AND user_id = ?').bind(id, user.sub).run();

    return jsonResponse({ success: true });
}