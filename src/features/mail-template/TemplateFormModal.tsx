/**
 * 模板新增/编辑弹窗（P001：createModal 封装；Content 关闭即卸载，wangEditor 随之销毁，每次打开全新初始化）。
 * 校验单一来源：service/templateRules（T1 已红绿测毕）——本文件只做「原始输入解析 + 错误绑定」，
 * 禁止在此重复实现校验（tasks T3 约束）。
 */
import type { ModalChildProps } from '@dalydb/sdesign';
import { SForm, createModal } from '@dalydb/sdesign';
import type {
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
} from '@wangeditor/editor';
import {
  Editor as WangEditor,
  Toolbar as WangToolbar,
} from '@wangeditor/editor-for-react';
import { useRequest } from 'ahooks';
import type { RadioChangeEvent } from 'antd';
import { Modal, Typography, message } from 'antd';
import { useMemo, useRef, useState } from 'react';

// 运行时副作用：注册 wangEditor 内置模块与样式（须先于组件渲染，v1 同款）
import '@wangeditor/editor';
import '@wangeditor/editor/dist/css/style.css';

import styles from './index.module.css';
import {
  DEFAULT_PRESET_ID,
  PRESET_BODIES,
  findPresetBody,
} from './presetBodies';
import {
  parseCcInput,
  parseRecipientsInput,
  validateBodyPlaceholderCount,
} from './service/templateRules';
import {
  createTemplateByPost,
  updateTemplateByPost,
} from './service/templateService';
import type { MailTemplate, MailTemplateInput } from './service/types';

const { Text } = Typography;

/** 富文本工具栏：去掉图片/视频（无需上传配置），保留排版能力 */
const TOOLBAR_EXCLUDE_KEYS = [
  'group-image',
  'insertImage',
  'uploadImage',
  'group-video',
  'insertVideo',
  'uploadVideo',
];

type Params = { mode: 'create' | 'edit'; record?: MailTemplate };

/** 表单原始值：收件人/抄送为多行字符串（提交时经 rules 解析成邮箱数组） */
interface TemplateFormValues {
  name?: string;
  recipients?: string;
  cc?: string;
  presetId?: string;
}

const TemplateFormContent = ({
  params,
  onClose,
  onSuccess,
}: ModalChildProps<Params>) => {
  const [form] = SForm.useForm();
  const isEdit = params.mode === 'edit';
  const editRecord = isEdit ? params.record : undefined;

  const editorRef = useRef<IDomEditor | null>(null);
  const [activeEditor, setActiveEditor] = useState<IDomEditor | null>(null);
  const [bodyHtml, setBodyHtml] = useState<string>(() => {
    if (editRecord) {
      return editRecord.bodyHtml;
    }
    return findPresetBody(DEFAULT_PRESET_ID)?.bodyHtml ?? '';
  });
  const [bodyError, setBodyError] = useState<string | undefined>(undefined);

  const editorConfig = useMemo<Partial<IEditorConfig>>(
    () => ({
      placeholder: '在此编辑邮件正文……（须包含恰好一个 {{table}} 占位符）',
    }),
    [],
  );
  const toolbarConfig = useMemo<Partial<IToolbarConfig>>(
    () => ({ excludeKeys: TOOLBAR_EXCLUDE_KEYS }),
    [],
  );

  const { run, loading } = useRequest(
    async (input: MailTemplateInput) => {
      // WHY 同步服务包 async：ahooks 契约要 Promise；service 门面保持真实后端同步形状
      if (editRecord) {
        return updateTemplateByPost(editRecord.id, input);
      }
      return createTemplateByPost(input);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(isEdit ? '更新成功' : '创建成功');
        onSuccess?.();
      },
    },
  );

  /** 切换预设：替换编辑器正文（演示口径：预设为起点，可再手动修改） */
  const handlePresetChange = (event: RadioChangeEvent) => {
    const preset = findPresetBody(String(event.target.value));
    if (!preset) {
      return;
    }
    setBodyHtml(preset.bodyHtml);
    setBodyError(undefined);
    editorRef.current?.setHtml(preset.bodyHtml);
    message.info(`已应用预设「${preset.label}」，正文已替换`);
  };

  const handleEditorCreated = (createdEditor: IDomEditor) => {
    editorRef.current = createdEditor;
    setActiveEditor(createdEditor);
  };

  const handleEditorChange = (changedEditor: IDomEditor) => {
    const html = changedEditor.getHtml();
    setBodyHtml(html);
    if (bodyError !== undefined) {
      setBodyError(undefined);
    }
  };

  const handleFinish = (values: TemplateFormValues) => {
    const name = values.name?.trim() ?? '';
    if (!name) {
      form.setFields([{ name: 'name', errors: ['请输入模板名称'] }]);
      return;
    }
    const recipientsCheck = parseRecipientsInput(values.recipients ?? '');
    if (!recipientsCheck.ok) {
      form.setFields([
        { name: 'recipients', errors: [recipientsCheck.message] },
      ]);
      return;
    }
    const ccCheck = parseCcInput(values.cc ?? '');
    if (!ccCheck.ok) {
      form.setFields([{ name: 'cc', errors: [ccCheck.message] }]);
      return;
    }
    const bodyCheck = validateBodyPlaceholderCount(bodyHtml);
    if (!bodyCheck.ok) {
      setBodyError(bodyCheck.message);
      return;
    }
    const presetId = values.presetId?.trim();
    run({
      name,
      recipients: recipientsCheck.emails,
      cc: ccCheck.emails,
      bodyHtml,
      ...(presetId ? { presetId } : {}),
    });
  };

  const initialValues = {
    name: editRecord?.name ?? '',
    recipients: editRecord ? editRecord.recipients.join('\n') : '',
    cc:
      editRecord && editRecord.cc.length > 0
        ? editRecord.cc.join('\n')
        : undefined,
    presetId: editRecord?.presetId ?? (isEdit ? undefined : DEFAULT_PRESET_ID),
  };

  const formItems = [
    {
      label: '模板名称',
      name: 'name',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入模板名称' }],
      tooltip: '即邮件主题，收件人打开邮件时看到的标题',
      fieldProps: { placeholder: '如：经营数据周报', maxLength: 60 },
    },
    {
      label: '收件人',
      name: 'recipients',
      type: 'textarea' as const,
      fieldProps: {
        rows: 3,
        placeholder: '多人以逗号 / 分号 / 换行分隔，至少 1 个合法邮箱',
      },
    },
    {
      label: '抄送',
      name: 'cc',
      type: 'textarea' as const,
      fieldProps: {
        rows: 2,
        placeholder: '可选；填写则须全部为合法邮箱',
      },
    },
    {
      label: '预设正文',
      name: 'presetId',
      type: 'radioGroup' as const,
      extra: '切换预设会用对应文案替换正文（可再手动修改）',
      fieldProps: {
        options: PRESET_BODIES.map((preset) => ({
          label: `${preset.label}（${preset.description}）`,
          value: preset.id,
        })),
        onChange: handlePresetChange,
      },
    },
  ];

  return (
    <Modal
      open
      width={880}
      title={isEdit ? '编辑模板' : '新增模板'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <SForm
        form={form}
        items={formItems}
        columns={1}
        initialValues={initialValues}
        onFinish={handleFinish}
        labelWidth={88}
      />
      <div className={styles.editorHead}>
        <span className={styles.editorTitle}>正文（富文本）</span>
        <Text type="secondary" className={styles.editorHint}>
          保存时校验：须恰好包含 1 个占位符（发送时替换为所选报表表格）
        </Text>
      </div>
      <div className={styles.editorShell}>
        <WangToolbar
          editor={activeEditor}
          defaultConfig={toolbarConfig}
          mode="default"
        />
        <WangEditor
          defaultConfig={editorConfig}
          defaultHtml={bodyHtml}
          mode="default"
          style={{ height: 300 }}
          onCreated={handleEditorCreated}
          onChange={handleEditorChange}
        />
      </div>
      {bodyError !== undefined && (
        <Text type="danger" className={styles.bodyError}>
          {bodyError}
        </Text>
      )}
    </Modal>
  );
};

export default createModal<Params>(TemplateFormContent);
