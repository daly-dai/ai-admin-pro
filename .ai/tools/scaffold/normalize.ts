/**
 * Scaffold CLI -- JSON 配置标准化
 *
 * 管道位置：rawJSON → preNormalize → validate → normalize → generate
 *
 * - preNormalizeConfig：validate 前的结构清洗（type 别名、null 过滤、detail 包装）
 * - normalizeConfig  ：validate 后的语义补全（字段映射、action 展开、formType 推导）
 *
 * 幂等性：对已符合 types.ts 格式的配置（如 contract.json）不产生副作用。
 */

import {
  ACTION_PRESETS,
  CN_ACTION_MAP,
  COL_ALIASES,
  GROUP_TITLE_ALIASES,
  LABEL_TO_PRESET_KEY,
  TYPE_ALIASES,
} from './alias-config.js';
import {
  inferFormTypeByRules,
  inferRequiredByRules,
} from './derivation-rules.js';
import { hasFields } from './type-guards.js';
import type { ActionDef, DetailItemDef, SceneConfig } from './types.js';

// ─── 内部类型 ───

type RawObj = Record<string, unknown>;
type FieldsMap = Map<string, RawObj>;

const LOG_TAG = '[scaffold:normalize]';

// ─── 通用工具 ───

/** 过滤数组中的 null / undefined，返回新数组 */
function filterNullish<T>(arr: unknown[]): T[] {
  return arr.filter((v): v is T => v != null);
}

/** 对 obj 做字段名重映射。仅在目标字段不存在时赋值（幂等安全） */
function aliasFields(obj: RawObj, aliasMap: Record<string, string>): void {
  for (const [from, to] of Object.entries(aliasMap)) {
    if (obj[to] == null && obj[from] != null) {
      obj[to] = obj[from];
    }
  }
}

/** 在 aliasMap 中查 value（不区分大小写），返回标准值或原值 */
function resolveAlias(value: string, aliasMap: Record<string, string>): string {
  return aliasMap[value] ?? aliasMap[value.toLowerCase()] ?? value;
}

/** 首字母大写 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── 查找表 ───

/** 从顶层 fields 构建 name → fieldDef 查找表 */
function buildFieldsMap(fields: unknown): FieldsMap {
  const map = new Map<string, RawObj>();
  if (!Array.isArray(fields)) return map;
  for (const f of fields) {
    if (f && typeof f === 'object' && typeof (f as RawObj).name === 'string') {
      map.set((f as RawObj).name as string, f as RawObj);
    }
  }
  return map;
}

// ─── 推导函数（委托给 derivation-rules.ts 规则表）───

/** 从顶层 fields 推导 SForm 控件类型 */
function inferFormType(name: string, fieldsMap: FieldsMap): string {
  const def = fieldsMap.get(name);
  if (!def) return 'input';
  return inferFormTypeByRules(def);
}

/** 从顶层 fields 推导 required */
function inferRequired(
  name: string,
  fieldsMap: FieldsMap,
): boolean | undefined {
  const def = fieldsMap.get(name);
  if (!def) return undefined;
  return inferRequiredByRules(def);
}

// ─── 转换函数 ───

/**
 * 任意输入 → ActionDef | null
 *
 * 支持：字符串预设、中文、不完整对象补全。
 * 返回 null 表示无法解析。
 */
function toActionDef(act: unknown): ActionDef | null {
  if (act == null) return null;

  // 字符串路径：英文 key / 中文 label → 预设
  if (typeof act === 'string') {
    const key = CN_ACTION_MAP[act] ?? act;
    return (
      ACTION_PRESETS[key] ?? {
        label: act,
        actionType: 't-link' as string,
        handler: `handle${capitalize(key)}`,
      }
    );
  }

  if (typeof act !== 'object') return null;

  // 对象路径：补全缺失字段
  const obj = act as RawObj;
  const label = obj.label as string | undefined;
  const presetKey = label ? LABEL_TO_PRESET_KEY[label] : undefined;
  const preset = presetKey ? ACTION_PRESETS[presetKey] : undefined;

  if (!obj.actionType) {
    obj.actionType = preset?.actionType ?? 't-link';
    if (!preset) {
      console.warn(
        `${LOG_TAG} Action 缺少 actionType，已降级为 't-link': ${JSON.stringify(act)}`,
      );
    }
  }
  if (!obj.handler) {
    obj.handler =
      preset?.handler ??
      (label ? `handle${capitalize(label)}` : 'handleUnknown');
    if (!preset) {
      console.warn(
        `${LOG_TAG} Action 缺少 handler，已自动推导: ${JSON.stringify(act)}`,
      );
    }
  }
  if (!obj.label) {
    obj.label = preset?.label ?? (obj.actionType as string);
  }
  // 从预设继承 confirm（如删除的二次确认）
  if (preset?.confirm && !obj.confirm) {
    obj.confirm = preset.confirm;
  }

  return obj as unknown as ActionDef;
}

/** 字符串或对象 → DetailItemDef（借助顶层 fields 补全 label/enumName） */
function toDetailItemDef(
  item: unknown,
  fieldsMap: FieldsMap,
): DetailItemDef | null {
  if (item == null) return null;
  if (typeof item === 'string') {
    const def = fieldsMap.get(item);
    return {
      name: item,
      label: (def?.label as string) ?? item,
      ...(def?.enumName ? { enumName: def.enumName as string } : {}),
    };
  }
  if (typeof item === 'object') return item as DetailItemDef;
  return null;
}

// ════════════════════════════════════════════════
//  preNormalize：validate 前的结构清洗
// ════════════════════════════════════════════════

/** 安全获取子对象 */
function getObj(parent: RawObj, key: string): RawObj | undefined {
  const v = parent[key];
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as RawObj)
    : undefined;
}

// ─── 路径配置化清洗 ───

/**
 * 需要过滤 null/undefined 的数组路径（支持多级嵌套）。
 * 新增嵌套数组字段只需在此追加一行，无需修改清洗逻辑。
 */
const ARRAY_PATHS: string[][] = [
  ['fields'],
  ['enums'],
  ['enums', 'entries'],
  ['queryParams'],
  ['extraApis'],
  ['extraApis', 'params'],
  ['extraApis', 'body'],
  ['listPage', 'columns'],
  ['listPage', 'actions'],
  ['listPage', 'toolbarActions'],
  ['form', 'fields'],
  ['form', 'watchRules'],
  ['form', 'watchRules', 'fields'],
  ['detail', 'groups'],
  ['detail', 'groups', 'items'],
  ['detail', 'items'],
];

/**
 * 沿 path 向下遍历，对末端数组执行 null/undefined 过滤。
 * 中间节点为数组时，对每个元素递归处理剩余路径。
 */
function cleanPath(obj: unknown, path: string[], depth = 0): void {
  if (!obj || typeof obj !== 'object') return;

  // 中间节点是数组：对每个元素递归处理剩余路径
  if (Array.isArray(obj)) {
    for (const item of obj) {
      cleanPath(item, path, depth);
    }
    return;
  }

  const current = obj as RawObj;

  if (depth === path.length - 1) {
    // 到达末端：过滤 null/undefined
    const key = path[depth];
    if (Array.isArray(current[key])) {
      current[key] = (current[key] as unknown[]).filter((v) => v != null);
    }
    return;
  }

  // 继续向下
  const key = path[depth];
  cleanPath(current[key], path, depth + 1);
}

/** 按 ARRAY_PATHS 配置清洗所有已知数组路径中的 null/undefined */
function sanitizeArrays(raw: RawObj): void {
  for (const path of ARRAY_PATHS) {
    cleanPath(raw, path);
  }
}

/** 修正 fields[].type 的常见别名（int→number 等） */
function normalizeTypeAliases(raw: RawObj): void {
  if (!Array.isArray(raw.fields)) return;
  for (const f of raw.fields as RawObj[]) {
    if (typeof f.type === 'string') {
      const resolved = resolveAlias(f.type, TYPE_ALIASES);
      if (resolved !== f.type) {
        console.warn(
          `${LOG_TAG} 字段 "${f.name}" type "${f.type}" → "${resolved}"`,
        );
        f.type = resolved;
      }
    }
  }
}

/** detail 无 groups 但有 items → 自动包装为单个 group */
function wrapDetailGroups(raw: RawObj): void {
  const detail = getObj(raw, 'detail');
  if (!detail) return;
  if (Array.isArray(detail.groups) && detail.groups.length > 0) return;

  if (Array.isArray(detail.items) && detail.items.length > 0) {
    const title = (raw.label as string) ?? '详情';
    detail.groups = [{ title, items: detail.items }];
    delete detail.items;
    console.warn(
      `${LOG_TAG} detail 无 groups，已将 items 包装为 [{ title: "${title}", items }]`,
    );
  }
}

/** queryParams 缺 formType → 从同名 field 推导 */
function inferMissingFormType(raw: RawObj): void {
  if (!Array.isArray(raw.queryParams)) return;
  const fieldsMap = buildFieldsMap(raw.fields);

  for (const q of raw.queryParams as RawObj[]) {
    if (q.formType) continue;
    if (typeof q.name !== 'string') continue;
    q.formType = inferFormType(q.name, fieldsMap);
    console.warn(
      `${LOG_TAG} queryParam "${q.name}" 缺 formType，已推导为 "${q.formType}"`,
    );
  }
}

/**
 * 预标准化入口。在 validate 前调用，就地修改原始 JSON。
 * 修正结构问题使其能通过 validate，不做语义补全。
 */
export function preNormalizeConfig(raw: Record<string, unknown>): void {
  sanitizeArrays(raw);
  normalizeTypeAliases(raw);
  wrapDetailGroups(raw);
  inferMissingFormType(raw);
}

// ════════════════════════════════════════════════
//  normalize：validate 后的语义补全
// ════════════════════════════════════════════════

function normalizeListPage(listPage: RawObj, fieldsMap: FieldsMap): void {
  // columns 标准化
  if (Array.isArray(listPage.columns)) {
    const normalized: RawObj[] = [];
    for (const raw of listPage.columns as unknown[]) {
      // 字符串简写 → 对象
      if (typeof raw === 'string') {
        const def = fieldsMap.get(raw);
        normalized.push({
          dataIndex: raw,
          title: (def?.label as string) ?? raw,
        });
        continue;
      }
      if (!raw || typeof raw !== 'object') continue;
      const col = raw as RawObj;
      aliasFields(col, COL_ALIASES);
      // 兜底：dataIndex 仍缺失则跳过
      if (!col.dataIndex) {
        console.warn(
          `${LOG_TAG} 列定义缺少 dataIndex，已跳过: ${JSON.stringify(col)}`,
        );
        continue;
      }
      // title 兜底
      if (!col.title) col.title = col.dataIndex;
      normalized.push(col);
    }
    listPage.columns = normalized;
  }

  // actions 标准化
  if (Array.isArray(listPage.actions)) {
    listPage.actions = filterNullish<ActionDef>(
      (listPage.actions as unknown[]).map(toActionDef),
    );
  }

  // toolbarActions 标准化
  if (Array.isArray(listPage.toolbarActions)) {
    listPage.toolbarActions = filterNullish<ActionDef>(
      (listPage.toolbarActions as unknown[]).map(toActionDef),
    );
  }

  // showCreate → 补充 toolbarActions
  if (listPage.showCreate) {
    const toolbar = (listPage.toolbarActions ?? []) as ActionDef[];
    const hasCreate = toolbar.some((a) => a.handler === 'handleCreate');
    if (!hasCreate) {
      toolbar.unshift(ACTION_PRESETS.create);
    }
    listPage.toolbarActions = toolbar;
    delete listPage.showCreate;
  }
}

function normalizeForm(form: RawObj, fieldsMap: FieldsMap): void {
  if (!Array.isArray(form.fields)) return;

  const normalized: RawObj[] = [];
  for (const raw of form.fields as unknown[]) {
    // 字符串简写 → 对象
    if (typeof raw === 'string') {
      const def = fieldsMap.get(raw);
      normalized.push({
        name: raw,
        label: (def?.label as string) ?? raw,
        type: inferFormType(raw, fieldsMap),
      });
      continue;
    }
    if (!raw || typeof raw !== 'object') continue;
    const f = raw as RawObj;
    // 缺 name 无法生成有效代码
    if (!f.name || typeof f.name !== 'string') {
      console.warn(
        `${LOG_TAG} 表单字段缺少 name，已跳过: ${JSON.stringify(f)}`,
      );
      continue;
    }
    if (!f.type) f.type = inferFormType(f.name, fieldsMap);
    if (f.required === undefined) {
      const req = inferRequired(f.name, fieldsMap);
      if (req !== undefined) f.required = req;
    }
    normalized.push(f);
  }
  form.fields = normalized;
}

function normalizeDetail(detail: RawObj, fieldsMap: FieldsMap): void {
  if (!Array.isArray(detail.groups)) return;
  for (const group of detail.groups as RawObj[]) {
    aliasFields(group, GROUP_TITLE_ALIASES);
    if (Array.isArray(group.items)) {
      group.items = filterNullish<DetailItemDef>(
        (group.items as unknown[]).map((item) =>
          toDetailItemDef(item, fieldsMap),
        ),
      );
    }
  }
}

/** queryParams 缺 formType 的兜底（preNormalize 可能已处理，此处保持幂等） */
function normalizeQueryParams(
  queryParams: RawObj[],
  fieldsMap: FieldsMap,
): void {
  for (const q of queryParams) {
    if (!q.formType && typeof q.name === 'string') {
      q.formType = inferFormType(q.name, fieldsMap);
    }
  }
}

// ─── 导出 ───

/**
 * 标准化入口。将 AI 友好的简写格式转换为生成器期望的严格格式。
 * 在 validate 之后、generate 之前调用。
 * 幂等：对已符合 types.ts 定义的配置不产生副作用。
 */
export function normalizeConfig(config: SceneConfig): SceneConfig {
  const raw = config as unknown as RawObj;
  const fieldsMap = buildFieldsMap(raw.fields);

  if (raw.listPage && typeof raw.listPage === 'object') {
    normalizeListPage(raw.listPage as RawObj, fieldsMap);
  }
  if (raw.form && typeof raw.form === 'object') {
    normalizeForm(raw.form as RawObj, fieldsMap);
  }
  if (raw.detail && typeof raw.detail === 'object') {
    normalizeDetail(raw.detail as RawObj, fieldsMap);
  }
  if (Array.isArray(raw.queryParams)) {
    normalizeQueryParams(raw.queryParams as RawObj[], fieldsMap);
  }

  return config;
}

/** 从 config.fields 推导 id 字段的 TS 类型，默认 'string' */
export function getIdType(config: SceneConfig): string {
  if (!hasFields(config)) return 'string';
  const idField = config.fields.find((f) => f.name === 'id');
  const type = idField?.type ?? 'string';
  if (type !== 'string' && type !== 'number') {
    console.warn(
      `${LOG_TAG} id 字段 type "${type}" 不是 string/number，已降级为 'string'`,
    );
    return 'string';
  }
  return type;
}
