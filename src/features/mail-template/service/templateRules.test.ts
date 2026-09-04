/**
 * templateRules 纯函数测试。期望值 = PRD 口径文案字面量（独立于实现）。
 * 收件人/抄送语义（修订）：通讯录多选 userInfo 列表（真实后端按 userInfo 换邮箱），不再做邮箱格式校验。
 */
import { describe, expect, it } from 'vitest';

import {
  countBodyPlaceholders,
  validateBodyPlaceholderCount,
  validateUserList,
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

describe('validateUserList（收件人/抄送 = 通讯录多选 userInfo）', () => {
  it('收件人空数组 → 必填口径文案', () => {
    expect(validateUserList([], '收件人', true)).toEqual({
      ok: false,
      message: '收件人不能为空，至少选择一名用户',
    });
  });

  it('收件人 undefined → 必填口径文案', () => {
    expect(validateUserList(undefined, '收件人', true)).toEqual({
      ok: false,
      message: '收件人不能为空，至少选择一名用户',
    });
  });

  it('全部为空白项 → 视同未选', () => {
    expect(validateUserList(['  ', '\t'], '收件人', true)).toEqual({
      ok: false,
      message: '收件人不能为空，至少选择一名用户',
    });
  });

  it('合法列表 → 清洗返回（去空白、去重）', () => {
    expect(
      validateUserList(
        [' 张三/112233 ', '李四/445566', '张三/112233'],
        '收件人',
        true,
      ),
    ).toEqual({ ok: true, users: ['张三/112233', '李四/445566'] });
  });

  it('抄送为空 → 可选通过（空数组）', () => {
    expect(validateUserList([], '抄送', false)).toEqual({
      ok: true,
      users: [],
    });
  });

  it('抄送填了 → 原样通过', () => {
    expect(validateUserList(['王五/778899'], '抄送', false)).toEqual({
      ok: true,
      users: ['王五/778899'],
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
