/**
 * Scaffold CLI -- 字段推导规则表
 *
 * 将 inferFormType / inferRequired 中的 if-else 链替换为声明式规则数组，
 * 新增推导规则只需追加一行，零侵入核心逻辑。
 */

type RawObj = Record<string, unknown>;

// ─── FormType 推导 ───

interface FormTypeRule {
  /** 判断条件 */
  condition: (field: RawObj) => boolean;
  /** 匹配时返回的 SForm 控件类型 */
  type: string;
}

/** 表单控件推导规则（按优先级排列，首条匹配即返回） */
export const FORM_TYPE_RULES: FormTypeRule[] = [
  {
    condition: (f) => !!(f.enum || f.enumName),
    type: 'select',
  },
  {
    condition: (f) => f.type === 'number',
    type: 'inputNumber',
  },
  {
    condition: (f) => f.type === 'boolean',
    type: 'switch',
  },
  // ── 扩展示例（取消注释即可生效）──
  // { condition: (f) => typeof f.name === 'string' && /date|time/i.test(f.name), type: 'datePicker' },
  // { condition: (f) => typeof f.name === 'string' && /remark|desc|note/i.test(f.name), type: 'textArea' },
];

/** 未命中任何规则时的默认控件类型 */
export const DEFAULT_FORM_TYPE = 'input';

/**
 * 使用规则表推导 SForm 控件类型。
 *
 * @param fieldDef 顶层 fields 中对应的字段定义（RawObj 格式）
 */
export function inferFormTypeByRules(fieldDef: RawObj): string {
  for (const rule of FORM_TYPE_RULES) {
    if (rule.condition(fieldDef)) return rule.type;
  }
  return DEFAULT_FORM_TYPE;
}

// ─── Required 推导 ───

interface RequiredRule {
  /** 判断条件 */
  condition: (field: RawObj) => boolean;
  /** 匹配时返回的 required 值 */
  value: boolean;
}

/** 必填性推导规则 */
export const REQUIRED_RULES: RequiredRule[] = [
  {
    condition: (f) => f.required === true,
    value: true,
  },
  {
    condition: (f) =>
      Array.isArray(f.rules) &&
      (f.rules as RawObj[]).some((r) => r.required === true),
    value: true,
  },
];

/**
 * 使用规则表推导字段是否必填。
 *
 * @param fieldDef 顶层 fields 中对应的字段定义
 * @returns true/false/undefined（undefined 表示无法确定）
 */
export function inferRequiredByRules(fieldDef: RawObj): boolean | undefined {
  for (const rule of REQUIRED_RULES) {
    if (rule.condition(fieldDef)) return rule.value;
  }
  return undefined;
}
