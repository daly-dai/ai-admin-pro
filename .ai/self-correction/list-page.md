# 列表页面自我修正规则

> AI 生成列表页面后，按以下规则自动修正，直接输出正确代码

## 修正步骤（按顺序执行）

### 步骤 1: 修正组件导入
- 检查：是否从 `@dalydb/sdesign` 导入组件
- 确保导入：`SSearchTable` 或 `STable`, `SForm`, `SButton`, `STitle`
- 确保导入：`useSearchTable` hook

### 步骤 2: 修正列表组件使用
- 检查：是否使用 `SSearchTable` 或 `STable + SForm.Search`
- 如果不是：
  - 将 `Table` 改为 `STable`
  - 将 `ProTable` 改为 `SSearchTable`
  - 搜索表单使用 `SForm.Search` 而非 `Form`

### 步骤 3: 修正状态管理
- 检查：是否使用 `useSearchTable` 管理列表状态
- 如果不是：将 `useState` + `useEffect` 改为 `useSearchTable`

```typescript
// 修正前
const [list, setList] = useState([]);
const [loading, setLoading] = useState(false);
useEffect(() => { fetchData(); }, []);

// 修正后
const { tableProps, formConfig, form } = useSearchTable({module}Api.getList, {
  paginationFields: { current: 'page', pageSize: 'pageSize', total: 'total', list: 'list' }
});
```

### 步骤 4: 修正 API 调用
- 检查：是否调用 `{module}Api.getList`
- 如果不是：将其他数据源改为 `{module}Api.getList`

### 步骤 5: 修正按钮组件
- 检查：操作按钮是否使用 `SButton`
- 如果不是：将 `Button` 改为 `SButton`
- 检查：是否使用 `actionType` 预设

```typescript
// 修正前
<Button type="primary">新增</Button>

// 修正后
<SButton actionType="create" onClick={handleCreate} />
```

### 步骤 6: 修正标题组件
- 检查：是否使用 `STitle` 作为页面标题
- 如果不是：添加 `STitle` 组件

### 步骤 7: 修正导入路径
- 检查：API 导入路径是否为 `@/api/{module}`
- 检查：类型导入是否使用 `import type`

### 步骤 8: 修正表格列配置
- 检查：是否使用 `SColumnsType` 定义列
- 检查：是否有 `rowKey` 属性（通常为 `'id'`）

## 输出格式

直接输出修正后的完整代码，格式如下：

```typescript
import React from 'react';
import { SSearchTable, SButton, STitle, SFormItems, SColumnsType } from '@dalydb/sdesign';
import { useSearchTable } from '@dalydb/sdesign/hooks';
import { {module}Api } from '@/api/{module}';
import type { {Entity}, {Entity}Query } from '@/api/{module}/types';

const {Module}Page: React.FC = () => {
  const { tableProps, formConfig, form } = useSearchTable({module}Api.getList, {
    paginationFields: {
      current: 'page',
      pageSize: 'pageSize',
      total: 'total',
      list: 'list',
    },
  });

  const searchItems: SFormItems[] = [
    // 搜索表单项
  ];

  const columns: SColumnsType<{Entity}> = [
    // 表格列配置
  ];

  return (
    <SSearchTable
      headTitle={{ children: '{模块名称}' }}
      requestFn={formConfig.onFinish}
      formProps={{ items: searchItems, form }}
      tableProps={{ columns, rowKey: 'id', ...tableProps }}
    />
  );
};

export default {Module}Page;
```

## 禁止事项

- 不要输出修正过程说明
- 不要输出检查清单
- 只输出最终代码
