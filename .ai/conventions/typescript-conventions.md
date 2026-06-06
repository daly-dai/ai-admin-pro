# TypeScript 编码规约

> 参考 Airbnb TypeScript Style Guide。本项目在此基础上补充实战中暴露的特定约束。

## 一、类型定义

### 递归类型

> ❌ 禁止 `ReturnType<typeof self>` 自引用——TypeScript 无法推断，隐式为 `any`。

```typescript
// ✅ 正确 — 显式接口
interface TreeNode {
  id: string;
  children?: TreeNode[];
}
const buildTree = (nodes: TreeNode[]): TreeNode[] => { ... };

// ❌ 错误
const buildTree = (nodes: TreeNode[]): ReturnType<typeof buildTree>[] => { ... };
```

### 泛型

> ❌ 禁止内联 3 层以上泛型嵌套。拆分为命名类型。

```typescript
// ✅ 正确
type PermTree = { id: string; children?: PermTree[] }[];
const data: PermTree = ...;

// ❌ 错误
const data: { id: string; children?: { id: string; children?: Record<string, unknown>[] }[] }[] = ...;
```

### 类型断言

> ✅ `as` 语法。❌ 禁止 `<Type>` 尖括号——JSX 冲突。

```typescript
// ✅ 正确
const user = data as User;

// ❌ 错误
const user = <User>data;
```

### any 与 unknown

> ❌ 禁止 `any`（G1 已有）。✅ 保底用 `unknown`，需类型守卫后才能使用。

```typescript
// ✅ 正确
function parse(input: unknown): string {
  if (typeof input === 'string') return input;
  throw new Error('expected string');
}

// ❌ 错误
function parse(input: any): string {
  return input.toString(); // 运行时可能炸
}
```

### 类型绕过

> ❌ 禁止 `@ts-ignore`。✅ 必须用 `@ts-expect-error` + 注释说明原因。

```typescript
// ✅ 正确
// @ts-expect-error — 第三方库类型定义缺失，see: github.com/xxx/issues/123
const result = untypedLib.doThing();

// ❌ 错误
// @ts-ignore
const result = untypedLib.doThing();
```

## 二、函数

### 返回值

> ✅ 函数返回值必须显式注解。`noImplicitReturns` 已开启。

```typescript
// ✅ 正确
function getUsers(): User[] { ... }

// ❌ 错误 — 隐式返回
function getUsers() { ... }
```

### 参数

> ✅ 参数 ≤ 3 个。超过用对象参数（G15）。

```typescript
// ✅ 正确
function createUser(params: { name: string; email: string; role: string }) { ... }

// ❌ 错误
function createUser(name: string, email: string, role: string, status: number) { ... }
```

### 复杂度

> ✅ 圈复杂度 ≤ 10（eslint `complexity`）。✅ 嵌套深度 ≤ 3 层（eslint `max-depth`）。

## 三、模块

### 导入

> ✅ 纯类型用 `import type`（G3 已有）。✅ 跨模块用 `src/` 别名（G4 已有）。

```typescript
// ✅ 正确
import type { User } from 'src/api/user/types';
import { getUserListByGet } from 'src/api/user';

// ❌ 错误
import { User, getUserListByGet } from '../../api/user';
```

## 四、命名

> ✅ 接口/类型用 PascalCase。✅ 变量/函数用 camelCase。✅ 常量用 UPPER_SNAKE_CASE。

```typescript
// ✅ 正确
interface UserProfile { ... }
const userList = [];
const MAX_RETRY = 3;

// ❌ 错误
interface userProfile { ... }
const UserList = [];
const maxRetry = 3;
```
