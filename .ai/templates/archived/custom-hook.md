# Prompt: 生成自定义 Hook

## 使用方式

提供 Hook 功能描述，AI 生成自定义 Hook。

## Hook 定义模板

Hook 名称: `use[HookName]`
Hook 用途: `[功能描述]`

### 参数定义
```typescript
interface Use[HookName]Options {
  [optionName]: [optionType];  // 选项说明
}
```

### 返回值定义
```typescript
interface Use[HookName]Result {
  [returnName]: [returnType];  // 返回值说明
}
```

## 生成规范

### 文件结构
- `src/hooks/use[HookName].ts` - Hook 实现

### 代码规范
- 使用 TypeScript 严格模式
- 类型定义完整，不使用 any
- 添加 JSDoc 注释
- 可结合 ahooks 和 @dalydb/sdesign 特性

## 快速示例

```typescript
// hooks/use[HookName].ts
import { useState, useCallback } from 'react';

interface Use[HookName]Options {
  [optionName]?: [optionType];
}

interface Use[HookName]Result {
  [returnName]: [returnType];
  [actionName]: () => void;
}

/**
 * [Hook 功能描述]
 * @param options - 配置选项
 * @returns [返回值描述]
 */
export function use[HookName](options?: Use[HookName]Options): Use[HookName]Result {
  const [[state], set[State]] = useState<[StateType]>([initialValue]);

  const [actionName] = useCallback(() => {
    // [实现逻辑]
  }, [dependencies]);

  return {
    [returnName]: [state],
    [actionName],
  };
}
````