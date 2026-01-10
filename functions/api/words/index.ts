
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
        const now = Date.now();
        let query = 'SELECT * FROM words WHERE user_id = ? AND is_deleted = 0';
        let params: any[] = [user.sub];

        if (mode === 'study') {
            query += ' AND due_date <= ? ORDER BY due_date ASC LIMIT 50';
            params.push(now);
        } else {
            const page = parseInt(url.searchParams.get('page') || '1');
            const limit = parseInt(url.searchParams.get('limit') || '20');
            const offset = (page - 1) * limit;
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);
        }

        const { results } = await env.DB.prepare(query).bind(...params).all();
        
        return jsonResponse(results.map((r: any) => ({
            id: r.id,
            term: r.term,
            definition: r.definition,
            phonetic: r.phonetic,
            exampleSentence: r.example_sentence,
            exampleTranslation: r.example_translation,
            tags: r.tags ? JSON.parse(r.tags) : [],
            alpha: r.alpha,
            beta: r.beta,
            halflife: r.halflife,
            dueDate: r.due_date,
            lastSeen: r.last_seen,
            totalExposure: r.total_exposure,
            createdAt: r.created_at
        })));
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
        await env.DB.prepare(
            `INSERT INTO words (
                id, user_id, term, definition, phonetic, example_sentence, 
                example_translation, tags, alpha, beta, halflife, due_date, 
                last_seen, total_exposure, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            word.id, user.sub, word.term, word.definition, word.phonetic || null,
            word.exampleSentence || null, word.exampleTranslation || null,
            JSON.stringify(word.tags || []), 
            word.alpha || 3.0, 
            word.beta || 1.0, 
            word.halflife || 1440, 
            word.dueDate || Date.now(), 
            word.lastSeen || 0,
            word.totalExposure || 0,
            word.createdAt || Date.now()
        ).run();

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ error: e.message }, 500);
    }
}
