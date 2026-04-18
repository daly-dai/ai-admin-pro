# pnpm verify 常见错误速查

> AI 看到 verify 错误时，先查此表再动手。匹配签名 → 执行修复方法 → 重新 verify。

| 错误签名                                         | 分类      | 修复方法                                        |
| ------------------------------------------------ | --------- | ----------------------------------------------- |
| `TS2307: Cannot find module 'src/api/{xxx}'`     | 缺文件    | 检查 src/api/{module}/index.ts 是否存在且有导出 |
| `TS2322: Type 'any' is not assignable`           | 类型违规  | 改 Record<string, unknown> 或从 Entity 推导     |
| `TS2345: Argument of type 'string'...type 'Key'` | antd 类型 | dataIndex 加 `as const` 或用 `keyof Entity`     |
| `TS2339: Property 'xxx' does not exist on type`  | 类型缺失  | 检查 types.ts 的 Entity 是否含该字段            |
| `TS7006: Parameter implicitly has 'any' type`    | 缺标注    | 给参数加类型: `(record: Entity) => ...`         |
| `TS2554: Expected N arguments, but got M`        | 参数数量  | 检查 API 方法签名是否与调用匹配                 |
| `no-unused-vars: 'text' is defined`              | 命名      | 加 `_` 前缀: `(_text, record)`                  |
| `no-restricted-imports: 'antd' import 'Table'`   | 组件违规  | 换 SSearchTable 或 STable                       |
| `prettier: ...`                                  | 格式      | `pnpm verify:fix` 自动修复                      |

## 修复规则

- 优先级: tsc > eslint > prettier
- 每轮只修同一类错误
- 最多 3 轮，仍有错误 → 停止，报告给用户
