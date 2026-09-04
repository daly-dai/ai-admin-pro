/**
 * mail-template service 层公共类型。
 * 设计约束：零 any；模型与 PRD「数据模型」一致（真实后端形状，接后端时只换实现、签名不变）。
 */

/** 邮件模板（含"文件夹"概念：删除模板 = 连其全部报表一并删除） */
export interface MailTemplate {
  id: string;
  /** 名称 = 邮件主题 */
  name: string;
  /** 收件人（通讯录多选选中的 userInfo 列表，形如 张三/112233；真实后端按 userInfo 换邮箱） */
  recipients: string[];
  /** 抄送（同上为 userInfo 列表；可为空） */
  cc: string[];
  /** 富文本正文（保存校验：恰好 1 个 {{table}}） */
  bodyHtml: string;
  /** 创建时选择的预设正文标识（可选） */
  presetId?: string;
  /** 文件夹权限（演示）：false → 不能上传报表 */
  canUpload: boolean;
  updatedAt: number;
}

/** 新建/编辑模板入参（表单数据形状，不含服务端生成字段） */
export interface MailTemplateInput {
  name: string;
  recipients: string[];
  cc: string[];
  bodyHtml: string;
  presetId?: string;
  canUpload?: boolean;
}

/** 报表文件（模板专属文件夹内） */
export interface Report {
  id: string;
  templateId: string;
  /** 含 .xlsx 扩展名；附件名 = 报表名 */
  name: string;
  type: 'xlsx';
  /** 最新 xlsx base64（发布后为 exceljs 回写导出结果） */
  fileBase64: string;
  /** false → service 层不返回（列表消失，接口过滤语义，PRD 功能五） */
  canView: boolean;
  /** false → 只读：可阅读/预览，不可编辑（iframe 内拦截） */
  canEdit: boolean;
  updatedAt: number;
}

/** 报表列表项：不下发文件体（真实后端语义——列表只给元数据，取文件走 download） */
export type ReportMeta = Omit<Report, 'fileBase64'>;

/** 邮件发送 payload（PRD 数据模型；to/cc 为 userInfo，真实后端换取邮箱后发信） */
export interface SendMailPayload {
  /** 收件人 userInfo 列表（真实后端按 userInfo 解析出邮箱） */
  to: string[];
  /** 抄送 userInfo 列表 */
  cc: string[];
  /** 主题 = 模板名 */
  subject: string;
  /** {{table}} 已替换为所选报表保真表格 */
  bodyHtml: string;
  /** 附件 = 当前报表最新 xlsx（附件名 = 报表名） */
  attachments: { name: string; content: string }[];
}

/** mock 存储快照 */
export interface MailDbState {
  templates: MailTemplate[];
  reports: Report[];
}

/** 上传结果（同名覆盖确认流程：conflict → 前端确认 → 带 overwrite 重试，PRD Q26） */
export type UploadReportResult =
  | { status: 'conflict' }
  | { status: 'created'; report: ReportMeta }
  | { status: 'overwritten'; report: ReportMeta };
