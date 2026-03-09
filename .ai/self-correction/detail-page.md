# 详情页面自我修正规则

> AI 生成详情页面后，按以下规则自动修正，直接输出正确代码

## 修正步骤（按顺序执行）

### 步骤 1: 修正组件导入
- 检查：是否从 `@dalydb/sdesign` 导入 `SDetail`, `SButton`, `STitle`
- 确保导入：`SDetail` 而非 `Descriptions` 或 `Card`

### 步骤 2: 修正详情组件使用
- 检查：是否使用 `SDetail` 组件
- 如果不是：将 `Descriptions` 或自定义布局改为 `SDetail`
- 检查：是否使用 `items` 配置式

```typescript
// 修正前
<Descriptions>
  <Descriptions.Item label="名称">{data.name}</Descriptions.Item>
</Descriptions>

// 修正后
<SDetail 
  dataSource={data}
  items={[
    { label: '名称', name: 'name' }
  ]}
/>
```

### 步骤 3: 修正数据获取
- 检查：是否调用 `{module}Api.getById` 获取详情
- 检查：是否正确获取 URL 参数 `id`

```typescript
const { id } = useParams();
const { data, loading } = useRequest(() => {module}Api.getById(id!), {
  ready: !!id,
});
```

### 步骤 4: 修正详情项配置
- 检查：`items` 是否配置完整
- 检查：字典类型字段是否使用 `type: 'dict'` + `dictKey`
- 检查：文件类型是否使用 `type: 'file'`
- 检查：图片类型是否使用 `type: 'img'`

```typescript
const items: SDetailItem[] = [
  { label: '名称', name: 'name' },
  { label: '状态', name: 'status', type: 'dict', dictKey: '{module}Status' },
  { label: '附件', name: 'files', type: 'file' },
  { label: '图片', name: 'images', type: 'img' },
];
```

### 步骤 5: 修正布局
- 检查：是否使用 `column` 控制列数（通常为 2 或 3）
- 检查：是否需要分组展示（使用 `SDetail.Group`）

### 步骤 6: 修正操作按钮
- 检查：是否使用 `SButton` 作为操作按钮
- 检查：是否有返回、编辑等操作

```typescript
<SButton.Group
  items={[
    { actionType: 'back', onClick: () => navigate('/{module}') },
    { actionType: 'edit', onClick: () => navigate(`/{module}/${id}/edit`) },
  ]}
/>
```

### 步骤 7: 修正导入路径
- 检查：API 导入路径是否为 `@/api/{module}`
- 检查：类型导入是否使用 `import type`

### 步骤 8: 修正加载状态
- 检查：是否有 `loading` 状态处理
- 检查：数据加载中是否显示 loading

## 输出格式

直接输出修正后的完整代码，格式如下：

```typescript
import React from 'react';
import { SDetail, SButton, STitle, SDetailItem } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { useNavigate, useParams } from 'react-router-dom';
import { {module}Api } from '@/api/{module}';
import type { {Entity} } from '@/api/{module}/types';

const {Module}DetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data, loading } = useRequest(() => {module}Api.getById(id!), {
    ready: !!id,
  });

  const items: SDetailItem[] = [
    { label: 'ID', name: 'id' },
    // 其他字段...
  ];

  return (
    <div>
      <STitle 
        title="{实体}详情" 
        action={
          <SButton.Group
            items={[
              { actionType: 'back', onClick: () => navigate('/{module}') },
              { actionType: 'edit', onClick: () => navigate(`/{module}/${id}/edit`) },
            ]}
          />
        }
      />
      <SDetail 
        dataSource={data}
        items={items}
        column={2}
        loading={loading}
      />
    </div>
  );
};

export default {Module}DetailPage;
```

## 分组详情特殊处理

如果详情需要分组展示，使用 `SDetail.Group`：

```typescript
<SDetail.Group
  groupItems={[
    {
      groupTitle: '基本信息',
      items: [
        { label: '名称', name: 'name' },
        { label: '编码', name: 'code' },
      ],
    },
    {
      groupTitle: '扩展信息',
      items: [
        { label: '状态', name: 'status', type: 'dict', dictKey: 'status' },
        { label: '创建时间', name: 'createTime' },
      ],
    },
  ]}
  dataSource={data}
/>
```

## 禁止事项

- 不要输出修正过程说明
- 不要输出检查清单
- 只输出最终代码
