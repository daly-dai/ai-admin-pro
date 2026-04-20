# 详情页代码模板

> 来源：manual-detail.md §2 + §6，排除了已在 SKILL.md 中覆盖的硬约束/组件速查/验证清单

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
- **Drawer**：在列表页快速预览，创建 `{Entity}DetailDrawer` 容器组件，封装 open/close 状态

> 弹层封装原则同 Modal → 详见 crud-template.md「弹层封装原则」

## 快速示例

```tsx
// 基础用法
<SDetail title="详情" dataSource={data} items={items} column={2} />

// 分组展示
<SDetail.Group groupItems={[
  { groupTitle: '基本信息', items: [...] },
  { groupTitle: '金额信息', items: [...] },
]} />

// 数据加载
const { data: detail, loading } = useRequest(() => getByIdByGet(id!), { ready: !!id });
<SDetail dataSource={detail} items={items} loading={loading} />
```

---

## 填空模板（兜底方案）

> **适用场景**：多次生成偏离预期、弱模型不稳定、或希望快速产出可运行骨架时使用。
> **原理**：将"理解规范 → 组装代码"降级为"识别 `@FILL` → 文本替换"，让模型只做填空题。

### 使用方法

1. **复制下方"填空模板"** 到目标 `.tsx` 文件中。
2. **对 AI 发出指令**：
   > "请根据以下需求，**只修改**代码中所有 `@FILL` 标记的内容，**严禁修改任何其他已存在的代码**。需求：页面标题为'商品详情'，API 详情函数名 `getGoodsByIdByGet`，详情字段包括商品名称(name)、价格(price)、库存(stock)、创建时间(createTime)、描述(description)。"

### 填空模板 — detail.tsx（独立页）

> 适用"独立页面"模式（字段多、需独立路由）。列表页快速预览优先用下方 Drawer 模板。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SDetail, SButton } from '@dalydb/sdesign';
import type { SDetailItem } from '@dalydb/sdesign';
import { Card, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @FILL: 导入 API 函数，例如 import { getByIdByGet } from 'src/api/{module}';

export default () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  // 加载详情
  const { data: detail, loading } = useRequest(
    // @FILL: 替换为详情 API，例如 () => getByIdByGet(id!)
    () => Promise.resolve({} as Record<string, unknown>),
    {
      ready: !!id,
    },
  );

  const detailItems: SDetailItem[] = [
    // @FILL: 详情项配置
    // 示例: { label: '名称', name: 'name' },
    // 可选 type: 'text'(默认) | 'dict' | 'file' | 'img' | 'rangeTime' | 'checkbox'
    // 字典映射: { label: '状态', name: 'status', type: 'dict', dictMap: { 1: '启用', 0: '禁用' } }
    // 自定义渲染: { label: '金额', name: 'amount', render: (value) => `¥${value}` }
  ];

  return (
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

### 填空模板 — {Entity}DetailDrawer.tsx（createDrawer 详情抽屉）

> 适用"Drawer"模式（列表页快速预览）。父组件通过 `ref.current.open(params)` 打开。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SDetail } from '@dalydb/sdesign';
import type { SDetailItem } from '@dalydb/sdesign';
import { Drawer, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { createDrawer } from 'src/components/DrawerContainer';
import type { DrawerChildProps } from 'src/components/DrawerContainer';
// @FILL: 导入 API 函数，例如 import { getByIdByGet } from 'src/api/{module}';

// @FILL: 定义泛型参数类型，例如 type DetailParams = { id: string };
type DetailParams = { id: string };

const DetailContent = ({ params, onClose }: DrawerChildProps<DetailParams>) => {
  // 加载详情
  const { data: detail, loading } = useRequest(
    // @FILL: 替换为详情 API，例如 () => getByIdByGet(params.id)
    () => Promise.resolve({} as Record<string, unknown>),
  );

  const detailItems: SDetailItem[] = [
    // @FILL: 详情项配置
    // 示例: { label: '名称', name: 'name' },
    // 可选 type: 'text'(默认) | 'dict' | 'file' | 'img' | 'rangeTime' | 'checkbox'
    // 字典映射: { label: '状态', name: 'status', type: 'dict', dictMap: { 1: '启用', 0: '禁用' } }
    // 自定义渲染: { label: '金额', name: 'amount', render: (value) => `¥${value}` }
  ];

  return (
    <Drawer open title="@FILL:抽屉标题" width={600} onClose={onClose}>
      <Spin spinning={loading}>
        <SDetail dataSource={detail} items={detailItems} column={1} />
      </Spin>
    </Drawer>
  );
};

// @FILL: 修改导出名称，例如 export default createDrawer<DetailParams>(DetailContent);
export default createDrawer<DetailParams>(DetailContent);
```
