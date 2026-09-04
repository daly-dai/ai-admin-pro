/**
 * mock 邮件发送：方法签名 = 真实后端形状（PRD 接口表 sendMailByPost），
 * 延迟后成功并回显完整 payload（Q13/Q22：toast + console payload 的数据源）。
 * 接真实后端时只替换本文件实现。
 */
import type { SendMailPayload } from './types';

export interface SendMailResult {
  success: true;
  payload: SendMailPayload;
}

const SEND_DELAY_MS = 500;

export function sendMailByPost(
  payload: SendMailPayload,
  delayMs: number = SEND_DELAY_MS,
): Promise<SendMailResult> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, payload }), delayMs);
  });
}
