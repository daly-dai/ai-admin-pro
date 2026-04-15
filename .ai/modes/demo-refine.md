# 阶段③：改造适配

> feature-spec 就绪 + demo 页面已有。根据 feature-spec 改造 demo 页面，对齐真实接口和业务规则。

## 前置条件

- 必须已有 `specs/[feature]/feature-spec.md`（阶段②分支A 产出）
- 必须已有 `src/pages/{module}/` 下至少一个页面（阶段①产出）

> 缺 feature-spec → 引导走阶段②分支A；缺 demo → 引导走阶段①

## 步骤

1. **读 feature-spec**：理解数据模型、接口清单、页面设计、差异决策结果
2. **读已有代码**：`src/api/{module}/` + `src/pages/{module}/` 下所有文件
3. **读错题集 + sdesign 文档**：Read `.ai/pitfalls/index.md` + 页面中使用的 sdesign 组件文档
4. **生成变更清单**：对比 feature-spec 与已有代码（types/接口/搜索/表格/操作/表单/联动）
5. **向用户确认**：展示变更清单，等待确认
6. **判断范围**：≤2 文件→直接改 | ≥3 文件→Task 拆解（每 Task = 一个页面改造）
7. **执行改造**：更新 types.ts + index.ts + 页面代码，保留用户手动添加的自定义逻辑
8. **验证**：按 `conventions/verification.md` 执行 Level 1 + Level 2，报错先查 `pitfalls/verify-errors.md`

## 约束

- **仅修改已有文件**，不创建新文件（新增页面应回到阶段①）
- **保留自定义逻辑**：改造是「对齐」不是「重写」
- feature-spec 中标 `[待补充]` 的部分不处理

## 输出锁

🔒 仅允许修改已有的 `src/api/{module}/` + `src/pages/{module}/` 下文件，禁止创建新文件。
