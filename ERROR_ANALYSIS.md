# React Error #31 错误分析报告

## 错误信息
`Minified React error #31: Objects are not valid as a React child (found: object with keys {$$typeof, type, key, ref, props}).`

## 原因诊断 (Root Cause)
此错误通常表示 React 运行时收到了无法识别的对象作为子组件。在本项目中，原因是 **React 版本冲突 (Version Mismatch)**。

在 `index.html` 的 `importmap` 中，同时引入了两个不同版本的 React：
1. **React 18.3.1**: 绑定在 `"react"` 和 `"react-dom"`。
2. **React 19.2.3**: 绑定在 `"react/"` 和 `"react-dom/"` (带有斜杠后缀)。

```json
/* 错误配置示例 */
{
  "imports": {
    "react": "https://aistudiocdn.com/react@^18.3.1", 
    /* ... */
    "react/": "https://esm.sh/react@^19.2.3/" 
  }
}
```

**发生了什么？**
1. 构建后的代码（或浏览器直接运行的模块）在引入 JSX 运行时（Runtime）时，通常使用 `import { jsx } from "react/jsx-runtime"`.
2. 由于 `importmap` 中存在 `"react/"` 键，浏览器将其解析为 **React 19** 的 URL。
3. 应用使用 **React 19** 的 `jsx` 函数创建 React 元素（Element）。
4. 随后，应用入口 `index.tsx` 使用 **React 18** 的 `ReactDOM.createRoot` 试图渲染这个元素。
5. React 18 的渲染器无法验证 React 19 创建的元素对象的内部结构（Symbols 或属性不同），判定其为非法对象，抛出 Error #31。

## 修复代码 (Solution)

移除了 `index.html` 中所有指向 React 19 和构建工具（Vite）的冲突条目，确保整个应用在运行时仅加载 **React 18.3.1**。

**修复后的 `importmap`：**

```html
<script type="importmap">
{
  "imports": {
    "react": "https://aistudiocdn.com/react@^18.3.1",
    "react-dom/client": "https://aistudiocdn.com/react-dom@^18.3.1/client",
    "react-dom": "https://aistudiocdn.com/react-dom@^18.3.1",
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.32.0",
    "lucide-react": "https://aistudiocdn.com/lucide-react@^0.344.0",
    "clsx": "https://aistudiocdn.com/clsx@^2.1.1",
    "recharts": "https://aistudiocdn.com/recharts@^2.12.0"
  }
}
</script>
```

---
*此文档由 AI 生成，用于解释 Minified React Error #31 的技术细节。*
