# Recipe: 常量接线自检

> 触发时机: 模块代码全部生成完成后（CRUD / Detail / Form / Dashboard 通用）
> 适用: 含 `constants/` 目录的模块
> 动作: 扫描常量文件中所有导出 → 检查每个是否被业务文件引用 → 标记未接线的常量

---

## 为什么需要

常量定义和使用是两个独立步骤（不同 Task / 不同组件），AI 生成时容易 "定义了但忘了用"。典型场景：

- `STAT_CARD_UNIT_MAP` 定义了 6 个指标的单位映射，但 StatCard 全部传入 `filterUnit`
- `CHART_COLORS` 数组定义了 16 色，但某个图表组件硬编码了颜色

本 Recipe 在生成完成后做一次全局扫描，抓住所有"断线"。

---

## 执行步骤

### 步骤 1：提取常量清单

```bash
# 提取 constants 目录中所有 export const 名称
grep -oP 'export const \K\w+' src/pages/{module}/constants/index.ts | sort
```

### 步骤 2：逐常量检查引用

对每个常量名，搜索在业务文件（组件/store/utils/mock，排除 constants 自身）中的引用：

```bash
for CONST in {步骤1的输出}; do
  matches=$(grep -rl "$CONST" src/pages/{module}/ --include="*.tsx" --include="*.ts" | grep -v "constants/")
  if [ -z "$matches" ]; then
    echo "⚠️ $CONST: 未被任何业务文件引用"
  else
    echo "✅ $CONST: $(echo $matches | wc -l) 处引用"
  fi
done
```

### 步骤 3：输出报告

```
✅ CHART_COLORS: 5 处引用
✅ THEME_COLORS: 3 处引用
✅ LEFT_COL: 2 处引用
⚠️ STAT_CARD_UNIT_MAP: 未被任何业务文件引用 → 疑似未接线
```

---

## 处理规则

| 结果             | 动作                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| 常量有引用 →     | ✅ 通过                                                                           |
| 常量无引用 →     | ⚠️ 报告用户: "{常量名} 在 constants 中定义但未被使用，确认是预留常量还是接线遗漏" |
| 常量被自身引用 → | ⚠️ 无意义自引用，同上处理                                                         |

---

## 适用场景

| 页面类型    | constants 常见内容                               |
| ----------- | ------------------------------------------------ |
| Dashboard   | 色板 + 功能色 + 布局常量 + 标签映射 + 指示器选项 |
| CRUD List   | 状态枚举映射 + 列宽常量 + 默认分页大小           |
| Detail Page | 详情项分组配置 + 格式化选项                      |
| Form Page   | 表单分组配置 + 校验规则常量                      |
