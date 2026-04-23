# 详情页代码模板

> 组件库文档: `.ai/sdesign/components/SDetail.md`

## 核心组件

- **SDetail**：配置式详情展示（items 数组）
- **SDetail.Group**：分组详情
- **SButton.Group**：操作按钮（actionType: edit/delete/back）

## SDetailItem 类型

| type 值       | 用途                             |
| ------------- | -------------------------------- |
| `'text'`      | 默认文本                         |
| `'dict'`      | 字典映射（配合 dictKey/dictMap） |
| `'file'`      | 文件列表                         |
| `'img'`       | 图片展示                         |
| `'rangeTime'` | 时间范围                         |
| `'checkbox'`  | 复选展示                         |

| 关键属性  | 说明                                      |
| --------- | ----------------------------------------- |
| `label`   | 字段标签                                  |
| `name`    | 字段名                                    |
| `dictKey` | 字典 key（需配合 SConfigProvider）        |
| `dictMap` | 直接提供字典 `{ value: label }`           |
| `render`  | 自定义渲染 `(value, record) => ReactNode` |

## 交互模式

- **独立页面**：字段多、需要独立路由
- **Drawer**：在列表页快速预览，使用 `createDrawer`（`@dalydb/sdesign`）封装 `{Entity}DetailDrawer`

> 弹层封装原则同 Modal（createDrawer 与 createModal 用法一致）→ 详见 `crud-page.md`「弹层封装原则」

## 快速示例

```tsx
// 基础用法
<SDetail title="详情" dataSource={data} items={items} column={2} />

// 分组展示
<SDetail.Group groupItems={[
  { groupTitle: '基本信息', items: [...] },
  { groupTitle: '金额信息', items: [...] },
]} />

// 数据加载（SDetail 无 loading 属性，用 Spin 包裹）
const { data: detail, loading } = useRequest(() => getByIdByGet(id!), { ready: !!id });
<Spin spinning={loading}>
  <SDetail dataSource={detail} items={items} column={2} />
</Spin>
```

> 完整 Props → `.ai/sdesign/components/SDetail.md`
