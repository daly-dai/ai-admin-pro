/**
 * 预览/发送 payload 纯函数之 seam 测试（Task 6）。
 *
 * 只测可独立验证的纯逻辑：
 *  1. injectTableHtml —— {{table}} 注入替换（段落拆合、HTML 不转义、无占位符兜底追加）；
 *  2. buildSendPayload —— payload 组装形状（to/cc 副本、bodyHtml、attachments 有/无分支）；
 *  3. summarizeRecipients —— 收件人统计（确认框「将向 N 位收件人发送」数据源）。
 * 不测：预览抽屉 UI、报表下拉、确认框交互、信纸微调、发送时序（走验收走查）。
 */
import { describe, expect, it } from 'vitest';

import {
  buildSendPayload,
  injectTableHtml,
  summarizeRecipients,
} from './payload';

const TABLE_HTML =
  '<table role="presentation"><tbody><tr><td style="background-color:#C00000;">1</td></tr></tbody></table>';

describe('injectTableHtml —— {{table}} 注入替换', () => {
  it('把表格注入 {{table}} 占位，正文前后文字保留', () => {
    const result = injectTableHtml('<p>各位同事：{{table}}</p>', TABLE_HTML);
    expect(result).toContain('各位同事：');
    expect(result).toContain(TABLE_HTML);
    expect(result).not.toContain('{{table}}');
  });

  it('占位符独立成段时整段替换为表格（不留空段落）', () => {
    const result = injectTableHtml(
      '<p>前言</p><p>{{table}}</p><p>结束</p>',
      TABLE_HTML,
    );
    expect(result).toContain('<p>前言</p>');
    expect(result).toContain(TABLE_HTML);
    expect(result).toContain('<p>结束</p>');
    expect(result).not.toContain('<p></p>');
  });

  it('表格 HTML 原样注入，不做任何转义（&lt; 等不出现）', () => {
    const result = injectTableHtml('<p>{{table}}</p>', TABLE_HTML);
    expect(result).toContain('<table');
    expect(result).not.toContain('&lt;table');
    expect(result).not.toContain('&gt;');
  });

  it('正文无 {{table}} 占位时兜底把表格追加到文末', () => {
    const result = injectTableHtml('<p>纯文字正文</p>', TABLE_HTML);
    expect(result).toContain('<p>纯文字正文</p>');
    expect(result.endsWith(TABLE_HTML)).toBe(true);
  });
});

describe('buildSendPayload —— payload 组装形状', () => {
  const BASE = {
    subject: '经营数据周报（示例模板）',
    to: ['张三/112233', '李四/223344'],
    cc: ['王五/334455'],
    bodyHtml: '<p>正文{{table}}</p>',
    tableHtml: TABLE_HTML,
    attachmentName: '测试工具.xlsx',
    attachmentContent: 'aGVsbG8=',
  };

  it('组装完整 payload：to/cc/subject/bodyHtml/attachments', () => {
    const payload = buildSendPayload(BASE);
    expect(payload.subject).toBe(BASE.subject);
    expect(payload.to).toEqual(BASE.to);
    expect(payload.cc).toEqual(BASE.cc);
    expect(payload.bodyHtml).toContain(TABLE_HTML);
    expect(payload.bodyHtml).not.toContain('{{table}}');
    expect(payload.attachments).toEqual([
      { name: '测试工具.xlsx', content: 'aGVsbG8=' },
    ]);
  });

  it('to/cc 为入参数组副本（外部变更不影响 payload）', () => {
    const to = ['张三/112233'];
    const cc: string[] = [];
    const payload = buildSendPayload({ ...BASE, to, cc });
    to.push('追加/99');
    expect(payload.to).toEqual(['张三/112233']);
    expect(payload.cc).toEqual([]);
  });

  it('未给 tableHtml 时正文原样保留（预览微调后正文已含成品表格，不再注入）', () => {
    const payload = buildSendPayload({ ...BASE, tableHtml: undefined });
    expect(payload.bodyHtml).toBe(BASE.bodyHtml);
    expect(payload.bodyHtml).toContain('{{table}}');
  });

  it('无附件信息时 attachments 为空数组', () => {
    const payload = buildSendPayload({
      ...BASE,
      attachmentName: undefined,
      attachmentContent: undefined,
    });
    expect(payload.attachments).toEqual([]);
  });

  it('附件名与内容须成对给出（缺任一视为无附件）', () => {
    const payload = buildSendPayload({
      ...BASE,
      attachmentName: undefined,
      attachmentContent: 'aGVsbG8=',
    });
    expect(payload.attachments).toEqual([]);
  });
});

describe('summarizeRecipients —— 收件人统计（确认框数据源）', () => {
  it('仅主送时 cc 为 0', () => {
    expect(summarizeRecipients(['a/1', 'b/2'], [])).toEqual({
      to: 2,
      cc: 0,
      total: 2,
    });
  });

  it('主送 + 抄送合计总数', () => {
    expect(summarizeRecipients(['a/1'], ['c/3', 'd/4'])).toEqual({
      to: 1,
      cc: 2,
      total: 3,
    });
  });

  it('空列表稳健返回 0', () => {
    expect(summarizeRecipients([], [])).toEqual({ to: 0, cc: 0, total: 0 });
  });
});
