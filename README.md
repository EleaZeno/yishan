# 忆闪 - 科学记忆系统

基于遗忘曲线的智能记忆系统，科学记忆，过目不忘。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

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

## 📦 部署

**重要：正确的部署流程**

本项目已绑定 GitHub + Cloudflare Pages 自动部署。

```bash
# 1. 本地构建测试
npm run build

# 2. 提交代码
git add -A
git commit -m "feat: your changes"

# 3. 推送到 GitHub
git push origin main

# 4. Cloudflare 自动构建部署（约1-2分钟）
```

⚠️ **不要用 API 直接上传文件！** 
项目已绑定 GitHub，直接上传会被 Git 构建覆盖。

### 访问地址

- **生产环境**: https://yishan-96f.pages.dev
- **预览环境**: https://[commit-hash].yishan-96f.pages.dev

## 🛠️ 技术栈

- **前端**: React 19 + TypeScript
- **构建**: Vite 6
- **样式**: Tailwind CSS 4
- **存储**: IndexedDB (本地)
- **部署**: Cloudflare Pages
- **测试**: Vitest + React Testing Library
- **国际化**: i18next
- **错误监控**: Sentry

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

## 🤝 贡献

参见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 许可证

[MIT](./LICENSE)

---

**问题反馈**: [GitHub Issues](https://github.com/EleaZeno/yishan/issues)