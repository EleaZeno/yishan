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

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const user = await getUser(request, env.JWT_SECRET || 'dev-secret');
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    try {
        const words = await request.json() as any[];
        
        if (!Array.isArray(words) || words.length === 0) {
            return jsonResponse({ error: 'Invalid data' }, 400);
        }

        const stmts = words.map(word => 
             env.DB.prepare(
                'INSERT INTO words (id, user_id, data, due_date, created_at) VALUES (?, ?, ?, ?, ?)'
            ).bind(
                word.id, 
                user.sub, 
                JSON.stringify(word), 
                word.dueDate || Date.now(),
                word.createdAt || Date.now()
            )
        );

        await env.DB.batch(stmts);

        return jsonResponse({ success: true, count: words.length });
    } catch (e: any) {
        return jsonResponse({ error: e.message }, 500);
    }
}