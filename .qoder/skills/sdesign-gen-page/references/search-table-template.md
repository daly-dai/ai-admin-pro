# 查询列表页代码模板

> 纯只读列表，无增删改操作。适用数据展示/报表/日志/监控等场景。

## 决策点

- **查询列表** → 纯 `SSearchTable`（无操作列、无弹窗、无删除）
- **需要增删改** → 不是本模板，走 `crud-template.md`

## 文件结构

```
src/api/{module}/types.ts     — 类型定义（Entity, EntityQuery，无需 EntityFormData）
src/api/{module}/index.ts     — API 实现（仅 getListByGet）
src/pages/{module}/index.tsx  — 列表页（纯展示）
```

## 核心组件

| 用途 | 组件           | 来源              |
| ---- | -------------- | ----------------- |
| 列表 | `SSearchTable` | `@dalydb/sdesign` |

---

## 填空模板（主路径）

> **默认使用填空模板**。模板注释已内嵌组件 API 约束和常见反例，无需额外读组件文档。仅 `pnpm verify` 报错且 `.ai/pitfalls/verify-errors.md` 未匹配签名时，才按需读对应组件文档。

### 使用方法

1. **复制下方"填空模板"** 到目标 `.tsx` 文件中。
2. **对 AI 发出指令**：
   > "请根据以下需求，**只修改**代码中所有 `@FILL` 标记的内容，**严禁修改任何其他已存在的代码**。需求：页面标题为'操作日志'，API 函数名为 `getLogListByGet`，实体类型为 `Log`，搜索项包括操作人(operator)和操作类型(type)，表格列包括操作人、操作类型、IP地址、操作时间。"
3. `pnpm verify` 报错时 → 先查 .ai/pitfalls/verify-errors.md 匹配签名 → 未匹配才读组件文档。

### 填空模板 — index.tsx

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import type {
  SSearchTableRef,
  SColumnsType,
  SFormItems,
} from '@dalydb/sdesign';
import { SSearchTable } from '@dalydb/sdesign';
import { useRef } from 'react';
// @FILL: 导入 API 函数
// ✅ import { getListByGet } from 'src/api/{module}';
// @FILL: 导入类型 — 必须用 import type
// ✅ import type { Product, ProductQuery } from 'src/api/{module}/types';
// ❌ import { Product }（类型导入必须加 type 关键字）

export default () => {
  const tableRef = useRef<SSearchTableRef>(null);

  // ⚠️ 必须用显式类型注解，否则 TS2322 报错
  // ✅ const columns: SColumnsType<Product> = [...]
  // ❌ const columns = [...]   // 缺类型注解
  // @FILL: 将 Record<string, unknown> 替换为实际实体类型
  const columns: SColumnsType<Record<string, unknown>> = [
    // @FILL: 表格列配置（无操作列）
    // ✅ { title: '名称', dataIndex: 'name' }
    // ✅ { title: '时间', dataIndex: 'createTime', render: 'datetime' }
    // ✅ { title: '状态', dataIndex: 'status', dictKey: 'statusCode' }  // 枚举列用 dictKey
    // ❌ { title: '状态', dataIndex: 'status', render: (text) => text === 1 ? '启用' : '禁用' }  // 禁止硬编码枚举
    // ❌ render: (text, record) => ...  // 未使用参数不加 _ 前缀 → ESLint 报错
  ];

  // ⚠️ 必须用显式类型注解
  // ✅ const searchItems: SFormItems[] = [...]
  const searchItems: SFormItems[] = [
    // @FILL: 搜索项配置
    // ✅ { label: '名称', name: 'name', type: 'input' }
    // ✅ { label: '状态', name: 'status', type: 'select', fieldProps: { dictKey: 'statusCode' } }
    // ❌ { label: '状态', name: 'status', type: 'select', fieldProps: { options: [...] } }  // 禁止硬编码 options
    // 可选 type: input | select | datePicker | datePickerRange
  ];

  return (
    <SSearchTable
      ref={tableRef}
      headTitle={{ children: '@FILL:页面标题' }}
      // @FILL: 替换为列表 API 函数引用
      // ✅ requestFn={getListByGet}
      requestFn={() => Promise.resolve({ dataList: [], totalSize: 0 })}
      formProps={{
        items: searchItems,
        columns: 3,
      }}
      tableProps={{
        columns: columns,
        rowKey: '@FILL:主键字段', // 通常为 'id'
      }}
      // ⚠️ paginationFields 的 key 是 current 不是 pageNum
      // ✅ paginationFields: { current: 'pageNum', total: 'totalSize', list: 'records' }
      // ❌ paginationFields: { pageNum: 'pageNum' }  // pageNum 不是合法 key → TS 报错
    />
  );
};
```
