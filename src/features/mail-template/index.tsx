/**
 * 邮件模板页（邮件工作台）：左栏富文本撰写 + Excel 素材；右栏实时“信纸”成品预览；
 * 抽屉支持整封邮件微调（可编辑信纸）；导出邮件安全 HTML。
 */

import { FileExcelOutlined } from '@ant-design/icons';
import type { DrawerContainerRef } from '@dalydb/sdesign';
import { SButton } from '@dalydb/sdesign';
import type {
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
} from '@wangeditor/editor';
import {
  Editor as WangEditor,
  Toolbar as WangToolbar,
} from '@wangeditor/editor-for-react';
import { Alert, Select, Typography, Upload, message } from 'antd';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 运行时副作用：注册 wangEditor 内置模块与样式（须先于组件渲染）
import '@wangeditor/editor';
import '@wangeditor/editor/dist/css/style.css';

import { PARSE_LIMITS_TEXT, parseExcelFile } from './excel-to-html/parseExcel';
import type { TableBlockRange } from './excel-to-html/placeholder';
import {
  findTableTokens,
  findVariableTokens,
  listTableBlockRanges,
  replaceSlotTokenWithHtml,
} from './excel-to-html/placeholder';
import {
  buildEmailDocument,
  buildMailCanvasDocument,
  buildSheetEmailHtml,
} from './excel-to-html/toEmailHtml';
import type { ExcelParseResult, MailTableSlot } from './excel-to-html/types';

import type { MailApplyMeta, MailPreviewParams } from './MailPreviewDrawer';
import MailPreviewDrawer from './MailPreviewDrawer';
import type { TablePreviewParams } from './TablePreviewDrawer';
import TablePreviewDrawer from './TablePreviewDrawer';
import styles from './index.module.css';

const { Text } = Typography;

/** 初始示例模板：含变量占位符与表格插槽 */
const INITIAL_HTML = [
  '<p>尊敬的 {{客户名称}}：</p>',
  '<p>您好！以下为本次交付的明细数据：</p>',
  '<p>{{table}}</p>',
  '<p>如有疑问，欢迎随时与我们联系。</p>',
  '<p>此致</p>',
  '<p>XX 项目部</p>',
].join('');

const VARIABLE_OPTIONS = [
  { label: '客户名称', value: '{{客户名称}}' },
  { label: '发件日期', value: '{{发件日期}}' },
  { label: '项目名称', value: '{{项目名称}}' },
];

/** 编辑器工具栏：去掉图片/视频（无需上传配置），保留排版相关 */
const TOOLBAR_EXCLUDE_KEYS = [
  'group-image',
  'insertImage',
  'uploadImage',
  'group-video',
  'insertVideo',
  'uploadVideo',
];

/** 从 token（{{table}} / {{table:2}}）提取序号，缺省为 1 */
const extractSlotNumber = (token: string): number => {
  const matched = token.match(/:(\d+)/);
  return matched ? Number(matched[1]) : 1;
};

const replaceBlock = (
  html: string,
  range: TableBlockRange,
  replacement: string,
): string => html.slice(0, range.start) + replacement + html.slice(range.end);

/** 剪贴板写入（含降级方案） */
const copyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};

const MailTemplatePage = () => {
  const [editor, setEditor] = useState<IDomEditor | null>(null);
  const [parsed, setParsed] = useState<ExcelParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [slots, setSlots] = useState<Record<string, MailTableSlot>>({});
  const [variableValue, setVariableValue] = useState<string | undefined>(
    undefined,
  );
  const [sheetIndex, setSheetIndex] = useState(0);
  const [previewBody, setPreviewBody] = useState('');

  const editorRef = useRef<IDomEditor | null>(null);
  const slotsRef = useRef<Record<string, MailTableSlot>>({});
  const previewBodyRef = useRef('');
  const tablePreviewRef = useRef<DrawerContainerRef<TablePreviewParams>>(null);
  const mailPreviewRef = useRef<DrawerContainerRef<MailPreviewParams>>(null);

  const editorConfig = useMemo<Partial<IEditorConfig>>(
    () => ({ placeholder: '在此编辑邮件正文……' }),
    [],
  );
  const toolbarConfig = useMemo<Partial<IToolbarConfig>>(
    () => ({ excludeKeys: TOOLBAR_EXCLUDE_KEYS }),
    [],
  );

  const commitSlots = (nextSlots: Record<string, MailTableSlot>) => {
    slotsRef.current = nextSlots;
    setSlots(nextSlots);
  };

  /** 组装“成品正文”：把编辑器里的表格块替换为保真的 sourceHtml */
  const composeBody = useCallback((): string => {
    const currentEditor = editorRef.current;
    if (!currentEditor) {
      return '';
    }
    let body = currentEditor.getHtml();
    const slotEntries = Object.entries(slotsRef.current);
    const ranges = listTableBlockRanges(body);
    // WHY: 从右往左替换，避免先替换导致后续块坐标偏移
    const replaceCount = Math.min(ranges.length, slotEntries.length);
    for (let index = replaceCount - 1; index >= 0; index -= 1) {
      body = replaceBlock(
        body,
        ranges[index],
        slotEntries[index][1].sourceHtml,
      );
    }
    return body;
  }, []);

  const refreshCanvas = useCallback(() => {
    const currentEditor = editorRef.current;
    if (!currentEditor) {
      return;
    }
    const body = composeBody();
    if (body !== previewBodyRef.current) {
      previewBodyRef.current = body;
      setPreviewBody(body);
    }
  }, [composeBody]);

  const schedulePreview = useMemo(
    () =>
      debounce(() => {
        refreshCanvas();
      }, 350),
    [refreshCanvas],
  );

  useEffect(
    () => () => {
      schedulePreview.cancel();
    },
    [schedulePreview],
  );

  const runParse = async (file: File) => {
    setIsParsing(true);
    try {
      const result = await parseExcelFile(file);
      setParsed(result);
      setSheetIndex(0);
      message.success(`解析成功：${result.sheets.length} 个工作表`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '解析失败';
      message.error(errorMessage);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileBeforeUpload = (file: File) => {
    void runParse(file);
    return false;
  };

  /** 收集当前可注入的插槽（已注入在前，正文 token 在后） */
  const collectTokenOptions = (): string[] => {
    const slotKeys = Object.keys(slotsRef.current);
    const currentHtml = editorRef.current?.getHtml() ?? '';
    const fromHtml = findTableTokens(currentHtml).filter(
      (token) => !slotKeys.includes(token),
    );
    return [...slotKeys, ...fromHtml];
  };

  const applySheetToSlot = (token: string, sheetIndex: number) => {
    const currentEditor = editorRef.current;
    const parsedData = parsed;
    if (!currentEditor || !parsedData) {
      return;
    }
    const sheet = parsedData.sheets[sheetIndex];
    if (!sheet) {
      return;
    }
    const built = buildSheetEmailHtml(sheet);
    const currentHtml = currentEditor.getHtml();
    const slotOrder = Object.keys(slotsRef.current);
    const existingIndex = slotOrder.indexOf(token);
    let nextHtml: string | null;
    if (existingIndex >= 0) {
      // 换表：按槽位顺序定位旧表格块，原位替换
      const ranges = listTableBlockRanges(currentHtml);
      const range = ranges[existingIndex];
      nextHtml = range
        ? replaceBlock(currentHtml, range, built.html)
        : replaceSlotTokenWithHtml(currentHtml, token, built.html);
    } else {
      // 首次注入：替换 token 所在段落
      nextHtml = replaceSlotTokenWithHtml(currentHtml, token, built.html);
    }
    if (!nextHtml || nextHtml === currentHtml) {
      message.warning(`未能在正文中定位插槽 ${token}，请确认占位符仍存在`);
      return;
    }
    currentEditor.setHtml(nextHtml);
    const nextSlots = {
      ...slotsRef.current,
      [token]: {
        token,
        sourceHtml: built.html,
        fileName: parsedData.fileName,
        sheetName: sheet.name,
      },
    };
    commitSlots(nextSlots);
    schedulePreview();
    message.success(`已应用 ${token}（工作表：${sheet.name}）`);
  };

  const handleOpenTablePreview = () => {
    const parsedData = parsed;
    if (!parsedData) {
      message.warning('请先上传并解析 Excel 文件');
      return;
    }
    tablePreviewRef.current?.open({
      fileName: parsedData.fileName,
      sheets: parsedData.sheets,
      tokenOptions: collectTokenOptions(),
      onApply: applySheetToSlot,
    });
  };

  const handleRemoveSlot = (token: string) => {
    const currentEditor = editorRef.current;
    if (!currentEditor) {
      return;
    }
    const currentHtml = currentEditor.getHtml();
    const slotOrder = Object.keys(slotsRef.current);
    const existingIndex = slotOrder.indexOf(token);
    const ranges = listTableBlockRanges(currentHtml);
    const range = ranges[existingIndex];
    if (existingIndex < 0 || !range) {
      message.warning('未定位到表格（可能已被手动移动或删除），请手动处理');
      return;
    }
    const nextHtml = replaceBlock(currentHtml, range, `<p>${token}</p>`);
    currentEditor.setHtml(nextHtml);
    const nextSlots = { ...slotsRef.current };
    delete nextSlots[token];
    commitSlots(nextSlots);
    schedulePreview();
    message.success(`已移除 ${token}，正文还原为占位符`);
  };

  const handleInsertTableToken = () => {
    const currentEditor = editorRef.current;
    if (!currentEditor) {
      return;
    }
    const usedNumbers = new Set<number>(
      [
        ...findTableTokens(currentEditor.getHtml()),
        ...Object.keys(slotsRef.current),
      ].map(extractSlotNumber),
    );
    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) {
      nextNumber += 1;
    }
    const token = nextNumber === 1 ? '{{table}}' : `{{table:${nextNumber}}}`;
    currentEditor.dangerouslyInsertHtml(`<p>${token}</p>`);
    message.info(`已插入 ${token}，随后上传 Excel 即可预览注入`);
  };

  const handleInsertVariable = (value?: string) => {
    if (!value) {
      return;
    }
    const currentEditor = editorRef.current;
    if (!currentEditor) {
      return;
    }
    currentEditor.dangerouslyInsertHtml(value);
    setVariableValue(undefined);
  };

  /** 应用微调：表格块若有改动写回对应槽位，正文整体写回 wangEditor */
  const handleApplyDraft = (bodyHtml: string) => {
    const currentEditor = editorRef.current;
    if (!currentEditor) {
      return;
    }
    const tokenList = Object.keys(slotsRef.current);
    const ranges = listTableBlockRanges(bodyHtml);
    const replaceCount = Math.min(ranges.length, tokenList.length);
    const nextSlots = { ...slotsRef.current };
    for (let index = 0; index < replaceCount; index += 1) {
      const token = tokenList[index];
      const block = bodyHtml.slice(ranges[index].start, ranges[index].end);
      if (block !== nextSlots[token].sourceHtml) {
        nextSlots[token] = { ...nextSlots[token], sourceHtml: block };
      }
    }
    commitSlots(nextSlots);
    currentEditor.setHtml(bodyHtml);
    schedulePreview();
  };

  const handleOpenMailPreview = () => {
    const currentEditor = editorRef.current;
    if (!currentEditor) {
      message.warning('编辑器尚未就绪');
      return;
    }
    const body = composeBody();
    mailPreviewRef.current?.open({
      sourceBody: body,
      onApply: handleApplyDraft,
    });
  };

  /** 应用「结合预览」微调：若含新绑定先落槽（换表/首注），再写回正文微调 */
  const handleApplyCombined = (bodyHtml: string, applyMeta?: MailApplyMeta) => {
    if (applyMeta) {
      applySheetToSlot(applyMeta.token, applyMeta.sheetIndex);
    }
    handleApplyDraft(bodyHtml);
  };

  /**
   * 结合预览：把所选工作表接入首个空闲表格插槽，直接打开
   * 「模板 + 表格」结合后的整封邮件（可编辑微调）。
   */
  const openCombinedPreview = () => {
    const currentEditor = editorRef.current;
    const parsedData = parsed;
    if (!currentEditor || !parsedData) {
      return;
    }
    const appliedTokens = Object.keys(slotsRef.current);
    const htmlTokens = findTableTokens(currentEditor.getHtml());
    const pendingTokens = htmlTokens.filter(
      (token) => !appliedTokens.includes(token),
    );
    if (pendingTokens.length === 0 && appliedTokens.length === 0) {
      message.warning('正文还没有表格插槽（如 {{table}}），请先在正文插入');
      return;
    }
    const sheetIdx = parsedData.sheets[sheetIndex] ? sheetIndex : 0;
    const sheet = parsedData.sheets[sheetIdx];
    let body = composeBody();
    let applyMeta: MailApplyMeta | undefined;
    if (pendingTokens.length > 0 && sheet) {
      const token = pendingTokens[0];
      const built = buildSheetEmailHtml(sheet);
      const combined = replaceSlotTokenWithHtml(body, token, built.html);
      if (combined && combined !== body) {
        body = combined;
        applyMeta = { token, sheetIndex: sheetIdx };
      }
    }
    mailPreviewRef.current?.open({
      sourceBody: body,
      applyMeta,
      applyHint: applyMeta
        ? `将把工作表「${sheet.name}」接入插槽 ${applyMeta.token}，应用后写回富文本正文`
        : undefined,
      onApply: handleApplyCombined,
    });
  };

  /** 组装最终导出文档：正文 + 保真表格 + 残留变量提示 */
  const buildFinalEmail = (): { document: string; warnings: string[] } => {
    const currentEditor = editorRef.current;
    const warnings: string[] = [];
    if (!currentEditor) {
      return { document: '', warnings: ['编辑器尚未就绪'] };
    }
    const editorHtml = currentEditor.getHtml();
    const slotEntries = Object.entries(slotsRef.current);
    const ranges = listTableBlockRanges(editorHtml);
    if (ranges.length !== slotEntries.length) {
      warnings.push(
        '正文表格数与已注入插槽不一致，部分表格将保持编辑器样式导出',
      );
    }
    const body = composeBody();
    const variableTokens = findVariableTokens(body);
    if (variableTokens.length > 0) {
      warnings.push(
        `正文仍含未替换变量：${variableTokens.join('、')}（已原样保留）`,
      );
    }
    return { document: buildEmailDocument(body), warnings };
  };

  const notifyWarnings = (warnings: string[]) => {
    if (warnings.length === 0) {
      return;
    }
    const summary =
      warnings.length > 3
        ? `${warnings.slice(0, 3).join('；')} 等 ${warnings.length} 条`
        : warnings.join('；');
    message.warning(summary, 6);
  };

  const handleCopyEmailHtml = async () => {
    const result = buildFinalEmail();
    if (!result.document) {
      return;
    }
    notifyWarnings(result.warnings);
    await copyText(result.document);
    message.success('邮件 HTML 已复制到剪贴板');
  };

  const handleDownloadEmailHtml = () => {
    const result = buildFinalEmail();
    if (!result.document) {
      return;
    }
    notifyWarnings(result.warnings);
    const blob = new Blob([result.document], {
      type: 'text/html;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '邮件正文.html';
    link.click();
    URL.revokeObjectURL(url);
    message.success('完整邮件 HTML 已下载');
  };

  const handleEditorCreated = (createdEditor: IDomEditor) => {
    editorRef.current = createdEditor;
    setEditor(createdEditor);
    refreshCanvas();
  };

  const handleEditorChange = (_editor: IDomEditor) => {
    schedulePreview();
  };

  const slotEntries = Object.entries(slots);
  const parseWarnings = parsed ? parsed.warnings.slice(0, 5) : [];
  const canvasDocument = useMemo(
    () => (previewBody ? buildMailCanvasDocument(previewBody) : ''),
    [previewBody],
  );

  return (
    <div className={styles.workspace}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>邮件模板工作台</h1>
          <div className={styles.subtitle}>
            富文本正文 · Excel 表格注入 · 成品预览与微调 ·
            一键导出（Demo，不持久化）
          </div>
        </div>
        <div className={styles.headerActions}>
          <SButton
            type="primary"
            disabled={!editor}
            onClick={handleOpenMailPreview}
          >
            预览并微调邮件
          </SButton>
          <div className={styles.dividerV} />
          <SButton disabled={!editor} onClick={handleCopyEmailHtml}>
            复制正文 HTML
          </SButton>
          <SButton disabled={!editor} onClick={handleDownloadEmailHtml}>
            下载完整 HTML
          </SButton>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* 左栏：撰写 + 素材 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>正文撰写</h2>
            <span className={styles.panelHint}>
              先插入占位符，再上传 Excel 应用到插槽
            </span>
          </div>

          <div className={styles.utilityBar}>
            <SButton onClick={handleInsertTableToken}>插入表格插槽</SButton>
            <Select
              allowClear
              placeholder="插入变量占位符"
              value={variableValue}
              onChange={handleInsertVariable}
              style={{ width: 180 }}
              options={VARIABLE_OPTIONS}
            />
          </div>

          <div className={styles.editorShell} style={{ marginTop: 10 }}>
            <WangToolbar
              editor={editor}
              defaultConfig={toolbarConfig}
              mode="default"
            />
            <WangEditor
              defaultConfig={editorConfig}
              defaultHtml={INITIAL_HTML}
              mode="default"
              style={{ height: 380 }}
              onCreated={handleEditorCreated}
              onChange={handleEditorChange}
            />
          </div>

          {slotEntries.length > 0 && (
            <div className={styles.slotBar}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                已注入：
              </Text>
              {slotEntries.map(([token, slot]) => (
                <span key={token} className={styles.slotPill}>
                  <span className={styles.mono}>{token}</span>
                  <span className={styles.slotPillName}>
                    {slot.fileName} / {slot.sheetName}
                  </span>
                  <SButton compact onClick={() => handleRemoveSlot(token)}>
                    移除
                  </SButton>
                </span>
              ))}
            </div>
          )}

          <div className={styles.sourceBlock}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>数据表格素材</h2>
              <span className={styles.panelHint}>
                .xlsx · ≤10MB · 上限 {PARSE_LIMITS_TEXT}
              </span>
            </div>

            {!parsed ? (
              <div className={styles.sourceEmpty}>
                <div className={styles.sourceEmptyText}>
                  支持保留字体 / 底色 / 边框 / 对齐 / 自动换行 / 合并单元格 /
                  列宽 / 常见数字格式。文件只在浏览器本地解析，不会上传。
                </div>
                <Upload
                  accept=".xlsx"
                  showUploadList={false}
                  beforeUpload={handleFileBeforeUpload}
                >
                  <SButton icon={<FileExcelOutlined />} loading={isParsing}>
                    {isParsing ? '解析中…' : '选择 .xlsx 文件'}
                  </SButton>
                </Upload>
              </div>
            ) : (
              <div>
                <div className={styles.fileMeta}>
                  <Upload
                    accept=".xlsx"
                    showUploadList={false}
                    beforeUpload={handleFileBeforeUpload}
                  >
                    <SButton icon={<FileExcelOutlined />} loading={isParsing}>
                      重新选择
                    </SButton>
                  </Upload>
                  <span className={styles.fileName}>{parsed.fileName}</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {parsed.sheets.length} 个工作表
                  </Text>
                  <Select
                    value={sheetIndex}
                    onChange={setSheetIndex}
                    options={parsed.sheets.map((sheet, index) => ({
                      label: `${sheet.name}（${sheet.rowCount} × ${sheet.colCount}）`,
                      value: index,
                    }))}
                    style={{ width: 230 }}
                  />
                  <SButton type="primary" onClick={openCombinedPreview}>
                    预览结合效果
                  </SButton>
                  <SButton onClick={handleOpenTablePreview}>
                    表格样式核对
                  </SButton>
                </div>
                <div className={styles.sheetChips}>
                  {parsed.sheets.map((sheet) => (
                    <span className={styles.sheetChip} key={sheet.name}>
                      {sheet.name}（{sheet.rowCount} × {sheet.colCount}）
                    </span>
                  ))}
                </div>
                {parseWarnings.length > 0 && (
                  <Alert
                    className={styles.parsedAlert}
                    type="warning"
                    showIcon
                    message={`解析提示（共 ${parsed.warnings.length} 条）`}
                    description={parseWarnings.map((warning) => (
                      <div key={warning}>{warning}</div>
                    ))}
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* 右栏：成品信纸预览 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>成品预览</h2>
            <span className={styles.panelHint}>
              跟随左侧编辑实时刷新 · 正文宽 600px
            </span>
          </div>

          <div className={styles.previewStage}>
            {previewBody ? (
              <div className={styles.letter}>
                <iframe
                  className={styles.letterFrame}
                  title="邮件成品预览画布"
                  sandbox=""
                  srcDoc={canvasDocument}
                />
              </div>
            ) : (
              <Text type="secondary">编辑器就绪后将在此显示成品邮件…</Text>
            )}
          </div>

          <div className={styles.previewFoot}>
            <span className={styles.previewFootNote}>
              所见即发送版式：全内联样式，兼容 Outlook / Gmail 类客户端
            </span>
            <SButton
              type="primary"
              ghost
              disabled={!previewBody}
              onClick={handleOpenMailPreview}
            >
              全屏微调
            </SButton>
          </div>
        </section>
      </div>

      <TablePreviewDrawer ref={tablePreviewRef} />
      <MailPreviewDrawer ref={mailPreviewRef} />
    </div>
  );
};

export default MailTemplatePage;
