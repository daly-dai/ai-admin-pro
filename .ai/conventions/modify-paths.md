# 修改路径

> 匹配修改场景 → 定位锚点 → 按已有模式修改 → pnpm verify。
> 最小修改原则。≤20行(改)/≤50行(调整)/>50行暂停。已有代码风格优先，禁止顺手重构。

---

## T1-T8（CRUD 修改）

| 模板 | 场景        | 目标文件                     | 锚点                  |
| ---- | ----------- | ---------------------------- | --------------------- |
| T1   | 加表格列    | `pages/{module}/index.tsx`   | columns 数组          |
| T2   | 加搜索字段  | `pages/{module}/index.tsx`   | searchItems 数组      |
| T3   | 加表单字段  | `pages/{module}/components/` | formItems 数组        |
| T4   | 加详情字段  | `pages/{module}/components/` | items 数组            |
| T5   | 加 API 方法 | `api/{module}/index.ts`      | API 对象              |
| T6   | 改类型定义  | `api/{module}/types.ts`      | Entity/Query/FormData |
| T7   | 改文案/样式 | 对应文件                     | 目标位置              |
| T8   | 加删除确认  | `pages/{module}/index.tsx`   | 操作列                |

## D1-D6（大屏修改）

> → `.ai/conventions/dashboard-conventions.md` §七
