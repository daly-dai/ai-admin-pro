/**
 * 成品邮件抽屉（createDrawer 封装，P001）。
 * 内容 = 整封邮件正文（正文 + 已注入的保真表格），以可编辑“信纸”呈现：
 * 客户可直接点按正文/表格微调；「应用微调并回到编辑器」把改动写回 wangEditor，
 * 「复制/下载」则以当前微调结果导出成品 HTML。
 */

import { createDrawer, SButton } from '@dalydb/sdesign';
import { Drawer, message, Space, Typography } from 'antd';
import { useRef } from 'react';

import { buildEmailDocument } from './excel-to-html/toEmailHtml';

const { Text } = Typography;

/** 结合预览的应用元信息：本次预览把某工作表接入某插槽 */
export interface MailApplyMeta {
  token: string;
  sheetIndex: number;
}

/** 打开抽屉入参 */
export interface MailPreviewParams {
  /** 组装后的正文（含保真表格、含变量占位符文本） */
  sourceBody: string;
  /** 应用微调：把当前信纸内容写回页面编辑器（含可选的新增绑定信息） */
  onApply: (bodyHtml: string, applyMeta?: MailApplyMeta) => void;
  /** 本次预览是否携带"新接入插槽"的绑定（结合预览模式） */
  applyMeta?: MailApplyMeta;
  /** 提示文案：说明将接入的工作表与插槽 */
  applyHint?: string;
}

const MailPreviewDrawer = createDrawer<MailPreviewParams>(
  ({ params, open, onClose }) => {
    const { sourceBody, onApply, applyMeta, applyHint } = params;
    const paperRef = useRef<HTMLDivElement>(null);

    const readCurrentBody = (): string => {
      const node = paperRef.current;
      if (!node) {
        return sourceBody;
      }
      return node.innerHTML || sourceBody;
    };

    const handleApply = () => {
      onApply(readCurrentBody(), applyMeta);
      message.success('微调已应用，可回到编辑器继续修改');
      onClose();
    };

    const handleCopy = async () => {
      const documentHtml = buildEmailDocument(readCurrentBody());
      try {
        await navigator.clipboard.writeText(documentHtml);
        message.success('成品邮件 HTML 已复制');
      } catch {
        message.error('复制失败，请手动选择复制');
      }
    };

    const handleDownload = () => {
      const documentHtml = buildEmailDocument(readCurrentBody());
      const blob = new Blob([documentHtml], {
        type: 'text/html;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '邮件正文.html';
      link.click();
      URL.revokeObjectURL(url);
      message.success('成品邮件 HTML 已下载');
    };

    return (
      <Drawer
        open={open}
        title="成品邮件：预览与微调"
        width="min(1120px, 96vw)"
        onClose={onClose}
        footer={
          <Space style={{ float: 'right' }}>
            <SButton onClick={handleCopy}>复制成品 HTML</SButton>
            <SButton onClick={handleDownload}>下载成品 HTML</SButton>
            <SButton onClick={onClose}>关闭</SButton>
            <SButton type="primary" onClick={handleApply}>
              应用微调并回到编辑器
            </SButton>
          </Space>
        }
      >
        <div
          style={{
            background: '#f1f5f9',
            margin: -24,
            padding: 24,
            minHeight: 'calc(100vh - 220px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              直接点按文字即可修改；此处所见即成品邮件效果（正文宽
              600px）。修改后点 「应用微调并回到编辑器」写回正文。
            </Text>
          </div>
          {applyHint && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 12, color: '#2563eb' }}>
                {applyHint}
              </Text>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              ref={paperRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              dangerouslySetInnerHTML={{ __html: sourceBody }}
              style={{
                width: '100%',
                maxWidth: 700,
                minHeight: '64vh',
                background: '#ffffff',
                border: '1px solid #e4e7ec',
                borderRadius: 10,
                boxShadow: '0 12px 36px rgba(15,23,42,0.1)',
                padding: '36px 44px',
                outline: 'none',
                fontFamily:
                  "'Microsoft YaHei','PingFang SC','Helvetica Neue',Arial,sans-serif",
                fontSize: 14,
                lineHeight: 1.7,
                color: '#1f2430',
                overflow: 'auto',
              }}
            />
          </div>
        </div>
      </Drawer>
    );
  },
);

export default MailPreviewDrawer;
