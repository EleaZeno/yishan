# 忆闪 - 科学记忆系统

基于遗忘曲线的智能记忆系统，科学记忆，过目不忘。

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.0.0 或更高版本
- **包管理器**: npm 9+ / yarn / pnpm

推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node.js 版本：

```bash
nvm install 18
nvm use 18
```

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/EleaZeno/yishan.git
cd yishan

# 安装依赖
npm install

# 复制环境变量（可选，Sentry 等功能需要）
cp .env.example .env.local

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建

```bash
npm run build
```

### 测试

```bash
# 运行测试
npm run test

# 测试 UI
npm run test:ui

# 覆盖率报告
npm run test:coverage
```

### 代码检查

```bash
# 类型检查
npm run typecheck

# ESLint
npm run lint
```

## 📦 部署

**重要：正确的部署流程**

本项目已绑定 GitHub + Cloudflare Pages 自动部署。

```bash
# 1. 本地构建测试
npm run build

# 2. 本地检查
npm run typecheck
npm run test

# 3. 提交代码
git add -A
git commit -m "feat: your changes"

# 4. 推送到 GitHub
git push origin main

# 5. Cloudflare 自动构建部署（约1-2分钟）
```

⚠️ **不要用 API 直接上传文件！**
项目已绑定 GitHub，直接上传会被 Git 构建覆盖。

### 部署失败怎么办

1. 打开 [Cloudflare Pages 仪表盘](https://dash.cloudflare.com/) 查看构建日志
2. 检查本地 `npm run build` 是否能成功构建
3. 查看 [错误分析文档](./ERROR_ANALYSIS.md)

### 访问地址

- **生产环境**: https://yishan-96f.pages.dev
- **预览环境**: 每次 PR 和 push 都会自动生成预览部署

## 🛠️ 技术栈

- **前端**: React 19 + TypeScript
- **构建**: Vite 6
- **样式**: Tailwind CSS 4 + shadcn/ui
- **组件库**: shadcn/ui (base-nova 风格)
- **存储**: IndexedDB (本地优先)
- **部署**: Cloudflare Pages
- **测试**: Vitest + React Testing Library
- **国际化**: i18next
- **错误监控**: Sentry
- **PWA**: vite-plugin-pwa

## 📚 功能

- ✅ 单词学习（遗忘曲线算法）
- ✅ 词库管理（多级别词库）
- ✅ 学习分析（统计数据）
- ✅ 深色模式
- ✅ 多语言（中/英/日）
- ✅ PWA 离线支持
- ✅ 数据导出（JSON/CSV/Anki）
- ✅ 学习计划
- ✅ 成就系统
- ✅ 云备份

## 🔧 环境变量

查看 [.env.example](./.env.example) 获取完整配置。

### Sentry 错误监控（可选）

1. 访问 [sentry.io](https://sentry.io) 创建项目（选择 React）
2. 复制 DSN
3. 创建 `.env.local` 文件：

```bash
VITE_SENTRY_DSN=https://xxxx@sentry.io/xxxxxx
```

> 不配置 Sentry 时应用正常运行，仅无法上报错误。

### 可选配置

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE` | API 基础 URL | `/api` |
| `VITE_APP_VERSION` | 应用版本 | 自动读取 |

## 🌍 国际化

翻译文件位于 `src/i18n/translations.ts`。

### 添加新语言

1. 在 `translations.ts` 中添加新的语言对象
2. 在 `src/i18n/index.ts` 中注册语言
3. 更新 `src/constants.ts` 中的语言选项

## 📱 PWA

应用支持 PWA 离线使用：

- **更新策略**: 刷新页面或重新打开应用即可更新
- **离线缓存**: 学习数据保存在本地 IndexedDB
- **手动更新**: 当提示有新版本时，点击更新或刷新页面

## 🐛 错误排查

常见问题解决方案：

- [错误分析文档](./ERROR_ANALYSIS.md)
- [GitHub Issues](https://github.com/EleaZeno/yishan/issues)

## 🤝 贡献

参见 [CONTRIBUTING.md](./CONTRIBUTING.md)

### 提 PR 前

```bash
# 1. 运行检查
npm run typecheck
npm run lint
npm run test

# 2. 确保测试通过
npm run test:coverage
```

## 📄 许可证

[MIT](./LICENSE)

---

**问题反馈**: [GitHub Issues](https://github.com/EleaZeno/yishan/issues)
