# 纠错沉淀流程

> 当用户纠正错误写法时，AI 必须按此流程沉淀。禁止只口头应答而不落实到文件。

## 触发条件

用户说「这个写法不对/过时了/应该用 xxx」、「不要用 xxx，改成 yyy」时触发。

## 决策流程

```
用户纠正 → 能 ESLint 检测？
  ├─ 能 → 加 ESLint 规则（.ai/conventions/ 或 eslint.config.mjs），高频则同步更新自检清单
  └─ 不能 → 加错题集（.ai/pitfalls/），更新 index.md 索引
```

## 各层写入位置

| 层级     | 写入位置                                       | 适用场景                                       |
| -------- | ---------------------------------------------- | ---------------------------------------------- |
| ESLint   | `eslint.config.mjs`                            | 可机械检测的模式（禁止 import、禁止 JSX 属性） |
| 自检清单 | `.ai/conventions/verification.md` Level 2      | 高频错误，ESLint 无法拦截                      |
| 错题集   | `.ai/pitfalls/{error-id}.md` + 更新 `index.md` | 需代码示例对照的场景                           |

## 沉淀记录

| 日期       | 纠正内容                                                      | 写入位置 |
| ---------- | ------------------------------------------------------------- | -------- |
| 2026-03-23 | destroyOnClose → 条件渲染 {open && \<Modal/>}                 | ESLint   |
| 2026-04-02 | 可编辑表格用 EditableProTable 而非 SForm type='table'         | 错题集   |
| 2026-04-07 | SConfirm 组件 → 推荐使用 Modal.confirm 替代                   | 错题集   |
| 2026-04-07 | type:'dependency' → useWatch + 动态 items（弃用 SDependency） | 错题集   |
