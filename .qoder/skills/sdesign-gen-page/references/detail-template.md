# 详情页代码模板

> 组件库文档: `{project}/.ai/sdesign/components/SDetail.md`

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

> 弹层封装原则同 Modal（createDrawer 与 createModal 用法一致）→ 详见 `crud-template.md`「弹层封装原则」

---

## 填空模板：detail.tsx（独立页）

> 使用方法：复制到 `detail.tsx`，只修改 `@FILL` 标记内容。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SDetail, SButton } from '@dalydb/sdesign';
import type { SDetailItem } from '@dalydb/sdesign';
import { Card, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @FILL: 导入 API 函数
// ✅ import { getByIdByGet } from 'src/api/{module}';

export default () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  // 加载详情
  const { data: detail, loading } = useRequest(
    // @FILL: 替换为详情 API
    // ✅ () => getByIdByGet(id!)
    () => Promise.resolve({} as Record<string, unknown>),
    {
      ready: !!id,
    },
  );

  // ⚠️ 必须用显式类型注解
  // ✅ const detailItems: SDetailItem[] = [...]
  const detailItems: SDetailItem[] = [
    // @FILL: 详情项配置
    // ✅ { label: '名称', name: 'name' }  // 默认 type: 'text'
    // ✅ { label: '状态', name: 'status', type: 'dict', dictKey: 'statusCode' }  // 枚举优先用 dictKey（SConfigProvider 全局字典）
    // ✅ { label: '状态', name: 'status', type: 'dict', dictMap: { 1: '启用', 0: '禁用' } }  // dictMap 仅无全局字典时用
    // ❌ { label: '状态', name: 'status', render: (v) => v === 1 ? '启用' : '禁用' }  // 禁止 render 硬编码枚举
    // ✅ { label: '金额', name: 'amount', render: (value) => `¥${value}` }  // render 签名: (value?, record?) => ReactNode
    // 可选 type: 'text'(默认) | 'dict' | 'file' | 'img' | 'rangeTime' | 'checkbox'
  ];

  return (
    // ⚠️ SDetail 不支持 loading prop，用 Spin 包裹
    // ✅ <Spin spinning={loading}><SDetail ... /></Spin>
    // ❌ <SDetail loading={loading} ... />  // loading 不是合法 prop → TS 报错
    <Spin spinning={loading}>
      <Card
        title="@FILL:页面标题"
        extra={<SButton actionType="back" onClick={() => navigate(-1)} />}
      >
        <SDetail dataSource={detail} items={detailItems} column={2} />
      </Card>
    </Spin>
  );
};
```

---

## 填空模板：{Entity}DetailDrawer.tsx（createDrawer 详情抽屉）

> 使用方法：复制到 `components/{Entity}DetailDrawer.tsx`，只修改 `@FILL` 标记内容。
> 父组件通过 `ref.current.open({ id })` 打开。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SDetail, createDrawer } from '@dalydb/sdesign';
import type { SDetailItem, DrawerChildProps } from '@dalydb/sdesign';
import { Drawer, Spin } from 'antd';
import { useRequest } from 'ahooks';
// @FILL: 导入 API 函数
// ✅ import { getByIdByGet } from 'src/api/{module}';

// @FILL: 定义泛型参数类型
// ✅ type DetailParams = { id: string };
type DetailParams = { id: string };

const DetailContent = ({ params, onClose }: DrawerChildProps<DetailParams>) => {
  // 加载详情
  const { data: detail, loading } = useRequest(
    // @FILL: 替换为详情 API
    // ✅ () => getByIdByGet(params.id)
    () => Promise.resolve({} as Record<string, unknown>),
  );

  const detailItems: SDetailItem[] = [
    // @FILL: 详情项配置
    // ✅ { label: '名称', name: 'name' }
    // ✅ { label: '状态', name: 'status', type: 'dict', dictKey: 'statusCode' }  // 枚举优先用 dictKey
    // ✅ { label: '状态', name: 'status', type: 'dict', dictMap: { 1: '启用', 0: '禁用' } }  // 无全局字典时用 dictMap
    // ❌ { label: '状态', name: 'status', render: (v) => v === 1 ? '启用' : '禁用' }  // 禁止 render 硬编码枚举
    // ✅ { label: '金额', name: 'amount', render: (value) => `¥${value}` }
    // 可选 type: 'text'(默认) | 'dict' | 'file' | 'img' | 'rangeTime' | 'checkbox'
  ];

  return (
    // ⚠️ SDetail 不支持 loading prop，用 Spin 包裹
    <Drawer open title="@FILL:抽屉标题" width={600} onClose={onClose}>
      <Spin spinning={loading}>
        {/* ⚠️ SDetail.Group 顶层 prop 是 groupItems 不是 items */}
        {/* ✅ <SDetail.Group groupItems={[{ groupTitle: '基本信息', items: [...] }]}> */}
        {/* ❌ <SDetail.Group items={...}>  // items 不是顶层 prop → TS 报错 */}
        <SDetail dataSource={detail} items={detailItems} column={1} />
      </Spin>
    </Drawer>
  );
};

// @FILL: 修改导出名称
// ✅ export default createDrawer<DetailParams>(DetailContent);
export default createDrawer<DetailParams>(DetailContent);
```

> 完整 Props → `{project}/.ai/sdesign/components/SDetail.md`
