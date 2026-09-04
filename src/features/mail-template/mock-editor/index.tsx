/**
 * mock 在线编辑平台页（iframe 目标，Task 5）。
 *
 * 独立路由（顶层，不带后台布局），父页工作台以 iframe 嵌入；跨 frame 通信走 postMessage
 * （协议见 PRD「postMessage mock 协议」）。
 *
 * 三态：
 *   - 阅读模式（?mode=read）：解析报表 xlsx → 只读表格（同网格渲染，cells 不可编辑）；
 *   - 编辑模式（?mode=edit && canEdit）：解析 xlsx → 可编辑表格，仅单元格值可改（文本/数字）；
 *   - 无编辑权限（?mode=edit && !canEdit）：显示「无编辑权限」错误页（mock 平台拦截形态）。
 *
 * 说明：本页只做解析/渲染/编辑收集（纯逻辑走 communication.ts seam + applyCellEdits），
 * 持久化（存回报表）由父页在工作台收到 saved 后调用 service 完成。
 */
import { Alert, Empty, Spin, Tag } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { applyCellEdits } from '../excel-to-html/applyCellEdits';
import { parseExcelFile } from '../excel-to-html/parseExcel';
import type {
  ExcelCell,
  ExcelCellStyle,
  ParsedSheet,
} from '../excel-to-html/types';
import {
  collectCellEdits,
  parseFrameMessage,
  type MockEditorInitMessage,
  type MockEditorMessage,
  type MockEditorMode,
} from './communication';
import styles from './index.module.css';

/** 画布最大内容宽（超出等比缩小，保证表格不横向撑破 iframe） */
const MAX_CONTENT_WIDTH = 960;

const FONT_FALLBACK =
  "'Microsoft YaHei','PingFang SC','Hiragino Sans GB','Helvetica Neue',Arial,sans-serif";

/** 无显式边框的边补 Excel 观感浅灰网格线（与邮件渲染一致） */
const GRIDLINE_CSS = '1px solid #d9d9d9';

const BORDER_CSS: Record<string, string> = {
  thin: '1px solid',
  hair: '1px dotted',
  medium: '2px solid',
  thick: '3px solid',
  dashed: '1px dashed',
  dotted: '1px dotted',
  double: '3px double',
  mediumDashed: '2px dashed',
  mediumDotted: '1px dotted',
  dashDot: '1px dashed',
  mediumDashDot: '2px dashed',
  dashDotDot: '1px dotted',
  mediumDashDotDot: '2px dotted',
  slantDashDot: '1px dashed',
};

const BORDER_SIDES = ['top', 'bottom', 'left', 'right'] as const;

function capSide(side: 'top' | 'bottom' | 'left' | 'right'): string {
  return side.charAt(0).toUpperCase() + side.slice(1);
}

/** base64 → File（init 下发的文件体还原为可解析 File） */
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

/** ArrayBuffer → base64（applyCellEdits 导出后回传 saved 用） */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + chunkSize),
    );
  }
  return btoa(binary);
}

type CssBag = Record<string, string | number>;

/** 字体/底色段落 */
function pushFontAndBackground(style: ExcelCellStyle, result: CssBag): void {
  result.fontFamily = style.fontName
    ? `'${style.fontName.replace(/'/g, '')}', ${FONT_FALLBACK}`
    : FONT_FALLBACK;
  if (typeof style.fontSize === 'number') {
    result.fontSize = Math.round((style.fontSize * 4) / 3);
  }
  if (style.isBold) {
    result.fontWeight = 'bold';
  }
  if (style.isItalic) {
    result.fontStyle = 'italic';
  }
  if (style.isUnderline) {
    result.textDecoration = 'underline';
  }
  if (style.isStrikethrough) {
    result.textDecoration = 'line-through';
  }
  if (style.fontColor) {
    result.color = style.fontColor;
  }
  if (style.backgroundColor) {
    result.backgroundColor = style.backgroundColor;
  }
}

/** 四边边框（无显式边框补 Excel 观感浅灰网格线） */
function pushBorders(style: ExcelCellStyle, result: CssBag): void {
  BORDER_SIDES.forEach((side) => {
    const sideStyle = style.borders?.[side]?.style;
    if (sideStyle && sideStyle !== 'none' && BORDER_CSS[sideStyle]) {
      const color = style.borders?.[side]?.color || '#000000';
      result[`border${capSide(side)}`] = `${BORDER_CSS[sideStyle]} ${color}`;
    } else {
      result[`border${capSide(side)}`] = GRIDLINE_CSS;
    }
  });
}

/** 对齐/换行/缩进段落 */
function pushAlignment(cell: ExcelCell, result: CssBag): void {
  const { style } = cell;
  let horizontal: string = cell.kind === 'number' ? 'right' : 'left';
  if (style.horizontal && style.horizontal !== 'general') {
    horizontal =
      style.horizontal === 'centerContinuous' ? 'center' : style.horizontal;
  }
  result.textAlign = horizontal;
  result.verticalAlign = style.vertical || 'middle';
  if (style.isWrapText) {
    result.whiteSpace = 'normal';
    result.wordBreak = 'break-word';
  }
  if (typeof style.indent === 'number') {
    result.paddingLeft = `${Math.min(style.indent * 8, 32)}px`;
  }
}

/** 单元格 → React 内联样式对象（尺寸/字体/边框/底色/对齐，与邮件渲染同口径；camelCase 供 style 直接用） */
function cellReactStyle(cell: ExcelCell, widthPx: number): CSSProperties {
  const result: CssBag = {};
  pushFontAndBackground(cell.style, result);
  pushBorders(cell.style, result);
  pushAlignment(cell, result);
  result.width = widthPx;
  result.minWidth = 60;
  result.boxSizing = 'border-box';
  return result as CSSProperties;
}

const MockEditorPage = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('reportId') ?? '';
  const modeParam = searchParams.get('mode');
  const mode: MockEditorMode = modeParam === 'edit' ? 'edit' : 'read';

  const [status, setStatus] = useState<
    'waiting' | 'ready' | 'error' | 'no-permission'
  >('waiting');
  const [errorText, setErrorText] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [gridValues, setGridValues] = useState<string[][]>([]);

  // refs：消息回调里读最新值，避免闭包吃到旧状态
  const fileBufferRef = useRef<ArrayBuffer | null>(null);
  const sheetRef = useRef<ParsedSheet | null>(null);
  const modeRef = useRef<MockEditorMode>(mode);
  const canEditRef = useRef(false);
  const gridValuesRef = useRef<string[][]>([]);
  const dirtyRef = useRef<Set<string>>(new Set());

  modeRef.current = mode;
  if (gridValues.length > 0) {
    gridValuesRef.current = gridValues;
  }

  const post = useCallback((message: MockEditorMessage) => {
    window.parent.postMessage(message, window.location.origin);
  }, []);

  const handleInit = useCallback(
    async (init: MockEditorInitMessage) => {
      setCanEdit(init.canEdit);
      canEditRef.current = init.canEdit;
      if (init.mode === 'edit' && !init.canEdit) {
        setStatus('no-permission');
        post({ type: 'error', code: 'NO_EDIT_PERMISSION' });
        return;
      }
      try {
        const file = base64ToFile(init.fileBase64, '报表.xlsx');
        const fileBuffer = await file.arrayBuffer();
        const parsed = await parseExcelFile(file);
        const activeSheet = parsed.sheets[0];
        if (!activeSheet) {
          throw new Error('报表中没有可展示的工作表');
        }
        const values = activeSheet.rows.map((row) =>
          row.map((cell) => cell.text),
        );
        fileBufferRef.current = fileBuffer;
        sheetRef.current = activeSheet;
        gridValuesRef.current = values;
        setGridValues(values);
        setStatus('ready');
        post({ type: 'ready' });
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : '报表解析失败');
        setStatus('error');
        post({ type: 'error', code: 'PARSE_FAILED' });
      }
    },
    [post],
  );

  const handleSaveRequest = useCallback(async () => {
    const activeSheet = sheetRef.current;
    const fileBuffer = fileBufferRef.current;
    if (modeRef.current !== 'edit' || !canEditRef.current) {
      post({ type: 'error', code: 'NO_EDIT_PERMISSION' });
      return;
    }
    if (!activeSheet || !fileBuffer) {
      post({ type: 'error', code: 'NOT_READY' });
      return;
    }
    try {
      const dirtyValues: { row: number; col: number; input: string }[] = [];
      dirtyRef.current.forEach((key) => {
        const [rowText, colText] = key.split(',');
        const row = Number(rowText);
        const col = Number(colText);
        dirtyValues.push({
          row,
          col,
          input: gridValuesRef.current[row]?.[col] ?? '',
        });
      });
      const cellEdits = collectCellEdits(activeSheet.rows, dirtyValues);
      const nextBuffer = await applyCellEdits(fileBuffer, cellEdits);
      // 以导出结果为新的编辑基座（连续多次发布时在上一版之上增量回写）
      fileBufferRef.current = nextBuffer;
      post({
        type: 'saved',
        fileBase64: arrayBufferToBase64(nextBuffer),
        updatedAt: Date.now(),
      });
      dirtyRef.current = new Set();
      setErrorText('');
    } catch (error) {
      // 值类型/越界等收集错误：留在编辑页提示并让用户修正，不回传 saved
      setErrorText(error instanceof Error ? error.message : '保存失败');
    }
  }, [post]);

  const handleCellChange = useCallback(
    (row: number, col: number, input: string) => {
      setGridValues((current) => {
        const next = current.map((rowCells) => [...rowCells]);
        next[row][col] = input;
        gridValuesRef.current = next;
        return next;
      });
      dirtyRef.current = new Set(dirtyRef.current).add(`${row},${col}`);
    },
    [],
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      const message = parseFrameMessage(event.data);
      if (message?.type === 'init') {
        void handleInit(message);
      } else if (message?.type === 'save-request') {
        void handleSaveRequest();
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [handleInit, handleSaveRequest]);

  // 挂载即上报就绪：父页收到此 ready 后下发 init（防 iframe 懒加载与父页 onLoad 的竞态）
  useEffect(() => {
    post({ type: 'ready' });
  }, [post]);

  const renderCellContent = (
    cell: ExcelCell,
    row: number,
    col: number,
  ): ReactNode => {
    if (cell.isMergedSlave) {
      return null;
    }
    const value = gridValues[row]?.[col] ?? '';
    if (mode === 'edit' && canEdit) {
      return (
        <input
          className={styles.cellInput}
          value={value}
          onChange={(event) => handleCellChange(row, col, event.target.value)}
          aria-label={`第 ${row + 1} 行第 ${col + 1} 列`}
        />
      );
    }
    return <span className={styles.cellText}>{value}</span>;
  };

  const colWidths = (activeSheet: ParsedSheet): number[] => {
    const total = activeSheet.colWidthPx.reduce((sum, width) => sum + width, 0);
    const scale = total > MAX_CONTENT_WIDTH ? MAX_CONTENT_WIDTH / total : 1;
    return activeSheet.colWidthPx.map((width) =>
      Math.max(60, Math.round(width * scale)),
    );
  };

  const renderGrid = (activeSheet: ParsedSheet): ReactNode => {
    const widths = colWidths(activeSheet);
    return (
      <table
        className={styles.grid}
        style={{ minWidth: widths.reduce((sum, width) => sum + width, 0) }}
      >
        <tbody>
          {activeSheet.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    padding: '3px 6px',
                    ...cellReactStyle(cell, widths[colIndex] ?? 60),
                  }}
                >
                  {renderCellContent(cell, rowIndex, colIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (status === 'waiting') {
    return (
      <div className={styles.center}>
        <Spin tip="等待父页面下发报表…">
          <div style={{ minHeight: 80 }} />
        </Spin>
      </div>
    );
  }

  if (status === 'no-permission') {
    return (
      <div className={styles.center}>
        <Empty description="无编辑权限">
          <div className={styles.centerText}>
            该报表为只读，可预览但不能在线编辑。
          </div>
        </Empty>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.center}>
        <Alert
          type="error"
          message="无法打开报表"
          description={errorText}
          showIcon
        />
      </div>
    );
  }

  const activeSheet = sheetRef.current;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <span className={styles.fileName} title={`报表 #${reportId}`}>
          报表 #{reportId}
        </span>
        <Tag color={mode === 'edit' ? 'blue' : 'default'}>
          {mode === 'edit' ? '编辑模式' : '阅读模式'}
        </Tag>
        <span className={styles.sheetName}>
          工作表：{activeSheet ? activeSheet.name : '—'}
        </span>
      </div>
      <div className={styles.stage}>
        {errorText ? (
          <Alert
            type="warning"
            message="有单元格未通过校验"
            description={errorText}
            showIcon
            className={styles.validateBar}
          />
        ) : null}
        {activeSheet ? renderGrid(activeSheet) : null}
      </div>
    </div>
  );
};

export default MockEditorPage;
