/**
 * Scaffold CLI — 配置校验（场景化）
 */

import type { Scene, SceneConfig } from './types.js';

const VALID_SCENES: Scene[] = [
  'form',
  'detail',
  'list',
  'types',
  'api',
  'crud',
];

class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(`配置校验失败:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
    this.name = 'ValidationError';
  }
}

type RawConfig = Record<string, unknown>;

const VALID_API_NAME_KEYS = new Set([
  'getList',
  'getById',
  'create',
  'update',
  'delete',
]);
const JS_IDENT_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

// ─── 通用校验 ───

function validateCommon(config: RawConfig, errors: string[]): void {
  if (!config.module || typeof config.module !== 'string') {
    errors.push('module 必填且为 string');
  }
  if (!config.entity || typeof config.entity !== 'string') {
    errors.push('entity 必填且为 string');
  } else if (!/^[A-Z][a-zA-Z0-9]*$/.test(config.entity as string)) {
    errors.push('entity 必须是 PascalCase，如 "Contract"');
  }
}

function validateApiNames(config: RawConfig, errors: string[]): void {
  if (config.apiNames == null) return;
  if (typeof config.apiNames !== 'object' || Array.isArray(config.apiNames)) {
    errors.push('apiNames 必须是对象');
    return;
  }
  const apiNames = config.apiNames as RawConfig;
  const seen = new Set<string>();
  for (const [key, value] of Object.entries(apiNames)) {
    if (!VALID_API_NAME_KEYS.has(key)) {
      errors.push(
        `apiNames 不支持 key "${key}"，允许: ${[...VALID_API_NAME_KEYS].join(', ')}`,
      );
      continue;
    }
    if (typeof value !== 'string' || value.length === 0) {
      errors.push(`apiNames.${key} 必须是非空字符串`);
      continue;
    }
    if (!JS_IDENT_RE.test(value)) {
      errors.push(`apiNames.${key} 的值 "${value}" 不是合法的 JS 标识符`);
      continue;
    }
    if (seen.has(value)) {
      errors.push(`apiNames 中存在重复值 "${value}"`);
    }
    seen.add(value);
  }
}

function validateEnums(config: RawConfig, errors: string[]): Set<string> {
  const enumNames = new Set<string>();
  if (Array.isArray(config.enums)) {
    for (const e of config.enums as RawConfig[]) {
      if (!e.name || !Array.isArray(e.entries) || e.entries.length === 0) {
        errors.push('enums 中每项必须有 name 和非空 entries');
        break;
      }
      enumNames.add(e.name as string);
    }
  }
  return enumNames;
}

// ─── 子模块校验 ───

function validateFields(config: RawConfig, errors: string[]): Set<string> {
  const fieldNames = new Set<string>();
  if (!Array.isArray(config.fields) || config.fields.length === 0) {
    errors.push('fields 必须是非空数组');
  } else {
    for (const f of config.fields as RawConfig[]) {
      if (!f.name || !f.type || !f.label) {
        errors.push('fields 中每项必须有 name, type, label');
        break;
      }
      if (!['string', 'number', 'boolean'].includes(f.type as string)) {
        errors.push(`field "${f.name}" 的 type 必须是 string/number/boolean`);
      }
      fieldNames.add(f.name as string);
    }
  }
  return fieldNames;
}

function validateQueryParams(
  config: RawConfig,
  errors: string[],
  enumNames: Set<string>,
): void {
  const hasEnumsDefined =
    Array.isArray(config.enums) && config.enums.length > 0;
  if (!Array.isArray(config.queryParams)) {
    errors.push('queryParams 必须是数组');
  } else {
    for (const q of config.queryParams as RawConfig[]) {
      if (!q.name || !q.type || !q.label || !q.formType) {
        errors.push('queryParams 中每项必须有 name, type, label, formType');
        break;
      }
      if (q.enumName && !enumNames.has(q.enumName as string)) {
        if (hasEnumsDefined) {
          errors.push(
            `queryParam "${q.name}" 引用的枚举 "${q.enumName}" 不在 enums 中`,
          );
        } else {
          console.warn(
            `[scaffold:validate] queryParam "${q.name}" 引用枚举 "${q.enumName}"，enums 未定义（迁移场景请确保已有代码中存在）`,
          );
        }
      }
    }
  }
}

function validateListPage(
  config: RawConfig,
  errors: string[],
  fieldNames: Set<string>,
  enumNames: Set<string>,
): void {
  const hasEnumsDefined =
    Array.isArray(config.enums) && config.enums.length > 0;
  const listPage = config.listPage as RawConfig | undefined;
  if (!listPage || typeof listPage !== 'object') {
    errors.push('listPage 必填');
  } else {
    if (!listPage.title) errors.push('listPage.title 必填');
    if (!Array.isArray(listPage.columns) || listPage.columns.length === 0) {
      errors.push('listPage.columns 必须是非空数组');
    } else {
      for (const col of listPage.columns as RawConfig[]) {
        // list 场景没有 fields，跳过 dataIndex 交叉检查
        if (
          fieldNames.size > 0 &&
          col.dataIndex &&
          !fieldNames.has(col.dataIndex as string) &&
          col.dataIndex !== '__actions'
        ) {
          errors.push(`listPage.columns 中 "${col.dataIndex}" 不在 fields 中`);
        }
        if (col.enumName && !enumNames.has(col.enumName as string)) {
          if (hasEnumsDefined) {
            errors.push(
              `column "${col.dataIndex}" 引用的枚举 "${col.enumName}" 不在 enums 中`,
            );
          } else {
            console.warn(
              `[scaffold:validate] column "${col.dataIndex}" 引用枚举 "${col.enumName}"，enums 未定义（迁移场景请确保已有代码中存在）`,
            );
          }
        }
      }
    }
  }
}

function validateForm(config: RawConfig, errors: string[]): void {
  const form = config.form as RawConfig | undefined;
  if (!form || typeof form !== 'object') {
    errors.push('form 必填');
  } else {
    if (!['modal', 'page'].includes(form.mode as string)) {
      errors.push('form.mode 必须是 "modal" 或 "page"');
    }
    if (!Array.isArray(form.fields) || form.fields.length === 0) {
      errors.push('form.fields 必须是非空数组');
    }
  }
}

function validateDetail(config: RawConfig, errors: string[]): void {
  const detail = config.detail as RawConfig | undefined;
  if (!detail || typeof detail !== 'object') {
    errors.push('detail 必填');
  } else {
    if (!['drawer', 'page'].includes(detail.mode as string)) {
      errors.push('detail.mode 必须是 "drawer" 或 "page"');
    }
    if (!Array.isArray(detail.groups) || detail.groups.length === 0) {
      errors.push('detail.groups 必须是非空数组');
    }
  }
}

// ─── 场景校验器 ───

function validateFormScene(config: RawConfig, errors: string[]): void {
  validateForm(config, errors);
  validateEnums(config, errors);
  validateApiNames(config, errors);
}

function validateDetailScene(config: RawConfig, errors: string[]): void {
  if (!config.label || typeof config.label !== 'string') {
    errors.push('detail 场景: label 必填');
  }
  validateDetail(config, errors);
  validateEnums(config, errors);
  validateApiNames(config, errors);
}

function validateListScene(config: RawConfig, errors: string[]): void {
  const enumNames = validateEnums(config, errors);
  validateQueryParams(config, errors, enumNames);
  // list 场景没有 fields，传空 Set 跳过 dataIndex 交叉检查
  validateListPage(config, errors, new Set(), enumNames);
  validateApiNames(config, errors);
}

function validateTypesScene(config: RawConfig, errors: string[]): void {
  if (!config.label || typeof config.label !== 'string') {
    errors.push('types 场景: label 必填');
  }
  validateFields(config, errors);
  validateEnums(config, errors);
}

function validateApiScene(config: RawConfig, errors: string[]): void {
  if (!config.basePath || typeof config.basePath !== 'string') {
    errors.push('api 场景: basePath 必填');
  }
  validateApiNames(config, errors);
}

function validateCrudScene(config: RawConfig, errors: string[]): void {
  if (!config.label || typeof config.label !== 'string') {
    errors.push('label 必填且为 string');
  }
  if (!config.basePath || typeof config.basePath !== 'string') {
    errors.push('basePath 必填且为 string');
  }

  const fieldNames = validateFields(config, errors);
  const enumNames = validateEnums(config, errors);

  if (fieldNames.size > 0) {
    validateQueryParams(config, errors, enumNames);
    validateListPage(config, errors, fieldNames, enumNames);
    validateForm(config, errors);
    validateDetail(config, errors);
  }
  validateApiNames(config, errors);
}

// ─── 入口 ───

export function validateConfig(raw: unknown): SceneConfig {
  const errors: string[] = [];
  const config = raw as RawConfig;

  // 检测场景
  const scene: Scene = (config.scene as Scene) || 'crud';
  if (!VALID_SCENES.includes(scene)) {
    errors.push(
      `scene 必须是 ${VALID_SCENES.join(' | ')} 之一，当前: "${config.scene}"`,
    );
    throw new ValidationError(errors);
  }

  // 通用校验（所有场景都需要 module + entity）
  validateCommon(config, errors);

  // 场景分派
  switch (scene) {
    case 'form':
      validateFormScene(config, errors);
      break;
    case 'detail':
      validateDetailScene(config, errors);
      break;
    case 'list':
      validateListScene(config, errors);
      break;
    case 'types':
      validateTypesScene(config, errors);
      break;
    case 'api':
      validateApiScene(config, errors);
      break;
    case 'crud':
      validateCrudScene(config, errors);
      break;
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  // 确保 scene 字段存在
  (config as RawConfig).scene = scene;

  return raw as SceneConfig;
}
