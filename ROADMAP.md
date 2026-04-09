# yishan v2.0 功能路线图

基于 [用户分析文档](./docs/feature-analysis.md) 的规划。

---

## Phase 1: 内容类型系统 (v2.1)

**目标**: 实现多内容类型支持，为不同记忆场景提供差异化策略

### 已完成 ✅
- [x] 类型定义 (`types.ts`)
- [x] 算法适配 (`algorithm.ts`)
- [x] 数据库 schema 支持

### 待实现
- [ ] 添加单词界面支持内容类型选择
- [ ] 错题类型标签（概念混淆/计算失误等）
- [ ] 公式类型分类
- [ ] 内容类型筛选器（Library 页面）
- [ ] 内容类型图标和颜色区分

### UI 组件
```tsx
// 添加单词时的内容类型选择
<ContentTypeSelector 
  value={word.contentType}
  onChange={(type) => setContentType(type)}
/>

// 错题专属字段
{contentType === 'mistake' && (
  <ErrorReasonSelect 
    value={word.errorReason}
    onChange={setErrorReason}
  />
)}
```

---

## Phase 2: 记忆进度可视化 (v2.2)

**目标**: 让用户直观感知记忆效果

### 待实现
- [ ] 记忆进度看板组件
  - 当日待复习/已完成数量
  - 7天记忆留存率曲线
  - 薄弱知识点标签云
- [ ] Dashboard 重构
  - 添加内容类型分布图
  - 记忆健康度评分
- [ ] Analytics 页面增强
  - 按内容类型分析
  - 最佳记忆时段分析

### UI 组件
```tsx
<MemoryDashboard>
  <ProgressCard 
    due={dueCount}
    completed={completedCount}
    goal={dailyGoal}
  />
  <RetentionChart data={last7Days} />
  <WeakPointsCloud words={weakWords} />
</MemoryDashboard>
```

---

## Phase 3: 碎片化记忆模式 (v2.3)

**目标**: 适配通勤/排队等碎片场景

### 待实现
- [ ] Quick Review 模式
  - 每次仅 1-3 张卡片
  - 快速左右滑动交互
- [ ] 一键收藏难点
- [ ] 语音朗读（TTS）
  - 浏览器原生 SpeechSynthesis API
  - 支持语速调节
- [ ] PWA 通知集成
  - 复习提醒
  - 每日目标提醒

### UI 组件
```tsx
<QuickReview>
  <CompactCard word={currentWord} />
  <SwipeIndicator />
  <VoiceButton onClick={speak} />
</QuickReview>
```

---

## Phase 4: 自适应难度 (v2.4)

**目标**: 基于用户表现自动调整记忆难度

### 已完成 ✅
- [x] 反应时间因子（算法层）
- [x] 内容类型间隔调整

### 待实现
- [ ] 用户画像建模
  - 记忆效率时段分析
  - 疲劳度检测
- [ ] 动态难度标签
  - 用户手动标记"易忘/中等/熟练"
  - AI 预测难度
- [ ] 认知负荷管理
  - 实时计算记忆负荷
  - 超阈值时自动切换复习模式
- [ ] 跳级复习机制

### 数据结构
```typescript
interface UserProfile {
  preferredTimeSlots: string[];  // ["07:00", "21:00"]
  avgEfficiencyByHour: Record<number, number>;
  fatigueThreshold: number;
  dailyGoal: number;
}
```

---

## Phase 5: 云同步与多设备 (v2.5)

**目标**: 跨设备续记，无缝切换

### 已完成 ✅
- [x] Workers API 后端
- [x] D1 数据库 schema
- [x] IndexedDB + 云同步双写层
- [x] 增量同步机制

### 待实现
- [ ] 双向同步冲突解决
  - 时间戳优先策略
  - 用户手动选择
- [ ] 设备管理界面
  - 查看已登录设备
  - 强制登出
- [ ] 离线队列
  - 断网时缓存变更
  - 重连后自动同步
- [ ] 数据导出
  - 完整数据备份
  - Anki 格式导出

---

## Phase 6: 反馈与激励 (v2.6)

**目标**: 即时反馈强化记忆，轻量激励保持动力

### 已完成 ✅
- [x] 成就系统基础组件

### 待实现
- [ ] 即时反馈增强
  - 遗忘原因分析提示
  - 记忆稳定性提示
- [ ] 成就系统后端集成
- [ ] 学习报告
  - 周/月报告
  - 记忆力曲线可视化
- [ ] 排行榜（可选）
  - 本地存储的匿名排名

---

## Phase 7: 记忆联想库 (v2.7)

**目标**: 用户自定义联想内容增强记忆

### 待实现
- [ ] 自定义联想字段
  - 图片上传（R2 存储）
  - 个人笔记
  - 联想口诀
- [ ] 联想内容优先展示
- [ ] 公共联想库（可选）
  - 社区共享联想内容
  - 点赞/评分系统

---

## Phase 8: 批量导入导出 (v2.8)

**目标**: 降低迁移成本，支持备份

### 已完成 ✅
- [x] 基础导入功能

### 待实现
- [ ] CSV 导入
- [ ] Anki 卡片包导入 (.apkg)
- [ ] 完整数据导出
  - JSON 格式
  - CSV 格式
  - Anki 格式
- [ ] 导入预览和校验

---

## 技术债务

需要在功能开发过程中持续处理：

1. **测试覆盖**
   - [ ] 算法单元测试
   - [ ] 组件测试
   - [ ] E2E 测试

2. **性能优化**
   - [ ] 虚拟列表（大数据量）
   - [ ] 图片懒加载
   - [ ] IndexedDB 查询优化

3. **可访问性**
   - [ ] 键盘导航
   - [ ] 屏幕阅读器支持
   - [ ] 高对比度主题

4. **文档完善**
   - [ ] API 文档
   - [ ] 组件文档（Storybook）
   - [ ] 用户指南

---

## 版本发布计划

| 版本 | 预计时间 | 核心功能 |
|------|---------|---------|
| v2.0 | 已完成 | Cloudflare 后端架构 |
| v2.1 | 2周 | 内容类型系统 |
| v2.2 | 1周 | 记忆进度可视化 |
| v2.3 | 1周 | 碎片化记忆 |
| v2.4 | 2周 | 自适应难度 |
| v2.5 | 1周 | 云同步完善 |
| v2.6 | 1周 | 反馈激励 |
| v2.7 | 1周 | 记忆联想 |
| v2.8 | 1周 | 批量导入导出 |

---

## 贡献指南

见 [CONTRIBUTING.md](./CONTRIBUTING.md)
