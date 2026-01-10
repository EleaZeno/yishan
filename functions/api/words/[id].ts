
import { Env, verifyToken, jsonResponse, PagesFunction, ensureTables } from '../../utils';

async function getUser(request: Request, secret: string) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.split(' ')[1];
        return await verifyToken(token, secret);
    } catch { return null; }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    await ensureTables(env.DB);
    const user = await getUser(request, env.JWT_SECRET || 'dev-secret');
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const id = params.id as string;
    const word = await request.json() as any;

    const res = await env.DB.prepare(
        `UPDATE words SET 
            term = ?, definition = ?, phonetic = ?, example_sentence = ?, 
            example_translation = ?, tags = ?, alpha = ?, beta = ?, 
            halflife = ?, due_date = ?, last_seen = ?, total_exposure = ? 
         WHERE id = ? AND user_id = ?`
    ).bind(
        word.term, 
        word.definition, 
        word.phonetic, 
        word.exampleSentence,
        word.exampleTranslation, 
        JSON.stringify(word.tags), 
        word.alpha, 
        word.beta, 
        word.halflife, 
        word.dueDate, 
        word.lastSeen,
        word.totalExposure,
        id, 
        user.sub
    ).run();

    if (res.meta.changes === 0) return jsonResponse({ error: 'Not found' }, 404);
    return jsonResponse({ success: true });
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    await ensureTables(env.DB);
    const user = await getUser(request, env.JWT_SECRET || 'dev-secret');
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    await env.DB.prepare(
        'UPDATE words SET is_deleted = 1 WHERE id = ? AND user_id = ?'
    ).bind(params.id, user.sub).run();

    return jsonResponse({ success: true });
}
