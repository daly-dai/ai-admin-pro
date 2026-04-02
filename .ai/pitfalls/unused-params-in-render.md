# P003：Table columns render 回调中未使用参数的处理

> 错误类型：ESLint 规范 | 影响范围：所有包含 Table columns 的页面

## 错误写法（❌）

render 回调中声明了参数但未使用，触发 ESLint `no-unused-vars` 或 `@typescript-eslint/no-unused-vars` 报错：

```tsx
// ❌ text 未使用，ESLint 报错
{
  title: '操作',
  dataIndex: 'action',
  render: (text, record) => (
    <SButton onClick={() => handleEdit(record.id)}>编辑</SButton>
  ),
}

// ❌ text 和 record 都未使用
{
  title: '操作',
  render: (text, record, index) => (
    <SButton onClick={() => handleAdd()}>新增</SButton>
  ),
}
```

**常见错误修复方式（也是错的）**：

```tsx
// ❌ 用 void 消除警告 — 增加无意义代码
render: (text, record) => {
  void text;
  return <SButton onClick={() => handleEdit(record.id)}>编辑</SButton>;
}

// ❌ 用 eslint-disable 注释 — 掩盖问题
// eslint-disable-next-line @typescript-eslint/no-unused-vars
render: (text, record) => (...)
```

## 正确写法（✅）

未使用的参数前加 `_` 前缀，ESLint 默认忽略以 `_` 开头的参数：

```tsx
// ✅ 只用 record，text 加 _ 前缀
{
  title: '操作',
  dataIndex: 'action',
  render: (_text, record) => (
    <SButton onClick={() => handleEdit(record.id)}>编辑</SButton>
  ),
}

// ✅ 只用 index，text 和 record 都加 _ 前缀
{
  title: '序号',
  render: (_text, _record, index) => index + 1,
}

// ✅ 只用 record，text 直接用 _
{
  title: '操作',
  render: (_, record) => (
    <Space>
      <SButton onClick={() => handleEdit(record.id)}>编辑</SButton>
      <SButton onClick={() => handleDelete(record.id)} danger>删除</SButton>
    </Space>
  ),
}
```

## 规则总结

| 场景                       | 写法                             |
| -------------------------- | -------------------------------- |
| 只用 `record`              | `(_, record) => ...`             |
| 只用 `index`               | `(_text, _record, index) => ...` |
| `text` 和 `record` 都不用  | `() => ...`                      |
| 回调函数中任何未使用的参数 | 前加 `_` 前缀                    |

## 原因

1. ESLint 的 `@typescript-eslint/no-unused-vars` 规则默认配置 `argsIgnorePattern: '^_'`，以 `_` 开头的参数不会报错
2. 这是 TypeScript/JavaScript 社区的通用约定，类似 Go 语言的 `_` 占位符
3. 比 `void`、`eslint-disable` 等方式更简洁、更符合规范

## 适用范围

此规则不仅适用于 Table columns 的 render，**适用于所有回调函数中未使用的参数**：

```tsx
// Array.map/filter/forEach
items.map((_item, index) => index);

// 事件处理
onChange={(_e, value) => setValue(value)}

// Promise
promise.catch((_error) => fallback());
```
