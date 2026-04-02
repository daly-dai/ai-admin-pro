# API 模块开发指南

> ⚠️ **前置条件**：
>
> 1. 阅读 `AGENTS.md` — 确认导入规则（禁止直接 axios，使用 `@/plugins/request`）
> 2. `Glob src/api/*/index.ts` — 确认模块名不冲突
> 3. Read 一个已有 API 模块 — 参考真实代码模式
>
> **命名约定、方法命名规则、类型定义模板、字段类型映射** → 详见 `.ai/conventions/api-conventions.md`（SSOT）

## 文件结构

```
src/api/{module}/types.ts  — 类型定义
src/api/{module}/index.ts  — API 实现
```

## 多后端服务配置

项目支持对接多个后端服务，每个服务可能返回不同的数据结构。使用 `createRequest` 创建独立实例：

```typescript
import { createRequest } from '@/plugins/request';

// 默认实例（向后兼容）
// import { request } from '@/plugins/request';

// 创建独立实例
export const {module}Api = createRequest({
  prefix: '/api/{module}',    // URL 前缀（baseURL）
  codeKey: 'code',            // 状态码字段名（根据后端调整）
  successCode: 200,           // 成功状态码值（根据后端调整）
  dataKey: '',                // 数据字段名（空则不解包）
  msgKey: 'message',          // 消息字段名（根据后端调整）
});
```

> 配置项完整说明 → 见 `.ai/conventions/api-conventions.md`「多后端服务配置」

## 页面中使用（useRequest）

推荐使用 ahooks 的 `useRequest`，自动处理 loading、error、data 等状态，无需手动定义多个 state。

```typescript
import { useRequest } from 'ahooks';
import {
  getListByGet,
  getByIdByGet,
  createByPost,
  deleteByDelete,
} from '@/api/[module]';

// 列表查询
const { data, loading, refresh, run } = useRequest(getListByGet, {
  defaultParams: [{ page: 1, pageSize: 10 }],
});

// 详情查询
const { data: detail } = useRequest(() => getByIdByGet(id));

// 创建
const { run: handleCreate } = useRequest(createByPost, {
  manual: true,
  onSuccess: () => {
    message.success('创建成功');
    refresh();
  },
});

// 删除
const { run: handleDelete } = useRequest(deleteByDelete, {
  manual: true,
  onSuccess: () => {
    message.success('删除成功');
    refresh();
  },
});

// 分页
const handlePageChange = (page: number, pageSize: number) => {
  run({ ...params[0], page, pageSize });
};
```

> useRequest 常用配置 → 见 `.ai/conventions/api-conventions.md`「useRequest 常用配置」

## 接口定义格式

使用 YAML 定义接口，详见：`.ai/conventions/api-conventions.md`「接口定义格式」
