# Prompt: 生成基于 @dalydb/sdesign 的 CRUD 页面

> 组件库文档参考: `.ai/core/sdesign-docs.md`

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

> 完整 Props 定义和示例请参考: `node_modules/@dalydb/sdesign/ai/llms.txt`
