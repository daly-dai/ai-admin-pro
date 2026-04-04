# 代码规范

> AI生成代码时必须遵循的规范

## sdesign 组件约束

> 🚫 **阻断性要求**：代码中每使用一个 sdesign 组件，**必须先 Read 该组件的文档**（`.ai/sdesign/components/{ComponentName}.md`）。
> **未读文档 = 禁止使用该组件。没有例外。**
>
> 常见需读文档：
>
> - `SSearchTable` → Read `.ai/sdesign/components/SSearchTable.md`
> - `SForm` → Read `.ai/sdesign/components/SForm.md`
> - `SButton` → Read `.ai/sdesign/components/SButton.md`
> - `SDetail` → Read `.ai/sdesign/components/SDetail.md`
> - `STable` → Read `.ai/sdesign/components/STable.md`
> - 其他 sdesign 组件同理，文档路径：`.ai/sdesign/components/{组件名}.md`
>
> ⚠️ **禁止凭记忆、猜测或参考其他 AI 生成的代码来使用 sdesign 组件的属性。文档是唯一可信来源。**

**豁免范围（仅限以下目录中的文件）**：src/pages/login/、src/pages/error/、src/pages/register/、src/layouts/、src/router/

这些属于基础设施代码，可直接使用 antd 组件。**不在上述目录中的业务页面，必须使用 sdesign 组件。**

### sdesign 与 antd 的关系

sdesign 管 CRUD 四件套（Table/Form/Button/Descriptions），antd 管其余一切。不要臆想 sdesign 不存在的组件（如 ~~SModal~~、~~SDrawer~~、~~STag~~），不确定时查阅 `.ai/sdesign/components/` 目录。

## 全局类型复用（禁止重复定义）

> 以下类型已在 `src/types/index.ts` 中全局定义，**禁止在模块 types.ts 中重新定义**。
> 响应拦截器已自动解包 `ApiResponse`，`request.get<T>()` 直接返回业务数据 `T`。

| 全局类型         | 用途                                     | 正确用法                                                    |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `PageData<T>`    | 分页响应结构                             | `request.get<PageData<Entity>>('/api/xxx', { params })`     |
| `PageQuery`      | 分页查询基类                             | `interface XxxQuery extends PageQuery { keyword?: string }` |
| `ApiResponse<T>` | 响应包装（拦截器已解包，API 层无需关心） | 不直接使用                                                  |
| `ApiError`       | 错误结构                                 | 不直接使用                                                  |

**模块 types.ts 只定义**：实体接口（`Entity`）、查询参数（`EntityQuery extends PageQuery`）、表单数据（`EntityFormData`）。

## TypeScript规范

### 1. 类型定义

```typescript
// ✅ 正确：显式定义返回类型
const get[Entity] = async (id: string): Promise<[Entity]> => {
  return request.get(`/api/[module]/${id}`);
};

// ❌ 错误：隐式类型
const get[Entity] = async (id: string) => {
  return request.get(`/api/[module]/${id}`);
};
```

### 2. 接口命名规范

```typescript
// 实体类型命名模式
interface [Entity] {}              // 实体
interface [Entity]Query {}         // 查询参数
interface [Entity]FormData {}      // 表单数据
interface [Entity]ListItem {}      // 列表项

// 示例
interface Product {}
interface ProductQuery {}
interface ProductFormData {}
```

### 3. 未使用参数处理

> 回调函数中未使用的参数必须加 `_` 前缀，ESLint 默认忽略以 `_` 开头的参数。

```typescript
// ✅ 正确：未使用的参数加 _ 前缀
render: (_, record) => <SButton onClick={() => edit(record.id)}>编辑</SButton>
render: (_text, _record, index) => index + 1
items.map((_item, index) => index)

// ❌ 错误：未使用的参数不加 _ 前缀，触发 no-unused-vars
render: (text, record) => <SButton onClick={() => edit(record.id)}>编辑</SButton>

// ❌ 错误：使用 void 或 eslint-disable 绕过
render: (text, record) => { void text; return ...; }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
render: (text, record) => ...
```

#### 命名冲突处理

当 API 模块的实体类型名与全局已有类型冲突时（如 `User` 与 `src/types/` 下的全局 `User` 类型），按以下规则处理：

1. **优先使用模块前缀** — 在 `api/[module]/types.ts` 中为实体类型添加模块前缀（如 `MgmtUser`、`SystemRole`）
2. **禁止重名覆盖** — 不可在 API 模块中定义与 `src/types/` 下同名的类型
3. **检查方法** — 生成类型前先 `Grep: export interface [EntityName]` 或 `Grep: export type [EntityName]` 确认全局无同名类型

### 3. 类型导出

```typescript
// api/[module]/types.ts
export interface [Entity] {}
export type [Entity]Status = '[status1]' | '[status2]';

// api/[module]/index.ts
export type { [Entity], [Entity]Status } from './types';
```

## React组件规范

### 1. 组件结构

```typescript
import React, { useState, useCallback } from 'react';
import { Card, Button } from 'antd';
import { useRequest } from 'ahooks';
import { [module]Api } from '@api/[module]';
import type { [Entity] } from '@api/[module]/types';
import './index.css';

// 1. Props接口
interface [ComponentName]Props {
  [entity]: [Entity];
  on[Action]?: ([entity]: [Entity]) => void;
}

// 2. 组件实现
const [ComponentName]: React.FC<[ComponentName]Props> = ({ [entity], on[Action] }) => {
  // 3. State定义
  const [expanded, setExpanded] = useState(false);

  // 4. Hooks使用 - 使用独立方法 + useRequest
import { getListByGet, createByPost } from '@/api/[module]';

const { loading, run: handleFetch } = useRequest(getListByGet, {
  manual: true,
});

  // 5. 事件处理
  const handle[Action] = useCallback(() => {
    on[Action]?.([entity]);
  }, [on[Action], [entity]]);

  // 6. 渲染
  return (
    <Card className="[component-name]">
      {/* ... */}
    </Card>
  );
};

export default [ComponentName];
```

### 2. 组件命名规范

| 类型     | 命名模式              | 示例                                        |
| -------- | --------------------- | ------------------------------------------- |
| 页面组件 | `PascalCase` + `Page` | `ProductPage`, `OrderPage`                  |
| 业务组件 | `PascalCase`          | `ProductCard`, `OrderList`                  |
| 通用组件 | `PascalCase`          | `DataTable`, `SearchForm`                   |
| 容器组件 | `{Entity}{Layer}`     | `{Entity}FormModal`, `{Entity}DetailDrawer` |
| Hooks    | `use` + `PascalCase`  | `useProductList`, `useOrderForm`            |

#### 容器组件说明

容器组件用于封装 Modal/Drawer + 内容组件，将弹层的 open/close 状态内部管理，通过 ref 暴露 `open()` 方法供外部调用。

| 场景        | 命名模式               | 职责                                |
| ----------- | ---------------------- | ----------------------------------- |
| Modal 表单  | `{Entity}FormModal`    | 封装 Modal + SForm，管理弹层状态    |
| Drawer 详情 | `{Entity}DetailDrawer` | 封装 Drawer + SDetail，管理抽屉状态 |

> 详见 `.ai/guides/crud-page.md`「弹层封装原则」章节。

### 3. 样式规范

```css
/* 组件样式文件：与组件同名 */
/* [ComponentName]/index.css */

/* 1. 使用BEM命名 */
.[component-name] {
}
.[component-name]__[element] {
}
.[component-name]--[modifier] {
}

/* 2. 避免全局样式污染 */
/* ❌ 不要这样 */
.card {
}

/* ✅ 这样 */
.product-card {
}
```

## API层规范

> 完整 API 规范（命名约定、方法命名规则、类型定义模板、createRequest 配置、useRequest 用法）
> → 详见 `.ai/conventions/api-conventions.md`（SSOT）

### 模块组织

```typescript
api/
├── [moduleA]/      # 模块A（如: product, order）
│   ├── index.ts    # API实现
│   └── types.ts    # 类型定义
├── [moduleB]/      # 模块B
│   ├── index.ts
│   └── types.ts
└── index.ts        # 统一导出
```

### 类型定义位置

```typescript
// 类型定义在 api/[module]/types.ts
// 不要在API文件中定义类型
```

## 状态管理规范

### 1. Store组织

```typescript
// stores/[domain].ts - 领域状态（如: product, order）
// stores/app.ts - 应用级状态
// stores/index.ts - 统一导出

// stores/index.ts
export { use[Domain]Store } from './[domain]';
export { useAppStore } from './app';
```

### 2. Store结构

Store 包含 State 定义、Selector（使用时计算）和 Actions 三部分。

> 完整 Store 代码模板（含 Zustand + immer + persist）见 `.ai/core/architecture.md`「状态管理规范」章节。

## 导入导出规范

### 1. 导入顺序

```typescript
// 1. React相关
import React, { useEffect, useState } from 'react';
// 2. 第三方库
import { Button, Card } from 'antd';
import { useRequest } from 'ahooks';
// 3. 绝对路径（src/）
import { [module]Api } from 'src/api/[module]';
import type { [Entity] } from 'src/api/[module]/types';
import { use[Domain]Store } from 'src/stores';
// 4. 相对路径（./）
import [ComponentName] from './components/[ComponentName]';

import './index.css';
```

### 2. 导出模式

```typescript
// 默认导出（组件）
export default [ComponentName];

// 命名导出（API、Hooks、工具函数）
export const [module]Api = {...};
export const use[Entity]List = () => {...};

// 统一导出
export * from './[module]';
export * from './app';
```

## 错误处理规范

### 1. API错误

```typescript
// 统一在 request.ts 中处理
// 组件中只处理业务错误，使用 useRequest 自动处理 loading/data/error

const { run: submit } = useRequest(createByPost, {
  manual: true,
  onSuccess: () => {
    message.success('创建成功');
  },
  onError: (error) => {
    // 只处理需要特殊处理的错误
    if (error.message.includes('[ERROR_CODE]')) {
      message.error('[错误提示]');
    }
  },
});
```

### 2. 表单验证

```typescript
<Form
  onFinish={async (values) => {
    try {
      await submit(values);
    } catch (error) {
      // 错误已在request层处理
    }
  }}
>
  <Form.Item
    name="[fieldName]"
    rules={[
      { required: true, message: '请输入[fieldLabel]' },
      { type: '[validationType]', message: '[验证失败提示]' },
    ]}
  >
    <Input />
  </Form.Item>
</Form>
```

## 注释规范

### 1. JSDoc注释

```typescript
/**
 * 获取[实体]列表
 * @param params 查询参数
 * @returns [实体]列表数据
 * @example
 * const { data } = await getListByGet({ page: 1 });
 */
const getListByGet = (params?: [Entity]Query): Promise<PageData<[Entity]>> => {...};
```

### 2. 代码注释

```typescript
// ✅ 解释"为什么"，而非"做什么"
// [业务原因说明]
const [result] = [operation]([data]);

// ❌ 不要注释显而易见的代码
// [显而易见的操作说明]
[operation]();
```

## 性能优化规范

### 1. 避免不必要的重渲染

```typescript
// ✅ 使用useMemo缓存计算结果
const filteredList = useMemo(() => {
  return list.filter((item) => item.[statusField] === '[activeValue]');
}, [list]);

// ✅ 使用useCallback缓存回调函数
const handle[Action] = useCallback(() => {
  on[Action](id);
}, [on[Action], id]);
```

### 2. 列表渲染优化

```typescript
// ✅ 使用key属性
{list.map(item => (
  <[ComponentName] key={item.id} [entity]={item} />
))}

// ✅ 大数据量使用虚拟列表
import { VirtualList } from '@components/common';
<VirtualList data={list} itemHeight={60} />
```
