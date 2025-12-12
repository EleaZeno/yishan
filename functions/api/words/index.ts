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

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const user = await getUser(request, env.JWT_SECRET || 'dev-secret');
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'library';
    
    // mode: 'study' - 获取到期待复习的单词 (Limit 50)
    // mode: 'library' - 分页获取所有单词 (Limit 20, Offset X)
    
    try {
        let results;
        
        if (mode === 'study') {
            const now = Date.now();
            // 获取当前需要复习的单词，按到期时间排序，限制50个以避免一次加载过多
            const stmt = env.DB.prepare(
                'SELECT data FROM words WHERE user_id = ? AND is_deleted = 0 AND due_date <= ? ORDER BY due_date ASC LIMIT 50'
            ).bind(user.sub, now);
            
            const raw = await stmt.all();
            results = raw.results.map((row: any) => JSON.parse(row.data));
            
        } else {
            // Library mode with pagination
            const page = parseInt(url.searchParams.get('page') || '1');
            const limit = parseInt(url.searchParams.get('limit') || '20');
            const search = url.searchParams.get('search') || '';
            const offset = (page - 1) * limit;

            // 注意：简单的 JSON 搜索在 SQL 中效率较低，生产环境建议将 term 提取为单独的列
            // 这里为了演示 D1 JSON 查询，假设性能尚可
            
            let query = 'SELECT data FROM words WHERE user_id = ? AND is_deleted = 0';
            const params: any[] = [user.sub];

            // 简单的搜索过滤 (仅在内存中处理还是SQL? D1 LIKE 无法直接作用于 blob 内容除非提取列)
            // 暂时只支持全量分页，搜索建议在客户端对已加载数据或另做优化
            // 此处保持按创建时间倒序
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const stmt = env.DB.prepare(query).bind(...params);
            const raw = await stmt.all();
            results = raw.results.map((row: any) => JSON.parse(row.data));
        }

        const response = jsonResponse(results);
        response.headers.set('Cache-Control', 'private, max-age=0, no-cache'); // 数据频繁变动，不缓存
        return response;

    } catch (e: any) {
        return jsonResponse({ error: e.message }, 500);
    }
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