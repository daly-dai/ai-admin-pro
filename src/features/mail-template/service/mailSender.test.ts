/**
 * mailSender 测试：延迟后成功 + 完整回显 payload（Q13/Q22 口径）。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { sendMailByPost } from './mailSender';
import type { SendMailPayload } from './types';

const PAYLOAD: SendMailPayload = {
  to: ['a@x.com', 'b@y.cn'],
  cc: ['c@z.io'],
  subject: '经营数据周报',
  bodyHtml: '<p>正文</p><table><tr><td>1</td></tr></table>',
  attachments: [{ name: '报表.xlsx', content: 'UEsFBg==' }],
};

afterEach(() => {
  vi.useRealTimers();
});

describe('sendMailByPost', () => {
  it('延迟后 resolve：success=true 且完整回显 payload', async () => {
    vi.useFakeTimers();
    const pending = sendMailByPost(PAYLOAD);
    await vi.advanceTimersByTimeAsync(600);
    await expect(pending).resolves.toEqual({ success: true, payload: PAYLOAD });
  });

  it('延迟结束前不 resolve', async () => {
    vi.useFakeTimers();
    let settled = false;
    const pending = sendMailByPost(PAYLOAD).then(() => {
      settled = true;
    });
    await vi.advanceTimersByTimeAsync(300);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(300);
    await pending;
    expect(settled).toBe(true);
  });
});
