# 阶段③：改造适配

> feature-spec 就绪 + demo 页面已有。根据 feature-spec 改造 demo 页面，对齐真实接口和业务规则。

## 前置检查

开始前确认：**feature-spec 已就绪** + **demo 页面文件已存在**。缺 feature-spec → 引导走阶段②分支A；缺 demo → 引导走阶段①。

## 前置条件

- 必须已有 `specs/[feature]/feature-spec.md`（阶段②分支A 产出）
- 必须已有 `src/pages/{module}/` 下至少一个页面（阶段①产出）

## 核心步骤

1. 读 feature-spec + 已有代码 + 错题集 + 涉及组件的 sdesign 文档
2. 生成变更清单（types/接口/搜索/表格/操作/表单/联动），向用户确认
3. 判断范围：≤2 文件→直接改 | ≥3 文件→Task 拆解
4. 执行改造：更新 types.ts + index.ts + 页面代码
5. 验证：`pnpm verify`

## 约束

- **仅修改已有文件**，不创建新文件（新增页面应回到阶段①）
- **保留自定义逻辑**：改造是「对齐」不是「重写」
- feature-spec 中标 `[待补充]` 的部分不处理

## 输出锁

🔒 仅允许修改已有的 `src/api/{module}/` + `src/pages/{module}/` 下文件，禁止创建新文件。
