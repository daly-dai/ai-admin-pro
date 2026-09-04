/**
 * 邮件模板工作台（详情页 /mail/template/:id，Task 4 修订版）。
 *
 * 布局（按用户走查修订）：
 * - 顶部信息条：SDetail 紧凑展示（模板名称/收件人/抄送一行三列 + 正文整行单行省略，
 *   hover 富文本全文）——不再是大折叠卡，正文不再撑高；
 * - 主体：一体白面板内左报表列表 | 右内容（平铺/iframe/空态），左右以 1px 边框分隔；
 * - 权限演示开关收进左栏底部默认折叠的「演示权限」面板（界面角落），报表行回归干净：
 *   仅 图标/名称/时间 + hover 删除 + 选中高亮；
 * - 「阅读⇄编辑/发布」为 Task 5/6 接入的占位（disabled + tooltip）。
 * 说明：service 门面（mock localStorage，接口化）；纯函数逻辑走已测 seam，本页只做编排与 UI。
 */
import { ArrowLeftOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { SDetailItem } from '@dalydb/sdesign';
import { SButton, SDetail, STitle } from '@dalydb/sdesign';
import {
  Collapse,
  Empty,
  message,
  Modal,
  Spin,
  Switch,
  Tag,
  Tooltip,
  Typography,
  Upload,
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

/** HTML 富文本 → 纯文本摘要（信息条正文单行省略用；富文本全文由 hover 查看） */
function htmlToPlainText(html: string): string {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  return (holder.textContent ?? '').replace(/\s+/g, ' ').trim();
}

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

/** 单行省略文本（收件人/抄送等长串），hover 展示全文 */
const EllipsisValue = ({ text }: { text: string }) => (
  <Tooltip title={text}>
    <span className={styles.infoEllipsis}>{text}</span>
  </Tooltip>
);

/** 顶部信息条：SDetail 紧凑展示（模板名称/收件人/抄送 + 正文单行省略 hover 全文） */
const InfoBar = ({ template }: { template: MailTemplate }) => {
  const recipientsText = template.recipients.join(',');
  const ccText = template.cc.length > 0 ? template.cc.join(',') : '';
  const bodySummary = htmlToPlainText(template.bodyHtml) || '（空正文）';

  const items: SDetailItem[] = [
    {
      label: '模板名称',
      render: () => <EllipsisValue text={template.name} />,
    },
    {
      label: '收件人',
      render: () => <EllipsisValue text={recipientsText} />,
    },
    {
      label: '抄送',
      render: () =>
        ccText ? (
          <EllipsisValue text={ccText} />
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      label: '正文',
      span: 3,
      render: () => (
        <Tooltip
          placement="topLeft"
          title={
            <div className={styles.tooltipHtml}>
              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                预览/发送时正文中的 {'{{table}}'}{' '}
                将替换为所选报表表格（此处为完整富文本）
              </Text>
              <div dangerouslySetInnerHTML={{ __html: template.bodyHtml }} />
            </div>
          }
        >
          <span className={styles.infoEllipsis}>{bodySummary}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <SDetail
      items={items}
      dataSource={{}}
      columns="minmax(140px,1.1fr) minmax(0,1fr) minmax(0,1fr)"
      gap={16}
      colon={false}
    />
  );
};

/** iframe 阅读容器：工具栏（报表名/编辑·发布占位） + 阅读画布 */
const ReaderPane = ({
  report,
  reading,
  readerDoc,
  readerError,
}: {
  report: ReportMeta;
  reading: boolean;
  readerDoc: string;
  readerError?: string;
}) => {
  let stageNode: ReactNode;
  if (reading && !readerDoc) {
    stageNode = (
      <div className={styles.stageCenter}>
        <Spin />
      </div>
    );
  } else if (readerError) {
    stageNode = (
      <div className={styles.stageCenter}>
        <Empty description={readerError} />
      </div>
    );
  } else if (readerDoc) {
    stageNode = (
      <iframe
        className={styles.readerFrame}
        title={`报表阅读：${report.name}`}
        sandbox=""
        srcDoc={readerDoc}
      />
    );
  } else {
    stageNode = null;
  }

  return (
    <div className={styles.reader}>
      <div className={styles.readerToolbar}>
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
            <span>
              <SButton disabled>阅读 ⇄ 编辑</SButton>
            </span>
          </Tooltip>
          <Tooltip title="发布依赖在线编辑保存导出（Task 6 接入）">
            <span>
              <SButton type="primary" disabled>
                发布
              </SButton>
            </span>
          </Tooltip>
        </div>
      </div>
      <div className={styles.readerStage}>{stageNode}</div>
    </div>
  );
};

const WorkspacePage = () => {
  const navigate = useNavigate();
  // 路由参数名为 :id（/mail/template/:id），useParams 须按 { id } 解构
  const { id: templateId } = useParams<{ id: string }>();
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

  /** 模板级 canUpload 演示开关（false → 上传禁用） */
  const toggleUploadPermission = (canUpload: boolean) => {
    if (!template) {
      return;
    }
    updateTemplateByPost(template.id, { canUpload });
    reload();
  };

  /** 报表级 canView（false → 接口过滤，从列表消失） */
  const toggleViewPermission = (report: ReportMeta, canView: boolean) => {
    updateReportPermissionByPost(report.id, { canView });
    reload();
  };

  /** 报表级 canEdit（false → 只读，编辑入口保留但平台侧拦截） */
  const toggleEditPermission = (report: ReportMeta, canEdit: boolean) => {
    updateReportPermissionByPost(report.id, { canEdit });
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

  const uploadWithGuard = template.canUpload ? (
    uploadTrigger
  ) : (
    <Tooltip title="当前模板文件夹无上传权限（演示：已禁止上传），可先复位演示权限">
      <span>{uploadTrigger}</span>
    </Tooltip>
  );

  let contentPane: ReactNode;
  if (selected) {
    contentPane = (
      <ReaderPane
        report={selected}
        reading={reading}
        readerDoc={readerDoc}
        readerError={readerError}
      />
    );
  } else if (reports.length === 0) {
    contentPane = (
      <div className={styles.emptyPane}>
        <Empty description="暂无报表，上传 xlsx 开始演示">
          <div className={styles.emptyAction}>{uploadWithGuard}</div>
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

  const demoPanel = (
    <Collapse
      ghost
      size="small"
      items={[
        {
          key: 'permission',
          label: <span className={styles.demoLabel}>演示权限（demo）</span>,
          children: (
            <div className={styles.demoBody}>
              <div className={styles.demoRow}>
                <span>禁止上传（文件夹权限）</span>
                <Switch
                  size="small"
                  checked={!template.canUpload}
                  onChange={(checked) => toggleUploadPermission(!checked)}
                />
              </div>
              <div className={styles.demoDivider} />
              {reports.length === 0 ? (
                <Text type="secondary" className={styles.demoNote}>
                  暂无报表可演示权限
                </Text>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className={styles.demoReport}>
                    <span className={styles.demoReportName} title={report.name}>
                      {report.name}
                    </span>
                    <div className={styles.demoChipRow}>
                      <span className={styles.demoChipLabel}>
                        无查看权限
                        <Switch
                          size="small"
                          checked={!report.canView}
                          onChange={(checked) =>
                            toggleViewPermission(report, !checked)
                          }
                        />
                      </span>
                      <span className={styles.demoChipLabel}>
                        仅查看
                        <Switch
                          size="small"
                          checked={!report.canEdit}
                          onChange={(checked) =>
                            toggleEditPermission(report, !checked)
                          }
                        />
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div className={styles.demoActions}>
                <SButton compact onClick={resetDemoPermissions}>
                  复位演示权限
                </SButton>
                <Text type="secondary" className={styles.demoNote}>
                  开关仅演示用，驱动接口过滤/只读拦截；被隐藏的报表用「复位」恢复
                </Text>
              </div>
            </div>
          ),
        },
      ]}
    />
  );

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <SButton type="text" icon={<ArrowLeftOutlined />} onClick={backToList}>
          返回模板列表
        </SButton>
        <STitle type="page" hasBottomMargin={false}>
          工作台
        </STitle>
        <Text type="secondary" className={styles.topbarTime}>
          模板更新于 {dayjs(template.updatedAt).format('YYYY-MM-DD HH:mm')}
        </Text>
      </div>

      <div className={styles.infoCard}>
        <InfoBar template={template} />
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHead}>
              <span className={styles.sidebarTitle}>
                报表文件
                <span className={styles.sidebarCount}>({reports.length})</span>
              </span>
              {uploadWithGuard}
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
                    className={styles.reportMain}
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
                  <span className={styles.rowDel}>
                    <SButton
                      compact
                      onClick={() => confirmDeleteReport(report)}
                    >
                      删除
                    </SButton>
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.sidebarFoot}>{demoPanel}</div>
          </aside>

          <section className={styles.content}>{contentPane}</section>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
