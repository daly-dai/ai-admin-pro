/**
 * templateRules 纯函数测试。期望值 = PRD 口径文案字面量（独立于实现）。
 */
import { describe, expect, it } from 'vitest';

import {
  countBodyPlaceholders,
  parseCcInput,
  parseRecipientsInput,
  validateBodyPlaceholderCount,
} from './templateRules';

describe('countBodyPlaceholders', () => {
  it('空正文 → 0', () => {
    expect(countBodyPlaceholders('')).toBe(0);
  });

  it('恰好 1 个 → 1', () => {
    expect(countBodyPlaceholders('<p>各位好</p><p>{{table}}</p>')).toBe(1);
  });

  it('两个占位符 → 2', () => {
    expect(countBodyPlaceholders('<p>{{table}}</p><p>{{table}}</p>')).toBe(2);
  });

  it('连续两个 → 2', () => {
    expect(countBodyPlaceholders('{{table}}{{table}}')).toBe(2);
  });

  it('残缺写法不计数', () => {
    expect(countBodyPlaceholders('<p>{{table</p>')).toBe(0);
  });

  it('含空格/变形的近似 token 不计数', () => {
    expect(countBodyPlaceholders('{ {table} }')).toBe(0);
  });
});

describe('parseRecipientsInput', () => {
  it('单个合法邮箱', () => {
    expect(parseRecipientsInput('a@x.com')).toEqual({
      ok: true,
      emails: ['a@x.com'],
    });
  });

  it('逗号/分号/中文逗号/换行混用 + 去空白', () => {
    expect(parseRecipientsInput(' a@x.com ;b@y.cn，c@z.io\n d@w.cn ')).toEqual({
      ok: true,
      emails: ['a@x.com', 'b@y.cn', 'c@z.io', 'd@w.cn'],
    });
  });

  it('空输入 → 收件人必填（PRD 口径文案）', () => {
    expect(parseRecipientsInput('')).toEqual({
      ok: false,
      message: '收件人不能为空，至少填写一个邮箱',
    });
  });

  it('纯空白 → 收件人必填', () => {
    expect(parseRecipientsInput('   \n\t ')).toEqual({
      ok: false,
      message: '收件人不能为空，至少填写一个邮箱',
    });
  });

  it('含非法邮箱 → 全部列出', () => {
    expect(parseRecipientsInput('a@x.com,bad1;bad2@')).toEqual({
      ok: false,
      message: '收件人包含非法邮箱：bad1、bad2@',
    });
  });
});

describe('parseCcInput', () => {
  it('空串 → ok 空数组（抄送可选）', () => {
    expect(parseCcInput('')).toEqual({ ok: true, emails: [] });
  });

  it('纯空白 → ok 空数组', () => {
    expect(parseCcInput('   ')).toEqual({ ok: true, emails: [] });
  });

  it('合法列表 → 规范化返回', () => {
    expect(parseCcInput('m@x.com, n@y.io')).toEqual({
      ok: true,
      emails: ['m@x.com', 'n@y.io'],
    });
  });

  it('填了但非法 → 抄送口径文案', () => {
    expect(parseCcInput('oops')).toEqual({
      ok: false,
      message: '抄送包含非法邮箱：oops',
    });
  });
});

describe('validateBodyPlaceholderCount', () => {
  it('0 个 → 正文必须包含占位符', () => {
    expect(validateBodyPlaceholderCount('<p>没有表格</p>')).toEqual({
      ok: false,
      message: '正文必须包含占位符',
    });
  });

  it('≥2 个 → 不允许存在多个占位符', () => {
    expect(validateBodyPlaceholderCount('{{table}} 与 {{table}}')).toEqual({
      ok: false,
      message: '不允许存在多个占位符',
    });
  });

  it('恰好 1 个 → ok', () => {
    expect(validateBodyPlaceholderCount('<p>{{table}}</p>')).toEqual({
      ok: true,
    });
  });
});
