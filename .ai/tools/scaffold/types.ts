/**
 * Scaffold CLI — JSON 配置类型定义
 */

// ─── 基础定义 ───

/** 字段定义 */
export interface FieldDef {
  /** 字段名，如 'contractNo' */
  name: string;
  /** TS 类型 */
  type: 'string' | 'number' | 'boolean';
  /** 中文标签，如 '合同编号' */
  label: string;
  /** 是否必填 */
  required?: boolean;
  /** 类型注释（覆盖 label） */
  comment?: string;
}

/** 枚举定义 */
export interface EnumDef {
  /** 枚举类型名，如 'ContractStatus' */
  name: string;
  /** 枚举条目 */
  entries: { value: string; label: string }[];
}

/** 查询参数定义 */
export interface QueryParamDef {
  /** 参数名 */
  name: string;
  /** TS 类型，如 'string' | '[string, string]' */
  type: string;
  /** 搜索栏标签 */
  label: string;
  /** SForm 控件类型 */
  formType: string;
  /** 关联枚举名（select 时用） */
  enumName?: string;
}

/** 非标准 API 定义 */
export interface ExtraApiDef {
  /** 方法名（不含 HTTP 后缀），如 'submitReview' */
  name: string;
  /** HTTP 方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** 路径模板，如 '/{id}/submit' */
  path: string;
  /** JSDoc 描述 */
  desc: string;
  /** URL 路径参数 */
  params?: { name: string; type: string }[];
  /** 请求体参数 */
  body?: { name: string; type: string }[];
  /** 返回类型，默认 'void' */
  response?: string;
}

// ─── 列表页 ───

/** 列定义 */
export interface ColumnDef {
  /** 字段名 */
  dataIndex: string;
  /** 列标题 */
  title: string;
  /** 列宽 */
  width?: number;
  /** 快捷 render 类型 */
  render?: 'datetime' | 'date' | 'ellipsis' | 'amount';
  /** 关联枚举（自动生成 Tag 渲染） */
  enumName?: string;
  /** 隐藏列 */
  hideInTable?: boolean;
}

/** 操作按钮定义 */
export interface ActionDef {
  /** 按钮文字 */
  label: string;
  /** SButton actionType */
  actionType: string;
  /** 处理函数名 */
  handler: string;
  /** 二次确认文案（有值则使用 Modal.confirm） */
  confirm?: string;
  /** 显示条件表达式，如 "record.status === 'draft'" */
  condition?: string;
}

/** 列表页配置 */
export interface ListPageConfig {
  /** 页面标题 */
  title: string;
  /** 搜索栏列数，默认 3 */
  searchColumns?: number;
  /** 行键，默认 'id' */
  rowKey?: string;
  /** 表格列 */
  columns: ColumnDef[];
  /** 操作列按钮 */
  actions: ActionDef[];
  /** 工具栏按钮（新增、批量操作等） */
  toolbarActions?: ActionDef[];
  /** 是否显示勾选框 */
  rowSelection?: boolean;
}

// ─── 表单 ───

/** 表单字段定义 */
export interface FormFieldDef {
  /** 字段名 */
  name: string;
  /** 字段标签 */
  label: string;
  /** SForm 控件类型 */
  type: string;
  /** 是否必填 */
  required?: boolean;
  /** 传递给控件的 props */
  fieldProps?: Record<string, unknown>;
  /** 占据列数（用于 textarea 等宽字段） */
  colSpan?: number;
}

/** 联动规则定义 */
export interface WatchRuleDef {
  /** 监听字段名 */
  watchField: string;
  /** 条件表达式，如 "value === 'lease'" */
  condition: string;
  /** 条件成立时追加的字段 */
  fields: FormFieldDef[];
}

/** 表单配置 */
export interface FormConfig {
  /** 交互模式 */
  mode: 'modal' | 'page';
  /** 表单列数，默认 2 */
  columns?: number;
  /** 表单字段 */
  fields: FormFieldDef[];
  /** 字段联动规则 */
  watchRules?: WatchRuleDef[];
}

// ─── 详情 ───

/** 详情项定义 */
export interface DetailItemDef {
  /** 字段名 */
  name: string;
  /** 字段标签 */
  label: string;
  /** SDetail ItemType */
  type?: string;
  /** 关联枚举 */
  enumName?: string;
  /** 自定义渲染函数体 */
  render?: string;
}

/** 详情分组定义 */
export interface DetailGroupDef {
  /** 分组标题 */
  title: string;
  /** 分组内详情项 */
  items: DetailItemDef[];
}

/** 详情配置 */
export interface DetailConfig {
  /** 交互模式 */
  mode: 'drawer' | 'page';
  /** 详情列数，默认 2 */
  column?: number;
  /** 分组展示 */
  groups: DetailGroupDef[];
}

// ─── 顶层配置 ───

/** request 配置（非默认时使用） */
export interface RequestConfigDef {
  prefix?: string;
  codeKey?: string;
  successCode?: number | string;
  dataKey?: string;
  msgKey?: string;
}

/** 生成场景 */
export type Scene = 'form' | 'detail' | 'list' | 'types' | 'api' | 'crud';

// ─── 场景配置接口 ───

/** form 场景：给已有模块加表单/弹框 */
export interface FormSceneConfig {
  scene: 'form';
  module: string;
  entity: string;
  label?: string;
  form: FormConfig;
  enums?: EnumDef[];
  fields?: FieldDef[];
}

/** detail 场景：给已有模块加详情抽屉/页面 */
export interface DetailSceneConfig {
  scene: 'detail';
  module: string;
  entity: string;
  label: string;
  detail: DetailConfig;
  enums?: EnumDef[];
}

/** list 场景：给已有模块加列表页 */
export interface ListSceneConfig {
  scene: 'list';
  module: string;
  entity: string;
  listPage: ListPageConfig;
  queryParams: QueryParamDef[];
  enums?: EnumDef[];
  extraApis?: ExtraApiDef[];
  /** 只需 mode，用于决定导航方式 */
  form?: Pick<FormConfig, 'mode'>;
  /** 只需 mode，用于决定导航方式 */
  detail?: Pick<DetailConfig, 'mode'>;
}

/** types 场景：只生成类型定义文件 */
export interface TypesSceneConfig {
  scene: 'types';
  module: string;
  entity: string;
  label: string;
  fields: FieldDef[];
  enums?: EnumDef[];
  queryParams?: QueryParamDef[];
  /** 只需 fields + watchRules，用于生成 FormData */
  form?: Pick<FormConfig, 'fields' | 'watchRules'>;
}

/** api 场景：只生成 API 调用层 */
export interface ApiSceneConfig {
  scene: 'api';
  module: string;
  entity: string;
  basePath: string;
  requestConfig?: RequestConfigDef;
  extraApis?: ExtraApiDef[];
}

/** crud 场景：全量生成（向后兼容） */
export interface CrudSceneConfig {
  scene?: 'crud';
  module: string;
  entity: string;
  label: string;
  basePath: string;
  requestConfig?: RequestConfigDef;
  fields: FieldDef[];
  enums?: EnumDef[];
  queryParams: QueryParamDef[];
  extraApis?: ExtraApiDef[];
  listPage: ListPageConfig;
  form: FormConfig;
  detail: DetailConfig;
}

/** 场景配置判别联合 */
export type SceneConfig =
  | FormSceneConfig
  | DetailSceneConfig
  | ListSceneConfig
  | TypesSceneConfig
  | ApiSceneConfig
  | CrudSceneConfig;

/** 向后兼容别名 */
export type ScaffoldConfig = CrudSceneConfig;
