/**
 * 表格预览抽屉（createDrawer 工厂封装，遵循 P001）。
 * 职责：按工作表渲染邮件安全 HTML 预览 → 选择目标插槽 → 回调 onApply 注入编辑器。
 */

import { createDrawer, SButton } from '@dalydb/sdesign';
import { Alert, Drawer, message, Select, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';

import { buildSheetEmailHtml } from './excel-to-html/toEmailHtml';
import type { ParsedSheet } from './excel-to-html/types';

const { Text } = Typography;

/** 打开预览抽屉时的入参 */
export interface TablePreviewParams {
  fileName: string;
  sheets: ParsedSheet[];
  /** 编辑器正文中可应用表格的插槽（含已注入的，用于换表） */
  tokenOptions: string[];
  /** 用户点「应用表格」后的回调（token, sheetIndex） */
  onApply: (token: string, sheetIndex: number) => void;
}

const TablePreviewDrawer = createDrawer<TablePreviewParams>(
  ({ params, open, onClose }) => {
    const { fileName, sheets, tokenOptions, onApply } = params;
    const [sheetIndex, setSheetIndex] = useState(0);
    const [selectedToken, setSelectedToken] = useState<string | undefined>(
      () => tokenOptions[0],
    );

    const selectedSheet = useMemo(() => {
      if (sheets.length === 0) {
        return undefined;
      }
      return sheets[Math.min(sheetIndex, sheets.length - 1)];
    }, [sheets, sheetIndex]);

    const preview = useMemo(() => {
      if (!selectedSheet) {
        return null;
      }
      return buildSheetEmailHtml(selectedSheet);
    }, [selectedSheet]);

    if (!preview) {
      return <Drawer open={open} title="表格预览" onClose={onClose} />;
    }

    const canApply = tokenOptions.length > 0;

    const handleApply = () => {
      if (!selectedToken || !selectedSheet) {
        return;
      }
      onApply(selectedToken, sheets.indexOf(selectedSheet));
      message.success(`已应用到 ${selectedToken}，可在正文中查看`);
      onClose();
    };

    const handleCopyHtml = async () => {
      try {
        await navigator.clipboard.writeText(preview.html);
        message.success('表格 HTML 已复制');
      } catch {
        message.error('复制失败，请手动选择复制');
      }
    };

    const warningItems = preview.warnings.slice(0, 5);

    return (
      <Drawer
        open={open}
        title={`表格样式预览：${fileName}`}
        width="min(920px, 94vw)"
        onClose={onClose}
        footer={
          <Space style={{ float: 'right' }}>
            <SButton onClick={handleCopyHtml}>复制表格 HTML</SButton>
            <SButton type="primary" disabled={!canApply} onClick={handleApply}>
              应用到插槽
            </SButton>
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Text type="secondary">工作表：</Text>
            <Select
              value={sheetIndex}
              onChange={setSheetIndex}
              style={{ width: 220 }}
              options={sheets.map((sheet, index) => ({
                label: `${sheet.name}（${sheet.rowCount} 行 × ${sheet.colCount} 列）`,
                value: index,
              }))}
            />
            <Text type="secondary">注入到插槽：</Text>
            <Select
              placeholder={canApply ? '选择正文中的插槽' : '正文中暂无插槽'}
              value={selectedToken}
              onChange={setSelectedToken}
              disabled={!canApply}
              style={{ width: 190 }}
              options={tokenOptions.map((token) => ({
                label: token,
                value: token,
              }))}
            />
          </Space>

          {preview.warnings.length > 0 && (
            <Alert
              type="warning"
              showIcon
              message={`样式降级提示（共 ${preview.warnings.length} 条）`}
              description={warningItems.map((warning) => (
                <div key={warning}>{warning}</div>
              ))}
            />
          )}

          <Text type="secondary">
            这里只预览「表格本身」的 600px
            渲染效果；整封邮件的排版请在「预览并微调邮件」中查看。
          </Text>
          <div
            style={{
              background: '#f1f5f9',
              borderRadius: 10,
              padding: '24px 16px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <iframe
              title={`${fileName}-${selectedSheet?.name ?? ''}-table-preview`}
              sandbox=""
              srcDoc={preview.html}
              style={{
                width: '100%',
                maxWidth: 760,
                height: 520,
                border: '1px solid #e5e6eb',
                borderRadius: 8,
                background: '#ffffff',
                boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
              }}
            />
          </div>
        </Space>
      </Drawer>
    );
  },
);

export default TablePreviewDrawer;
