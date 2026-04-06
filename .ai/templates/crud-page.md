# Prompt: 生成基于 @dalydb/sdesign 的 CRUD 页面

> 组件库文档参考: `.ai/sdesign/components/`

## 输出格式

```
## 分析
[分析接口定义，确定页面类型和组件]

## 计划
[列出要生成的文件清单]

## 执行
[生成代码，直接输出完整文件内容]

## 验证
[执行 pnpm verify，报告结果]
```

## 使用方式

提供接口定义，AI 生成完整 CRUD 页面代码。

## 接口定义模板

模块名: [MODULE_NAME]
基础路径: [BASE_PATH]

### 接口列表

1. 获取列表 - GET [LIST_PATH] - 参数: [QUERY_PARAMS] - 响应: [RESPONSE_TYPE]
2. 获取详情 - GET [DETAIL_PATH] - 参数: [URL_PARAMS] - 响应: [RESPONSE_TYPE]
3. 创建 - POST [CREATE_PATH] - 参数: [BODY_PARAMS] - 响应: [RESPONSE_TYPE]
4. 更新 - PUT [UPDATE_PATH] - 参数: [URL_PARAMS, BODY_PARAMS] - 响应: [RESPONSE_TYPE]
5. 删除 - DELETE [DELETE_PATH] - 参数: [URL_PARAMS]

### 类型定义

[TYPE_DEFINITIONS]

## 生成规范

### 文件结构

- `src/api/[module]/types.ts` - 类型定义
- `src/api/[module]/index.ts` - API实现
- `src/pages/[module]/index.tsx` - 列表页 (SSearchTable 或 STable + SForm.Search + useSearchTable)
- `src/pages/[module]/create.tsx` - 新增页 (SForm)
- `src/pages/[module]/edit.tsx` - 编辑页 (SForm)
- `src/pages/[module]/detail.tsx` - 详情页 (SDetail)

### 核心组件

- **列表页**: SSearchTable (推荐) 或 STable + SForm.Search + useSearchTable
- **表单页**: SForm (items 配置式)
- **详情页**: SDetail (items 配置式)
- **按钮**: SButton / SButton.Group (actionType 预设)
- **标题**: STitle

### SForm 控件类型

input | inputNumber | password | textarea | select | slider | radio | radioGroup | switch | treeSelect | upload | datePicker | SDatePicker | datePickerRange | SDatePickerRange | timePicker | timePickerRange | checkbox | checkGroup | cascader | SCascader | table | dependency

### STable 列配置

- `dictKey`: 字典映射 key
- `render`: 支持 'datetime' | 'date' | 'ellipsis' 快捷类型

## 快速示例

```typescript
// 列表页
<SSearchTable
  headTitle={{ children: '用户管理' }}
  requestFn={api.getUsers}
  formProps={{ items: searchItems, columns: 3 }}
  tableProps={{ columns, rowKey: 'id' }}
/>

// 表单页
<SForm
  items={[
    { label: '姓名', name: 'name', type: 'input', required: true },
    { label: '状态', name: 'status', type: 'select', fieldProps: { options } },
  ]}
  columns={2}
  onFinish={save}
/>

// 详情页
<SDetail
  title="用户详情"
  dataSource={data}
  items={[
    { label: '姓名', name: 'name' },
    { label: '状态', name: 'status', type: 'dict', dictKey: 'userStatus' },
  ]}
  column={2}
/>
```

## useRequest 用法示例

### 列表页删除操作

```tsx
const { run: handleDelete } = useRequest(deleteByDelete, {
  manual: true,
  onSuccess: () => {
    message.success('删除成功');
    actionRef.current?.reload();
  },
});
```

### 新增表单

```tsx
const { run: handleCreate, loading: submitLoading } = useRequest(createByPost, {
  manual: true,
  onSuccess: () => {
    message.success('创建成功');
    navigate(-1);
  },
});
const onFinish = (values: [Entity]FormData) => { handleCreate(values); };
```

### 编辑表单

```tsx
const { data: detail } = useRequest(() => getByIdByGet(id!), { ready: !!id });
const { run: handleUpdate, loading: submitLoading } = useRequest(
  (values: Partial<[Entity]FormData>) => updateByPut(id!, values),
  { manual: true, onSuccess: () => { message.success('更新成功'); navigate(-1); } },
);
```

> ❌ 禁止手动 `useState` 管理 loading/data + `useEffect` 中直接 await，必须用 useRequest。

## 特殊列配置

```typescript
// 状态列
{ title: '状态', dataIndex: 'status', valueEnum: { active: { text: '启用', status: 'Success' }, inactive: { text: '禁用', status: 'Default' } } }

// 时间列
{ title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false }

// 操作列
{ title: '操作', valueType: 'option', render: (_, record) => [<Button key="edit">编辑</Button>, <Button key="delete" danger>删除</Button>] }
```

## 自我修正规则

生成代码后，AI 必须按照以下规则自动修正，直接输出正确代码：

### API 模块修正

参考 `.ai/self-correction/api-module.md`：

1. 修正导入：使用 `@/plugins/request`
2. 修正命名：API 对象命名为 `{module}Api`
3. 补全方法：确保包含 getList/getById/create/update/delete
4. 添加 JSDoc 注释

### 列表页修正

参考 `.ai/self-correction/list-page.md`：

1. 修正组件：使用 `SSearchTable` 或 `STable + SForm.Search`
2. 修正状态：使用 `useSearchTable` hook
3. 修正 API：调用 `getListByGet`
4. 修正按钮：使用 `SButton` + `actionType`

### 表单页修正

参考 `.ai/self-correction/form-page.md`：

1. 修正组件：使用 `SForm` + `items` 配置
2. 修正提交：创建调用 `createByPost`，编辑调用 `updateByPut`
3. 修正回填：编辑页调用 `getByIdByGet` 并 `setFieldsValue`
4. 修正按钮：使用 `SButton` + `actionType`

### 详情页修正

参考 `.ai/self-correction/detail-page.md`：

1. 修正组件：使用 `SDetail` + `items` 配置
2. 修正数据：调用 `getByIdByGet`
3. 修正布局：使用 `column` 控制列数

### 输出要求

- **直接输出修正后的完整代码**
- **不要输出修正过程说明**
- **不要输出检查清单**

> 完整 Props 定义和示例请参考: `.ai/sdesign/components/` 下对应组件文档
