# Prompt: 生成详情页 (基于 @dalydb/sdesign)

> 组件库文档参考: `.ai/sdesign/components/SDetail.md`

## 使用方式

提供详情页接口定义，AI 生成详情页面代码。

## 页面信息模板

页面名称: [PAGE_NAME]
页面路由: [PAGE_ROUTE]/:id
页面描述: [PAGE_DESCRIPTION]

## 接口定义模板

### 接口列表

1. 获取详情 - GET [DETAIL_PATH]/:id - 响应: DetailType
2. 删除（如需要）- DELETE [DELETE_PATH]/:id

### 类型定义

[数据类型定义]

## 页面布局

- 布局方式: [card | tabs | steps]
- 操作按钮: [编辑 | 删除 | 返回列表]

## 展示内容

[描述需要展示哪些字段，如何分组]

## 生成规范

### 文件结构

- `pages/[page-name]/[id]/index.tsx` - 详情页面

### 核心组件

- **SDetail**: 详情展示（items 配置式）
- **SDetail.Group**: 分组详情
- **STitle**: 页面标题
- **SButton**: 操作按钮

### SDetailItem 类型

- `type`: 'text' | 'dict' | 'file' | 'img' | 'rangeTime' | 'checkbox' | 'empty' | 'placeholder'
- `dictKey`: 字典 key（配合 SConfigProvider）
- `dictMap`: 直接提供字典数据
- `render`: 自定义渲染函数

## 快速示例

```tsx
import { SDetail, SDetailItem } from '@dalydb/sdesign';

const items: SDetailItem[] = [
  { label: '订单号', name: 'orderNo' },
  { label: '状态', name: 'status', type: 'dict', dictKey: 'orderStatus' },
  { label: '金额', name: 'amount' },
  { label: '附件', name: 'files', type: 'file' },
  { label: '图片', name: 'images', type: 'img' },
];

// 基础用法
<SDetail title="订单详情" dataSource={data} items={items} column={2} />

// 分组展示
<SDetail.Group
  groupItems={[
    { groupTitle: '基本信息', items: [...] },
    { groupTitle: '金额信息', items: [...] }
  ]}
/>
```

## 自我修正规则

生成代码后，AI 必须按照以下规则自动修正，直接输出正确代码：

参考 `.ai/self-correction/detail-page.md`：

1. 修正组件：使用 `SDetail` + `items` 配置，不使用 `Descriptions`
2. 修正导入：从 `@dalydb/sdesign` 导入组件
3. 修正数据：调用 `{module}Api.getById` 获取详情
4. 修正按钮：使用 `SButton.Group` + `actionType` 预设
5. 修正布局：使用 `column` 控制列数（通常为 2）

### 输出要求

- **直接输出修正后的完整代码**
- **不要输出修正过程说明**
- **不要输出检查清单**

> 完整 Props 定义和示例请参考: `.ai/sdesign/components/SDetail.md`
