# 贡献指南

感谢你对忆闪的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告 Bug
1. 检查 [Issues](https://github.com/EleaZeno/yishan/issues) 是否已有相同问题
2. 创建新 Issue，包含：
   - 清晰的标题
   - 详细的复现步骤
   - 预期行为 vs 实际行为
   - 浏览器/系统信息
   - 控制台错误信息（如有）

### 提交功能建议
1. 创建 Issue 描述你的想法
2. 解释为什么这个功能有用
3. 列出可能的实现方式

### 提交代码
1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: add your feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 创建 Pull Request

## 本地开发

### 环境要求
- Node.js 18+
- npm 9+

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```

访问 http://localhost:5173

### 构建
```bash
npm run build
```

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 配置
- 组件使用 React Hooks
- 样式使用 Tailwind CSS

## 提交规范

使用 Conventional Commits：
- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 添加测试
- `chore:` 构建、依赖等

示例：
```
feat: add dark mode support
fix: resolve vocabulary import issue
docs: update README with setup instructions
```

## 行为准则

- 尊重他人
- 建设性反馈
- 不发表歧视性言论
- 遵守开源社区规范

## 许可证

所有贡献将在 MIT 许可证下发布。

---

有问题？在 [Discussions](https://github.com/EleaZeno/yishan/discussions) 中提问！
