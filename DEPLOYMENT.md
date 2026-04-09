# yishan v2.0 部署指南

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React App (Cloudflare Pages)                       │   │
│  │  - IndexedDB 本地存储（主）                           │   │
│  │  - 离线优先，后台同步                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (仅在线时同步)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Cloudflare Workers API                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /api/auth/*    - 用户认证                           │   │
│  │  /api/words/*   - 单词 CRUD + 同步                   │   │
│  │  /api/sync      - 双向同步                           │   │
│  │  /api/stats     - 统计数据                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│   Cloudflare D1          │   │   Cloudflare KV          │
│   (SQLite-like DB)       │   │   (Session/Cache)        │
│   - users                │   │   - rate limiting        │
│   - words                │   │   - session tokens       │
│   - review_logs          │   │   - sync version         │
│   - achievements         │   │                          │
└──────────────────────────┘   └──────────────────────────┘
```

## 第一步：创建 D1 数据库

```bash
cd workers

# 创建 D1 数据库
wrangler d1 create yishan-db

# 输出会显示：
# ✅ Successfully created DB 'yishan-db'
# database_id = "xxxx-xxxx-xxxx-xxxx"
```

复制输出的 `database_id`，更新 `workers/wrangler.toml`：

```toml
[[d1_databases]]
binding = "YISHAN_DB"
database_name = "yishan-db"
database_id = "你的实际database_id"  # <-- 替换这里
```

## 第二步：创建 KV Namespace

```bash
# 创建 KV namespace
wrangler kv:namespace create YISHAN_KV

# 输出会显示：
# ✅ Successfully created KV namespace 'yishan-workers-YISHAN_KV'
# id = "xxxxx"
```

复制输出的 `id`，更新 `workers/wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "YISHAN_KV"
id = "你的实际kv_id"  # <-- 替换这里
```

## 第三步：初始化数据库表

```bash
cd workers

# 本地开发环境
wrangler d1 execute yishan-db --local --file=../schema.sql

# 生产环境（谨慎！）
wrangler d1 execute yishan-db --remote --file=../schema.sql
```

## 第四步：部署 Workers

```bash
cd workers
npm install
npm run deploy

# 输出会显示：
# ✅ Successfully deployed yishan-api
# https://yishan-api.你的账号.workers.dev
```

## 第五步：更新前端 API 地址

编辑 `src/services/auth.ts` 和 `src/services/storage.ts`，将 API_BASE 改为你的 Workers URL：

```typescript
const API_BASE = 'https://yishan-api.你的账号.workers.dev';
```

## 第六步：部署前端

```bash
# 回到项目根目录
cd ..
npm run build

# 部署到 Cloudflare Pages
# 方法1: GitHub Actions 自动部署（已配置）
git push origin main

# 方法2: 手动部署
npx wrangler pages deploy dist --project-name=yishan
```

## 环境变量

在 Cloudflare Dashboard 或使用 wrangler 配置：

```bash
# 设置密钥（可选，增强安全性）
wrangler secret put JWT_SECRET
# 输入你的密钥

wrangler secret put ADMIN_EMAIL
# 输入管理员邮箱
```

## 测试

```bash
# 本地开发
cd workers
npm run dev

# 测试 API
curl http://localhost:8787/api/health
# 应返回: {"status":"ok","timestamp":...}

# 注册用户
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 常见问题

### Q: D1 数据库连接失败？
A: 确保 `wrangler.toml` 中的 `database_id` 正确，且已运行 `wrangler login` 登录。

### Q: CORS 错误？
A: 检查 `workers/src/index.ts` 中的 `cors` 配置，确保包含你的前端域名。

### Q: 同步不工作？
A: 打开浏览器开发者工具，查看 Network 和 Console 中的错误信息。确保 Workers 已成功部署且 API_BASE 配置正确。

## 下一步

1. 实现双向同步（目前仅单向）
2. 添加冲突解决策略
3. 实现用户设置同步
4. 添加成就系统后端支持
