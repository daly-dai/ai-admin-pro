/**
 * 邮件模板工作台（详情页 /mail/template/:id，Task 4）。
 * 顶部基础信息卡（只读可折叠，正文富文本渲染且 {{table}} 占位符可见）；
 * 报表区左列表（图标/名称/更新时间 + 行级权限演示开关：无查看权限/仅查看），
 * 右区默认全部报表平铺 / 空态引导上传 / 点击进入 iframe 阅读（复用 excel→html 保真渲染）；
 * iframe 工具栏：返回报表列表 + 报表名；「阅读⇄编辑/发布」为 Task 5/6 接入的占位（disabled + tooltip）。
 * 权限演示：头部「禁止上传」（模板级 canUpload）+ 行级 canView/canEdit 开关 + 「复位演示权限」。
 * 说明：service 门面（mock localStorage，接口化）；纯函数逻辑走 T1/T4 已测 seam，本页只做编排与 UI。
 */
import { ArrowLeftOutlined, FileExcelOutlined } from '@ant-design/icons';
import { SButton, STitle } from '@dalydb/sdesign';
import {
  Collapse,
  Empty,
  Modal,
  Spin,
  Switch,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { parseExcelFile } from '../excel-to-html/parseExcel';
import {
  buildMailCanvasDocument,
  buildSheetEmailHtml,
} from '../excel-to-html/toEmailHtml';
import { validateReportFile } from '../service/reportFileValidation';
import {
  deleteReportByPost,
  downloadReportByPost,
  getReportListByPost,
  updateReportPermissionByPost,
  uploadReportByPost,
} from '../service/reportService';
import {
  getTemplateByIdByGet,
  updateTemplateByPost,
} from '../service/templateService';
import type {
  MailTemplate,
  ReportMeta,
  UploadReportResult,
} from '../service/types';
import styles from './index.module.css';

const { Text } = Typography;

/** 读取文件头 2 字节（xlsx = zip，须为 'PK'） */
async function readHeaderBytes(file: File): Promise<Uint8Array | undefined> {
  try {
    const buffer = await file.slice(0, 2).arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return undefined;
  }
}

/** File → base64（uploadReportByPost 的文件体入参） */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      resolve(text.includes(',') ? (text.split(',')[1] ?? '') : text);
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/** base64 → File（阅读/预览渲染用：download 到的 fileBase64 还原为可解析 File） */
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

/** 基础信息卡（只读、可折叠默认展开）：名称/收件人/抄送 + 正文富文本渲染 */
const BasicInfoCard = ({ template }: { template: MailTemplate }) => {
  const bodyNote =
    '正文中的 {{table}} 占位符在「预览结合/发送」时替换为所选报表表格（此处仅作占位文本展示）';
  return (
    <Collapse
      className={styles.basicCard}
      defaultActiveKey={['basic']}
      items={[
        {
          key: 'basic',
          label: (
            <span className={styles.basicLabel}>
              {template.name}
              <Text type="secondary" className={styles.basicSub}>
                更新时间：{dayjs(template.updatedAt).format('YYYY-MM-DD HH:mm')}
              </Text>
            </span>
          ),
          children: (
            <div className={styles.basicBody}>
              <div className={styles.basicRow}>
                <span className={styles.basicKey}>收件人</span>
                <span>{template.recipients.join(',')}</span>
              </div>
              <div className={styles.basicRow}>
                <span className={styles.basicKey}>抄送</span>
                <span>
                  {template.cc.length > 0 ? template.cc.join(',') : '-'}
                </span>
              </div>
              <div className={styles.basicRow}>
                <span className={styles.basicKey}>正文</span>
                <div className={styles.basicBodyWrap}>
                  <div
                    className={styles.richBody}
                    dangerouslySetInnerHTML={{ __html: template.bodyHtml }}
                  />
                  <Text type="secondary" className={styles.basicHint}>
                    {bodyNote}
                  </Text>
                </div>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};

/** iframe 阅读模式（工具栏：返回全部 / 报表名 / 编辑与发布占位禁用） */
const ReaderPane = ({
  report,
  reading,
  readerDoc,
  readerError,
  onBack,
}: {
  report: ReportMeta;
  reading: boolean;
  readerDoc: string;
  readerError?: string;
  onBack: () => void;
}) => (
  <div className={styles.reader}>
    <div className={styles.readerToolbar}>
      <SButton compact onClick={onBack}>
        返回报表列表
      </SButton>
      <span className={styles.readerName} title={report.name}>
        {report.name}
        {!report.canEdit && (
          <Tag color="orange" className={styles.readerTag}>
            仅查看
          </Tag>
        )}
      </span>
      <div className={styles.readerActions}>
        <Tooltip title="mock 在线编辑平台在后续演示接入（Task 5）">
          <SButton disabled>阅读 ⇄ 编辑</SButton>
        </Tooltip>
        <Tooltip title="发布依赖在线编辑保存导出（Task 6 接入）">
          <SButton type="primary" disabled>
            发布
          </SButton>
        </Tooltip>
      </div>
    </div>
    <div className={styles.readerStage}>
      {reading && !readerDoc && <Spin />}
      {!reading && readerError && <Empty description={readerError} />}
      {readerDoc && (
        <iframe
          className={styles.readerFrame}
          title={`报表阅读：${report.name}`}
          sandbox=""
          srcDoc={readerDoc}
        />
      )}
    </div>
  </div>
);

const WorkspacePage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<MailTemplate | null>(null);
  const [reports, setReports] = useState<ReportMeta[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [reading, setReading] = useState(false);
  const [readerDoc, setReaderDoc] = useState('');
  const [readerError, setReaderError] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const reload = useCallback(() => {
    if (!templateId) {
      return;
    }
    const record = getTemplateByIdByGet(templateId);
    setTemplate(record ?? null);
    const list = record ? getReportListByPost(templateId) : [];
    setReports(list);
    setSelectedId((current) =>
      current !== undefined && list.some((report) => report.id === current)
        ? current
        : undefined,
    );
  }, [templateId]);

  useEffect(() => {
    reload();
  }, [reload]);

  /** 选中报表 → 解析并构建阅读文档（复用 excel→html 保真内核） */
  useEffect(() => {
    if (!selectedId) {
      setReaderDoc('');
      setReaderError(undefined);
      return undefined;
    }
    let cancelled = false;
    const report = downloadReportByPost(selectedId);
    if (!report) {
      setReaderError('报表不存在或已无查看权限');
      return undefined;
    }
    setReading(true);
    void (async () => {
      try {
        const file = base64ToFile(report.fileBase64, report.name);
        const result = await parseExcelFile(file);
        if (cancelled) {
          return;
        }
        const sheet = result.sheets[0];
        if (!sheet) {
          setReaderError('报表中没有可展示的工作表');
          return;
        }
        setReaderDoc(buildMailCanvasDocument(buildSheetEmailHtml(sheet).html));
        setReaderError(undefined);
      } catch (error) {
        if (!cancelled) {
          setReaderError(
            error instanceof Error ? error.message : '报表解析失败',
          );
        }
      } finally {
        if (!cancelled) {
          setReading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const finishUpload = (result: UploadReportResult) => {
    if (result.status === 'created') {
      message.success(`已上传「${result.report.name}」`);
    } else if (result.status === 'overwritten') {
      message.success(`已覆盖「${result.report.name}」`);
    }
    reload();
  };

  const handleUpload = async (file: File) => {
    if (!template) {
      return false;
    }
    const headerBytes = await readHeaderBytes(file);
    const check = validateReportFile(file.name, file.size, headerBytes);
    if (!check.ok) {
      message.error(check.message);
      return false;
    }
    setUploading(true);
    try {
      const fileBase64 = await fileToBase64(file);
      const result = uploadReportByPost({
        templateId: template.id,
        name: file.name,
        fileBase64,
      });
      if (result.status === 'conflict') {
        // 同名：确认后带 overwrite 覆盖（Q26 口径）
        Modal.confirm({
          title: '报表同名',
          content: `「${file.name}」已存在，覆盖将替换原内容且不可恢复。继续覆盖？`,
          okText: '覆盖',
          okButtonProps: { danger: true },
          onOk: () => {
            finishUpload(
              uploadReportByPost({
                templateId: template.id,
                name: file.name,
                fileBase64,
                overwrite: true,
              }),
            );
          },
        });
        return false;
      }
      finishUpload(result);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const confirmDeleteReport = (report: ReportMeta) => {
    Modal.confirm({
      title: '确认删除报表',
      content: `删除报表「${report.name}」将移除其副本（Demo 存的是副本，不影响你本机的原文件）。确认删除？`,
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteReportByPost(report.id);
        message.success('报表已删除');
        reload();
      },
    });
  };

  /** 行级演示开关：canView=false → 列表消失（接口过滤）；canEdit=false → 只读 */
  const toggleViewPermission = (report: ReportMeta, canView: boolean) => {
    updateReportPermissionByPost(report.id, { canView });
    reload();
  };
  const toggleEditPermission = (report: ReportMeta, canEdit: boolean) => {
    updateReportPermissionByPost(report.id, { canEdit });
    reload();
  };

  /** 模板级「禁止上传」演示开关（canUpload=false → 上传按钮禁用） */
  const toggleUploadPermission = (canUpload: boolean) => {
    if (!template) {
      return;
    }
    updateTemplateByPost(template.id, { canUpload });
    reload();
  };

  /** 演示复位：本模板全部报表恢复 canView/canEdit=true，canUpload=true */
  const resetDemoPermissions = () => {
    if (!template) {
      return;
    }
    for (const report of reports) {
      updateReportPermissionByPost(report.id, { canView: true, canEdit: true });
    }
    updateTemplateByPost(template.id, { canUpload: true });
    message.success('已复位本模板的全部演示权限');
    reload();
  };

  const backToList = () => {
    navigate('/mail/template');
  };

  const selected = reports.find((report) => report.id === selectedId);

  if (!templateId) {
    return <Empty description="缺少模板标识" />;
  }

  if (!template) {
    return (
      <Empty description="模板不存在或已被删除">
        <SButton type="primary" onClick={backToList}>
          返回模板列表
        </SButton>
      </Empty>
    );
  }

  const uploadTrigger = (
    <Upload
      accept=".xlsx"
      showUploadList={false}
      beforeUpload={handleUpload}
      disabled={!template.canUpload}
    >
      <SButton
        icon={<FileExcelOutlined />}
        loading={uploading}
        disabled={!template.canUpload}
      >
        上传报表
      </SButton>
    </Upload>
  );

  let contentPane: ReactNode;
  if (selected) {
    contentPane = (
      <ReaderPane
        report={selected}
        reading={reading}
        readerDoc={readerDoc}
        readerError={readerError}
        onBack={() => setSelectedId(undefined)}
      />
    );
  } else if (reports.length === 0) {
    contentPane = (
      <div className={styles.emptyPane}>
        <Empty description="暂无报表，上传 xlsx 开始演示">
          <div className={styles.emptyAction}>
            {template.canUpload ? (
              uploadTrigger
            ) : (
              <Tooltip title="当前模板文件夹无上传权限（演示），可先复位演示权限">
                <span>{uploadTrigger}</span>
              </Tooltip>
            )}
          </div>
        </Empty>
      </div>
    );
  } else {
    contentPane = (
      <div className={styles.tiles}>
        {reports.map((report) => (
          <div
            key={report.id}
            className={styles.tile}
            onClick={() => setSelectedId(report.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setSelectedId(report.id);
              }
            }}
          >
            <div className={styles.tileHead}>
              <FileExcelOutlined className={styles.tileIcon} />
              {!report.canEdit && (
                <Tag color="orange" className={styles.tileTag}>
                  仅查看
                </Tag>
              )}
            </div>
            <div className={styles.tileName} title={report.name}>
              {report.name}
            </div>
            <Text type="secondary" className={styles.tileTime}>
              {dayjs(report.updatedAt).format('YYYY-MM-DD HH:mm')}
            </Text>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <SButton type="text" icon={<ArrowLeftOutlined />} onClick={backToList}>
          返回模板列表
        </SButton>
        <STitle type="page" hasBottomMargin={false}>
          工作台
        </STitle>
      </div>

      <BasicInfoCard template={template} />

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarToolbar}>
            {template.canUpload ? (
              uploadTrigger
            ) : (
              <Tooltip title="当前模板文件夹无上传权限（演示：已禁止上传）">
                <span>{uploadTrigger}</span>
              </Tooltip>
            )}
            <div className={styles.demoSwitchRow}>
              <span className={styles.demoSwitchText}>
                演示 · 禁止上传（文件夹权限）
              </span>
              <Switch
                size="small"
                checked={!template.canUpload}
                onChange={(checked) => toggleUploadPermission(!checked)}
              />
            </div>
          </div>

          <div className={styles.sidebarList}>
            {reports.length === 0 && (
              <Text type="secondary" className={styles.sidebarEmpty}>
                还没有报表文件
              </Text>
            )}
            {reports.map((report) => (
              <div
                key={report.id}
                className={`${styles.reportRow}${
                  report.id === selectedId ? ` ${styles.reportRowActive}` : ''
                }`}
              >
                <div
                  className={styles.reportRowMain}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(report.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setSelectedId(report.id);
                    }
                  }}
                >
                  <FileExcelOutlined className={styles.reportIcon} />
                  <span className={styles.reportName} title={report.name}>
                    {report.name}
                  </span>
                  <Text type="secondary" className={styles.reportTime}>
                    {dayjs(report.updatedAt).format('MM-DD HH:mm')}
                  </Text>
                </div>
                <div className={styles.reportRowMeta}>
                  <span className={styles.permissionChip}>
                    演示 · 无查看权限
                    <Switch
                      size="small"
                      checked={!report.canView}
                      onChange={(checked) =>
                        toggleViewPermission(report, !checked)
                      }
                    />
                  </span>
                  <span className={styles.permissionChip}>
                    演示 · 仅查看
                    <Switch
                      size="small"
                      checked={!report.canEdit}
                      onChange={(checked) =>
                        toggleEditPermission(report, !checked)
                      }
                    />
                  </span>
                  <SButton compact onClick={() => confirmDeleteReport(report)}>
                    删除
                  </SButton>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.sidebarFoot}>
            <SButton compact onClick={resetDemoPermissions}>
              复位演示权限
            </SButton>
            <Text type="secondary" className={styles.sidebarFootNote}>
              权限开关仅演示用，驱动 service 层过滤/拦截
            </Text>
          </div>
        </aside>

        <section className={styles.content}>{contentPane}</section>
      </div>
    </div>
  );
};

export default WorkspacePage;
