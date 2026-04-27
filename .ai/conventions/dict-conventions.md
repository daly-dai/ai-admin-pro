# 字典使用规范

> AI 生成涉及枚举/下拉/回显的代码前必须遵循。**字典加载逻辑（API 调用、初始化时机）不在 AI 关心范围内。**

## 核心事实

- 字典统一存放在 `useDictStore.dictMapData`，类型 `Record<string, Record<string, string>>`
- 通过 `<SConfigProvider globalDict={dictMapData}>` 全局注入
- 每个 dict 的 key 就是字典编码（与后端 `dictItem` 对应）
- 单字典结构：`{ dictKey: dictValue }`，如 `{ "1": "启用", "0": "禁用" }`

## AI 生成规则

| 场景                      | 正确做法                                                                 | 禁止做法                                                            |
| ------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| SSearchTable 枚举列       | 列配置中显式设置 `dictKey: 'dictCode'`，由 STable 从 globalDict 解析回显 | 硬编码 `const statusMap = {1:'启用'}` 或省略 `dictKey` 期望自动匹配 |
| SForm/SForm.Search 下拉框 | items 中通过 `fieldProps: { dictKey: 'dictCode' }` 指定字典编码          | items 中写死 `options: [...]` 或省略 `dictKey` 期望按 name 自动匹配 |
| 手动获取字典值            | `const dictMapData = useDictStore(state => state.dictMapData)`           | 在组件里发请求                                                      |
| 展示枚举文本              | `dictMapData?.['statusCode']?.[record.status] ?? '-'`                    | `{1:'启用'}[v]`                                                     |
| 需要某个 dict 的全部值    | `dictMapData?.['dictCode']` → `Record<string, string>`                   | 从 props 传                                                         |

## 字段名 → dict code 约定

| 字段名模式               | 对应 `dictMapData` 的 key     |
| ------------------------ | ----------------------------- |
| `status` / `{xxx}Status` | `status`                      |
| `{xxx}Type`              | `{xxx}Type`                   |
| `{xxx}Code`              | `{xxx}Code`（字段名直接对应） |
| 其他枚举字段             | 字段名本身作为 key            |

> 如果 `dictMapData` 中找不到对应 key，AI 不要自己编造——问用户该字段对应哪个 dict。
