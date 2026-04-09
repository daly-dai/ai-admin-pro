/**
 * Scaffold CLI -- 公共收集器
 *
 * 统一各生成器中重复的枚举 MAP 收集逻辑。
 */

import type {
  ColumnDef,
  DetailGroupDef,
  EnumDef,
  FormFieldDef,
  QueryParamDef,
} from './types.js';
import { toUpperSnake } from './utils.js';

// ─── 通用收集 ───

/**
 * 从任意带 enumName 属性的数组中收集枚举 MAP 导入名。
 *
 * 适用于 columns / queryParams / detailItems 等结构。
 */
export function collectEnumMaps(
  items: ReadonlyArray<{ enumName?: string }>,
): Set<string> {
  const set = new Set<string>();
  for (const item of items) {
    if (item.enumName) {
      set.add(`${toUpperSnake(item.enumName)}_MAP`);
    }
  }
  return set;
}

// ─── 场景化快捷方法 ───

/** 从列定义 + 查询参数合并收集枚举 MAP */
export function collectListEnumMaps(
  columns: ColumnDef[],
  queryParams: QueryParamDef[],
): Set<string> {
  const set = collectEnumMaps(columns);
  for (const name of collectEnumMaps(queryParams)) {
    set.add(name);
  }
  return set;
}

/** 从详情分组收集枚举 MAP */
export function collectDetailEnumMaps(groups: DetailGroupDef[]): Set<string> {
  const set = new Set<string>();
  for (const group of groups) {
    for (const name of collectEnumMaps(group.items)) {
      set.add(name);
    }
  }
  return set;
}

/**
 * 从表单字段收集枚举 MAP（通过字段名 ↔ 枚举名模糊匹配）。
 *
 * select 类型的字段会尝试在 enums 列表中查找匹配项。
 */
export function collectFormEnumMaps(
  fields: FormFieldDef[],
  enums?: EnumDef[],
): Set<string> {
  const set = new Set<string>();
  if (!enums || enums.length === 0) return set;

  for (const f of fields) {
    if (f.type !== 'select') continue;
    const matched = matchEnum(f.name, enums);
    if (matched) {
      set.add(`${toUpperSnake(matched.name)}_MAP`);
    }
  }
  return set;
}

/**
 * 模糊匹配：字段名 ↔ 枚举名。
 *
 * 返回匹配到的 EnumDef 或 undefined。
 */
export function matchEnum(
  fieldName: string,
  enums: EnumDef[],
): EnumDef | undefined {
  const fl = fieldName.toLowerCase();
  return enums.find((e) => {
    const el = e.name.toLowerCase();
    return (
      el.includes(fl) || fl.includes(el.replace('contract', '').toLowerCase())
    );
  });
}
