# CSS-in-JS → CSS 迁移计划

> 9 个 `.style.ts` 文件，涉及 8 个组件目录。将 `antd-style` 的 `createStyles` + `useComStyle` 模式替换为纯 CSS。

## 对照案例（已完成，照抄）

无 — 目前库内没有任何组件使用 .css / .less。本次迁移本身会成为后续的参照案例。

## 迁移模式

```
改前:
  index.style.ts  →  createStyles(({}, { prefixCls }) => ({ ... }))
  index.tsx        →  useComStyle({ prefixCls, useStylesHook: useStyles }) → styles.xxx

改后:
  index.css        →  .sdesign-xxx { ... }
  index.tsx        →  import './index.css';  class 直接写字符串
```

---

## Task 列表

### Task 1 — 最简单：frame-animation ✅

| 项         | 内容                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| 文件       | `src/components/frame-animation/index.style.ts` → `index.css`              |
| 规则数     | 1（仅 root）                                                               |
| token 依赖 | 无                                                                         |
| css 模板   | 无                                                                         |
| 验收       | 动画帧视觉效果不变                                                         |
| 状态       | **已完成** — 删除 `.style.ts`，新建 `.css`，移除 `useComStyle`/`useStyles` |

### Task 2 — 简单：no-data

| 项         | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| 文件       | `src/components/no-data/index.style.ts` → `index.css` |
| 规则数     | 13（root、title、img、大小变体、文字标题）            |
| token 依赖 | 无                                                    |
| css 模板   | 无                                                    |
| 验收       | 空数据占位图视觉效果不变                              |

### Task 3 — 简单：no-page

| 项         | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| 文件       | `src/components/no-page/index.style.ts` → `index.css` |
| 规则数     | 3（root、img、desc）                                  |
| token 依赖 | 无                                                    |
| css 模板   | 无                                                    |
| 验收       | 404 页面视觉效果不变                                  |

### Task 4 — 简单：error-com

| 项         | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| 文件       | `src/components/error-com/index.style.ts` → `index.css` |
| 规则数     | 4（root、img、desc）                                    |
| token 依赖 | 无                                                      |
| css 模板   | 无                                                      |
| 验收       | 错误状态组件视觉效果不变                                |

### Task 5 — 中等：detail

| 项         | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| 文件       | `src/components/detail/index.style.ts` → `index.css`           |
| 规则数     | 1（`${prefixCls}-value`）                                      |
| 关联文件   | `detail/components/item-render/index.tsx` 也引用了 `useStyles` |
| token 依赖 | 无                                                             |
| css 模板   | 无                                                             |
| 验收       | Detail 组件视觉效果不变                                        |

### Task 6 — 中等：file/instance

| 项         | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| 文件       | `src/components/file/styles/file.style.ts` → `file/styles/file.css` |
| 规则数     | 7（root、left、left-icon、left-fileName、left-canClick、action）    |
| token 依赖 | **有** `token.fontSize`                                             |
| css 模板   | **有** `css` 用于 left-canClick                                     |
| 验收       | 文件实例组件视觉效果不变                                            |

### Task 7 — 中等：file/list

| 项         | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| 文件       | `src/components/file/styles/list.style.ts` → `file/styles/list.css` |
| 规则数     | 8（root、label、action、line、item、line-item、sole）               |
| token 依赖 | 无                                                                  |
| css 模板   | 无                                                                  |
| 验收       | 文件列表组件视觉效果不变                                            |

### Task 8 — 中等：form/components/search

| 项         | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| 文件       | `src/components/form/components/search/index.style.ts` → `index.css` |
| 规则数     | 5（grid、label、required、action）                                   |
| token 依赖 | 无                                                                   |
| css 模板   | **有** `css` 用于 label 的 `::after` 伪元素                          |
| 验收       | 搜索表单布局不变                                                     |

### Task 9 — 中等：title ✅

| 项         | 内容                                                |
| ---------- | --------------------------------------------------- |
| 文件       | `src/components/title/index.style.ts` → `index.css` |
| 规则数     | 4（不含已删除的 left-bk）                           |
| token 依赖 | `token.fontSize` → 硬编码 `14`                      |
| 状态       | **已完成**                                          |

### Task 10 — 清理：移除 useComStyle ✅

| 项   | 内容                                                                                     |
| ---- | ---------------------------------------------------------------------------------------- |
| 状态 | **已完成** — `useComStyle.ts` 删除，`hooks/index.ts` 移除导出，`createStyles` 全库零引用 |
