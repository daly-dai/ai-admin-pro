/**
 * Scaffold CLI -- 别名映射配置（集中管理）
 *
 * 所有"弱模型产出 → 标准格式"的别名映射均在此维护。
 * 当 AI 产生新的非标字段名或类型别名时，只需在此追加一行。
 */

import type { ActionDef } from './types.js';

// ─── 类型别名 ───

/** 字段类型别名 → 标准 TS 类型（不区分大小写匹配） */
export const TYPE_ALIASES: Record<string, string> = {
  int: 'number',
  integer: 'number',
  float: 'number',
  double: 'number',
  str: 'string',
  text: 'string',
  bool: 'boolean',
};

// ─── 字段名别名 ───

/** 列定义字段名别名 → 标准字段名 */
export const COL_ALIASES: Record<string, string> = {
  name: 'dataIndex',
  field: 'dataIndex',
  key: 'dataIndex',
  label: 'title',
  header: 'title',
};

/** 详情组标题别名 → title */
export const GROUP_TITLE_ALIASES: Record<string, string> = {
  label: 'title',
  name: 'title',
  groupTitle: 'title',
  groupName: 'title',
};

// ─── Action 相关 ───

/** 中文 action 字符串 → 预设 key */
export const CN_ACTION_MAP: Record<string, string> = {
  查看: 'detail',
  详情: 'detail',
  编辑: 'edit',
  修改: 'edit',
  删除: 'delete',
  移除: 'delete',
  新增: 'create',
  创建: 'create',
  添加: 'create',
};

/** Action 预设（英文 key → 完整 ActionDef） */
export const ACTION_PRESETS: Record<string, ActionDef> = {
  detail: { label: '详情', actionType: 'view', handler: 'handleDetail' },
  edit: { label: '编辑', actionType: 'edit', handler: 'handleEdit' },
  delete: {
    label: '删除',
    actionType: 'delete',
    handler: 'handleDelete',
    confirm: '确认删除？',
  },
  create: { label: '新增', actionType: 'create', handler: 'handleCreate' },
};

/** 由 label 反查预设 key（用于对象 action 缺字段时补全） */
export const LABEL_TO_PRESET_KEY: Record<string, string> = {
  ...CN_ACTION_MAP,
  // 英文 label 也支持
  detail: 'detail',
  view: 'detail',
  edit: 'edit',
  delete: 'delete',
  create: 'create',
};
