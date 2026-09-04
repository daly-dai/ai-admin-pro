/**
 * templateCrud 纯函数测试（不可变数组操作，id/时间注入）。
 */
import { describe, expect, it } from 'vitest';

import {
  createTemplateRecord,
  filterTemplatesByKeyword,
  removeTemplateRecord,
  updateTemplateRecord,
} from './templateCrud';
import type { MailTemplate } from './types';

function makeTemplate(overrides: Partial<MailTemplate>): MailTemplate {
  return {
    id: 'template-1',
    name: '周报',
    recipients: ['a@x.com'],
    cc: [],
    bodyHtml: '<p>{{table}}</p>',
    canUpload: true,
    updatedAt: 1000,
    ...overrides,
  };
}

const INPUT = {
  name: '月报',
  recipients: ['a@x.com', 'b@y.cn'],
  cc: ['c@z.io'],
  bodyHtml: '<p>正文{{table}}</p>',
};

describe('createTemplateRecord', () => {
  it('追加实体：注入 id/now、默认 canUpload=true', () => {
    const list = createTemplateRecord([], INPUT, { id: 'new-1', now: 42 });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: 'new-1',
      name: '月报',
      recipients: ['a@x.com', 'b@y.cn'],
      cc: ['c@z.io'],
      bodyHtml: '<p>正文{{table}}</p>',
      canUpload: true,
      updatedAt: 42,
    });
  });

  it('入参数组拷贝（外部改 input 不影响已存实体）', () => {
    const input = { ...INPUT, recipients: ['a@x.com'] };
    const list = createTemplateRecord([], input, { id: 'new-1', now: 1 });
    input.recipients.push('evil@x.com');
    expect(list[0].recipients).toEqual(['a@x.com']);
  });

  it('原数组不可变', () => {
    const origin = [makeTemplate({})];
    const next = createTemplateRecord(origin, INPUT, { id: 'new-1', now: 1 });
    expect(origin).toHaveLength(1);
    expect(next).toHaveLength(2);
  });
});

describe('updateTemplateRecord', () => {
  it('命中项更新 + updatedAt=now，其他项不变', () => {
    const origin = [
      makeTemplate({ id: 'a', updatedAt: 1000 }),
      makeTemplate({ id: 'b', updatedAt: 1000 }),
    ];
    const next = updateTemplateRecord(origin, {
      id: 'a',
      patch: { name: '新名' },
      now: 2000,
    });
    expect(next.find((item) => item.id === 'a')).toMatchObject({
      name: '新名',
      updatedAt: 2000,
    });
    expect(next.find((item) => item.id === 'b')).toMatchObject({
      name: '周报',
      updatedAt: 1000,
    });
  });

  it('未命中 → 返回原数组（引用相等，便于门面判不存在）', () => {
    const origin = [makeTemplate({})];
    expect(
      updateTemplateRecord(origin, {
        id: 'nope',
        patch: { name: 'x' },
        now: 9,
      }),
    ).toBe(origin);
  });
});

describe('removeTemplateRecord', () => {
  it('只删命中 id', () => {
    const origin = [
      makeTemplate({ id: 'a' }),
      makeTemplate({ id: 'b' }),
      makeTemplate({ id: 'c' }),
    ];
    expect(removeTemplateRecord(origin, 'b').map((item) => item.id)).toEqual([
      'a',
      'c',
    ]);
  });
});

describe('filterTemplatesByKeyword', () => {
  const origin = [
    makeTemplate({ id: 'a', name: '经营数据周报' }),
    makeTemplate({ id: 'b', name: '财务月报' }),
  ];

  it('无关键字 → 全量', () => {
    expect(filterTemplatesByKeyword(origin)).toHaveLength(2);
    expect(filterTemplatesByKeyword(origin, '  ')).toHaveLength(2);
  });

  it('按名称包含匹配（忽略大小写）', () => {
    expect(
      filterTemplatesByKeyword(origin, '数据').map((item) => item.id),
    ).toEqual(['a']);
    expect(filterTemplatesByKeyword(origin, 'WEEKLY')?.length).toBe(0);
  });

  it('未命中 → 空数组', () => {
    expect(filterTemplatesByKeyword(origin, '不存在的')).toEqual([]);
  });
});
