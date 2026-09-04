/**
 * 预览/发送 payload 组装纯函数（Task 6 seam）。
 *
 * 职责：把「模板 + 所选报表表格 + 附件」组装成真实后端形状的 SendMailPayload
 * （to/cc = userInfo 数组，真实后端按 userInfo 换邮箱发信，PRD Q13）。
 * 纯字符串操作，不含 DOM/副作用；{{table}} 注入复用 placeholder 的段落拆合逻辑。
 */

import { replaceSlotTokenWithHtml } from '../excel-to-html/placeholder';
import type { SendMailPayload } from '../service/types';

/** 组装 payload 的入参 */
export interface BuildSendPayloadArgs {
  /** 主题 = 模板名称 */
  subject: string;
  /** 收件人 userInfo 列表 */
  to: string[];
  /** 抄送 userInfo 列表（可为空） */
  cc: string[];
  /** 正文：模板正文（含 {{table}}）或预览微调后的成品正文 */
  bodyHtml: string;
  /** 所选报表的保真表格 HTML（存在则注入 {{table}}；缺省正文原样保留） */
  tableHtml?: string;
  /** 附件名（= 报表名，含 .xlsx）；缺省则无附件 */
  attachmentName?: string;
  /** 附件内容（= 报表最新 xlsx base64） */
  attachmentContent?: string;
}

/**
 * 把保真表格 HTML 注入正文的 {{table}} 占位（段落拆合、不转义标记）。
 * 正文无占位符（如预览微调已删掉）→ 兜底把表格追加到文末。
 */
export function injectTableHtml(bodyHtml: string, tableHtml: string): string {
  const injected = replaceSlotTokenWithHtml(bodyHtml, '{{table}}', tableHtml);
  return injected ?? `${bodyHtml}${tableHtml}`;
}

/** 组装完整 payload（to/cc 拷贝副本防外部变更；附件须 名+内容 成对给出） */
export function buildSendPayload(args: BuildSendPayloadArgs): SendMailPayload {
  const bodyHtml =
    args.tableHtml === undefined
      ? args.bodyHtml
      : injectTableHtml(args.bodyHtml, args.tableHtml);
  const attachments =
    args.attachmentName !== undefined && args.attachmentContent !== undefined
      ? [{ name: args.attachmentName, content: args.attachmentContent }]
      : [];
  return {
    to: [...args.to],
    cc: [...args.cc],
    subject: args.subject,
    bodyHtml,
    attachments,
  };
}

/** 收件人统计（确认框「将向 N 位收件人发送」数据源） */
export interface RecipientSummary {
  /** 主送人数 */
  to: number;
  /** 抄送人数 */
  cc: number;
  /** 合计（含抄送） */
  total: number;
}

export function summarizeRecipients(
  to: string[],
  cc: string[],
): RecipientSummary {
  const toCount = to.length;
  const ccCount = cc.length;
  return { to: toCount, cc: ccCount, total: toCount + ccCount };
}
