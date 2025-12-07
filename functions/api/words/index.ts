import { Env, verifyToken, jsonResponse, PagesFunction } from '../../utils';

// Middleware to get user
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const user = await getUser(request, env.JWT_SECRET || 'dev-secret');
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const result = await env.DB.prepare('SELECT data FROM words WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at DESC').bind(user.sub).all();
    
    // Parse JSON strings back to objects
    const words = result.results.map((row: any) => JSON.parse(row.data));
    return jsonResponse(words);
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const user = await getUser(request, env.JWT_SECRET || 'dev-secret');
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    try {
        const word = await request.json() as any;
        if (!word.id || !word.term) return jsonResponse({ error: 'Invalid data' }, 400);

        await env.DB.prepare(
            'INSERT INTO words (id, user_id, data, due_date, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(
            word.id, 
            user.sub, 
            JSON.stringify(word), 
            word.dueDate || Date.now(),
            word.createdAt || Date.now()
        ).run();

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ error: e.message }, 500);
    }
}