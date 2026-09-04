/**
 * 预览结合抽屉（Task 6，createDrawer 封装，P001；Content 关闭即卸载）。
 *
 * 用途：把「模板 + 所选报表表格注入 {{table}}」组装成整封邮件预览（发送前检查）：
 * - 顶部只读展示 主题/收件人/抄送（取自模板，不展示邮箱——userInfo 口径）；
 * - 「结合报表」下拉仅列可查看报表（service 已过滤），默认当前选中/最近发布；
 * - 信纸 = 模板正文 + 所选报表保真表格（excel→html 内核），可点按微调；
 * - 发送（主按钮）：确认框（收件人数 + 附件名）→ mock 发送 → toast + console payload
 *   → 关闭抽屉。无保存/下载/复制动作；模板与报表数据不变（无保存语义）。
 */
import type { SDetailItem } from '@dalydb/sdesign';
import { createDrawer, SButton, SDetail } from '@dalydb/sdesign';
import {
  Alert,
  Drawer,
  Empty,
  message,
  Modal,
  Segmented,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import { useEffect, useRef, useState } from 'react';

import { parseExcelFile } from '../excel-to-html/parseExcel';
import { buildSheetEmailHtml } from '../excel-to-html/toEmailHtml';
import { sendMailByPost } from '../service/mailSender';
import { downloadReportByPost } from '../service/reportService';
import type { MailTemplate, Report, ReportMeta } from '../service/types';
import styles from './index.module.css';
import {
  buildSendPayload,
  injectTableHtml,
  summarizeRecipients,
} from './payload';

const { Text } = Typography;

/** 打开抽屉入参 */
export interface MailPreviewParams {
  template: MailTemplate;
  /** 可查看的报表列表（service 已按 canView 过滤，按更新时间新→旧） */
  reports: ReportMeta[];
  /** 默认结合报表（当前正在查看的报表 id；缺省取最近发布） */
  defaultReportId?: string;
}

function base64ToFile(base64: string, fileName: string): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  return new File([blob], fileName, { type: blob.type });
}

/** 顶部只读元信息：主题/收件人/抄送 */
function MetaHeader({ template }: { template: MailTemplate }) {
  const items: SDetailItem[] = [
    { label: '主题', render: () => <Text strong>{template.name}</Text> },
    { label: '收件人', render: () => template.recipients.join('、') },
    {
      label: '抄送',
      render: () => (template.cc.length > 0 ? template.cc.join('、') : '—'),
    },
  ];
  return (
    <div className={styles.metaCard}>
      <SDetail
        items={items}
        dataSource={{}}
        columns="minmax(160px,1.1fr) minmax(0,1fr) minmax(0,1fr)"
        gap={12}
        colon={false}
      />
    </div>
  );
}

const MailPreviewDrawer = createDrawer<MailPreviewParams>(
  ({ params, open, onClose }) => {
    const { template, reports, defaultReportId } = params;
    const paperRef = useRef<HTMLDivElement>(null);

    const [selectedReportId, setSelectedReportId] = useState<
      string | undefined
    >(() => defaultReportId ?? reports[0]?.id);
    const [selectedReport, setSelectedReport] = useState<Report | undefined>(
      undefined,
    );
    const [combinedHtml, setCombinedHtml] = useState('');
    const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
      'loading',
    );
    const [loadError, setLoadError] = useState('');
    /** 宽度模式：full=贴合公司邮件全宽正文（默认）；mail=通用邮件客户端 600px 内容区 */
    const [widthMode, setWidthMode] = useState<'full' | 'mail'>('full');

    /** 结合报表变化 → 取最新文件 → 解析 → 注入 {{table}} → 信纸 */
    useEffect(() => {
      let cancelled = false;
      setLoadState('loading');
      setSelectedReport(undefined);
      setCombinedHtml('');
      if (!selectedReportId) {
        setLoadState('error');
        setLoadError('暂无报表可结合');
      } else {
        const full = downloadReportByPost(selectedReportId);
        if (!full) {
          setLoadState('error');
          setLoadError('报表不存在或已无查看权限');
        } else {
          setSelectedReport(full);
          void (async () => {
            try {
              const file = base64ToFile(full.fileBase64, full.name);
              const parsed = await parseExcelFile(file);
              const sheet = parsed.sheets[0];
              if (!sheet) {
                throw new Error('报表中没有可展示的工作表');
              }
              if (cancelled) {
                return;
              }
              const tableHtml = buildSheetEmailHtml(
                sheet,
                widthMode === 'mail'
                  ? undefined
                  : { preserveWidth: true, stretchToWidth: true },
              ).html;
              setCombinedHtml(injectTableHtml(template.bodyHtml, tableHtml));
              setLoadState('ready');
            } catch (error) {
              if (!cancelled) {
                setLoadError(
                  error instanceof Error ? error.message : '报表解析失败',
                );
                setLoadState('error');
              }
            }
          })();
        }
      }
      return () => {
        cancelled = true;
      };
    }, [selectedReportId, template, widthMode]);

    const readPaperBody = (): string => {
      const node = paperRef.current;
      if (!node || node.innerHTML.trim() === '') {
        return combinedHtml;
      }
      return node.innerHTML;
    };

    const handleSend = () => {
      if (!selectedReport) {
        return;
      }
      const summary = summarizeRecipients(template.recipients, template.cc);
      Modal.confirm({
        title: '确认发送',
        content: `将向 ${summary.total} 位收件人发送邮件（主送 ${summary.to}、抄送 ${summary.cc}），附件：${selectedReport.name}`,
        okText: '发送',
        okButtonProps: { danger: false },
        async onOk() {
          const payload = buildSendPayload({
            subject: template.name,
            to: template.recipients,
            cc: template.cc,
            bodyHtml: readPaperBody(),
            attachmentName: selectedReport.name,
            attachmentContent: selectedReport.fileBase64,
          });
          const result = await sendMailByPost(payload);
          console.log('[mail-template] 发送 payload', result.payload);
          message.success('发送成功（mock）');
          onClose();
        },
      });
    };

    let stage;
    if (reports.length === 0) {
      stage = <Empty description="暂无报表可结合（先上传 xlsx）" />;
    } else if (loadState === 'loading') {
      stage = (
        <div className={styles.loadingWrap}>
          <Spin tip="正在结合报表表格…">
            <div style={{ minHeight: 60 }} />
          </Spin>
        </div>
      );
    } else if (loadState === 'error') {
      stage = (
        <Alert
          type="error"
          message="无法结合报表"
          description={loadError}
          showIcon
        />
      );
    } else {
      stage = (
        <>
          <div className={styles.paperWrap}>
            <div
              ref={paperRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              dangerouslySetInnerHTML={{ __html: combinedHtml }}
              className={`${styles.paper}${
                widthMode === 'mail' ? ` ${styles.paperMail}` : ''
              }`}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {widthMode === 'mail'
                ? '邮件宽（600px）——通用邮件客户端内容区上限，超宽会被截断/滚动。'
                : '全宽——贴合公司邮件正文宽度；表格按原始列宽展示，超宽可横向滚动。'}
            </Text>
          </div>
        </>
      );
    }

    return (
      <Drawer
        open={open}
        title="预览结合效果：发送前检查"
        width="100%"
        onClose={onClose}
        styles={{ body: { overflowX: 'hidden' } }}
        footer={
          <Space style={{ float: 'right' }}>
            <SButton onClick={onClose}>关闭</SButton>
            <SButton
              type="primary"
              disabled={!selectedReport || loadState !== 'ready'}
              onClick={handleSend}
            >
              发送
            </SButton>
          </Space>
        }
      >
        <MetaHeader template={template} />
        {reports.length > 0 && (
          <div className={styles.combineRow}>
            <span className={styles.combineLabel}>结合报表</span>
            <Select
              className={styles.combineSelect}
              size="middle"
              value={selectedReportId}
              onChange={(value) => setSelectedReportId(value)}
              options={reports.map((report) => ({
                value: report.id,
                label: report.name,
              }))}
            />
            <span className={styles.hint}>下拉切换其他可查看报表</span>
            <Segmented
              value={widthMode}
              onChange={(value) => setWidthMode(value as 'full' | 'mail')}
              options={[
                { label: '全宽', value: 'full' },
                { label: '邮件宽 600px', value: 'mail' },
              ]}
              size="middle"
            />
          </div>
        )}
        {stage}
      </Drawer>
    );
  },
);

export default MailPreviewDrawer;
