# 验证流程规范

> ⚠️ **验证阶段仅用于检查和修复已生成文件中的错误，禁止创建新文件或添加新功能。**

## 验证范围限制

`pnpm verify` 输出整个项目错误，但 **AI 只处理当前输出锁范围内的文件**：

| 当前阶段   | 只处理这些路径的错误                                      |
| ---------- | --------------------------------------------------------- |
| ① 画 Demo  | `src/api/{module}/` + `src/pages/{module}/`               |
| ② 接口合并 | `src/api/{module}/types.ts` + `src/api/{module}/index.ts` |
| ③ 改造适配 | `src/api/{module}/` + `src/pages/{module}/`（仅已有文件） |
| ④ 接口对接 | 用户指定的页面文件 + 对应 API 文件                        |
| ⑤ 迭代修复 | 用户指定的文件                                            |

其他模块错误在报告中列出（如「⚠️ 发现 3 个其他模块错误」），但不读取、不分析、不修复。

### 类型报错处理原则

1. **禁止绕过**：不使用 `as any`、`@ts-ignore`、`@ts-expect-error` 消除类型错误。
2. **优先推导**：从已有实体推导类型（`Partial<Entity>`、`Pick<Entity, 'id' | 'name'>`）。
3. **保底类型**：无法推导时使用 `Record<string, unknown>`，禁止 `any`。
4. **三方库类型缺失**：检查 `@types/xxx`，无则用 `declare module` 补充声明文件（`src/types/` 下）。

## 错题集对照（涉及页面代码的阶段必选）

生成页面代码前 读取 `.ai/pitfalls/index.md`，按「适用场景」匹配当前页面类型，逐条排查。

## 三级验证体系

```
Task 完成 → Level 1（自动化）→ Level 2（AI 自检）→ Level 3（人工）→ ✓
```

### Level 1：代码级验证（AI 自执行）

```bash
pnpm verify  # tsc + eslint + prettier（错误自动追加到 .ai/error-log/raw.jsonl）
```

自修复：有错误 → 按优先级修复（tsc > eslint > prettier）→ 再次 verify → 最多 3 轮。

> 涉及多模块修改时，额外执行 `pnpm verify:scope` 检查范围（软告警，不阻断）。

### Level 2：AI 自检清单

Level 1 通过后逐条检查：

- [ ] 业务页面使用 sdesign 组件（SSearchTable/SForm/SButton/SDetail），未使用不存在的 sdesign 组件
- [ ] 无 any 类型，未直接 import axios，类型导入用 `import type`
- [ ] API 方法名带 HTTP 后缀（getListByGet/createByPost 等）
- [ ] SForm 字段联动用 `SForm.useWatch` + 动态 items 条件展开（禁止 `type: 'dependency'`）
- [ ] 确认弹窗用 antd `Modal.confirm`（禁止 SConfirm）
- [ ] Modal/Drawer 使用 `createModal`/`createDrawer` 工厂函数（`@dalydb/sdesign`），禁止手动管理 open 状态
- [ ] 所有 API 调用通过 useRequest 包装（SSearchTable.requestFn 除外）
- [ ] 写操作 useRequest 配置了 onSuccess（提示 + 刷新/跳转）
- [ ] types.ts 类型完整（Entity + EntityQuery + EntityFormData）

### Level 3：业务级验证（人工）

对照 `specs/[feature]/spec.md` 验证核心功能、边界情况、联调结果。

### 失败处理

| 层级    | 处理方式                              |
| ------- | ------------------------------------- |
| Level 1 | AI 自动修复，最多 3 轮                |
| Level 2 | AI 修复后重新自检，仍不通过则报告用户 |
| Level 3 | 标记未通过，回到对应 Task 修复        |

简易场景（纯 API 模块、纯样式）可简化为 Level 1 + Level 2 核心项。
