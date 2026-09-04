/**
 * 模板新增/编辑抽屉（P001：createDrawer 封装，宽屏富文本编辑体验；Content 关闭即卸载）。
 * 校验单一来源：service/templateRules（已红绿测毕）——本文件只做「值校验 + 错误绑定」，
 * 禁止在此重复实现校验（tasks T3 约束）。
 * 收件人/抄送 = 通讯录多选 userInfo（users.ts mock，真实后端按 userInfo 换邮箱）；
 * 预设切换用 SForm.useWatch 驱动（P005：不依赖控件 onChange，避免被 Form 受控覆盖）；
 * 编辑回显不依赖 initialValues 缓存——params 变化时经 effect 显式回填（正文含编辑器 pending flush）。
 */
import { SButton, SForm, createDrawer } from '@dalydb/sdesign';
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
import { Drawer, Space, Typography, message } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  validateBodyPlaceholderCount,
  validateUserList,
} from './service/templateRules';
import {
  createTemplateByPost,
  updateTemplateByPost,
} from './service/templateService';
import type { MailTemplate, MailTemplateInput } from './service/types';
import { listUsersByGet } from './service/users';

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

/** 通讯录选项（模块级读取一次；label 含组织路径便于搜索/辨识） */
const USER_OPTIONS = listUsersByGet().map((user) => ({
  label: `${user.userInfo} · ${user.officeOrgPath}`,
  value: user.userInfo,
}));

/** 新增默认预填正文（无预设兜底为空串） */
const DEFAULT_PRESET_BODY = findPresetBody(DEFAULT_PRESET_ID)?.bodyHtml ?? '';

/** 打开回填值（WHY 模块级纯函数：抽离 ??/三元分支，避免 effect 回调复杂度超限） */
function buildInitialValues(params: Params): TemplateFormValues {
  const record = params.mode === 'edit' ? params.record : undefined;
  const createPreset = params.mode === 'create' ? DEFAULT_PRESET_ID : undefined;
  return {
    name: record?.name ?? '',
    recipients: record?.recipients ?? [],
    cc: record?.cc ?? [],
    presetId: record?.presetId ?? createPreset,
  };
}

/** 正文初始内容：编辑 = 原正文，新增 = 默认预设正文 */
function buildInitialBody(record: MailTemplate | undefined): string {
  return record?.bodyHtml ?? DEFAULT_PRESET_BODY;
}

type Params = {
  mode: 'create' | 'edit';
  record?: MailTemplate;
  /** 保存成功回调（列表页刷新数据源） */
  onSaved?: () => void;
};

/** 表单原始值：收件人/抄送为通讯录 userInfo 数组（提交时经 rules 清洗去重） */
interface TemplateFormValues {
  name?: string;
  recipients?: string[];
  cc?: string[];
  presetId?: string;
}

const TemplateFormContent = ({
  params,
  open,
  onClose,
}: {
  params: Params;
  open: boolean;
  onClose: () => void;
}) => {
  const [form] = SForm.useForm();
  const isEdit = params.mode === 'edit';
  const editRecord = isEdit ? params.record : undefined;

  const editorRef = useRef<IDomEditor | null>(null);
  const pendingBodyRef = useRef<string | null>(null);
  const lastAppliedPresetRef = useRef<string | null | undefined>(undefined);
  const [activeEditor, setActiveEditor] = useState<IDomEditor | null>(null);
  const [bodyHtml, setBodyHtml] = useState<string>(() =>
    buildInitialBody(editRecord),
  );
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
        params.onSaved?.();
        onClose();
      },
    },
  );

  /** 回填/替换正文：更新 state；编辑器就绪则立即 setHtml，否则待 onCreated 时 flush */
  const applyBodyHtml = useCallback((html: string) => {
    setBodyHtml(html);
    if (editorRef.current) {
      editorRef.current.setHtml(html);
    } else {
      pendingBodyRef.current = html;
    }
  }, []);

  const handleEditorCreated = (createdEditor: IDomEditor) => {
    editorRef.current = createdEditor;
    setActiveEditor(createdEditor);
    if (pendingBodyRef.current !== null) {
      createdEditor.setHtml(pendingBodyRef.current);
      pendingBodyRef.current = null;
    }
  };

  const handleEditorChange = (changedEditor: IDomEditor) => {
    setBodyHtml(changedEditor.getHtml());
    if (bodyError !== undefined) {
      setBodyError(undefined);
    }
  };

  /** 打开回填（编辑/新增均走此处，不依赖 initialValues 缓存；正文含 pending flush） */
  useEffect(() => {
    lastAppliedPresetRef.current = params.record?.presetId ?? null;
    form.setFieldsValue(buildInitialValues(params));
    setBodyError(undefined);
    applyBodyHtml(buildInitialBody(params.record));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params 每次 open 为稳定新对象，仅其驱动回填
  }, [params]);

  /** 预设切换：useWatch 感知 radio 变化 → 替换正文（初始回填值与 ref 相等则跳过，不覆盖编辑态正文） */
  const watchedPresetId = SForm.useWatch('presetId', form);
  useEffect(() => {
    const presetId = watchedPresetId;
    if (
      typeof presetId !== 'string' ||
      presetId === lastAppliedPresetRef.current
    ) {
      return;
    }
    lastAppliedPresetRef.current = presetId;
    const preset = findPresetBody(presetId);
    if (!preset) {
      return;
    }
    applyBodyHtml(preset.bodyHtml);
    message.info(`已应用预设「${preset.label}」，正文已替换`);
  }, [watchedPresetId, applyBodyHtml]);

  const handleFinish = (values: TemplateFormValues) => {
    const name = values.name?.trim() ?? '';
    if (!name) {
      form.setFields([{ name: 'name', errors: ['请输入模板名称'] }]);
      return;
    }
    const recipientsCheck = validateUserList(values.recipients, '收件人', true);
    if (!recipientsCheck.ok) {
      form.setFields([
        { name: 'recipients', errors: [recipientsCheck.message] },
      ]);
      return;
    }
    const ccCheck = validateUserList(values.cc, '抄送', false);
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
      recipients: recipientsCheck.users,
      cc: ccCheck.users,
      bodyHtml,
      ...(presetId ? { presetId } : {}),
    });
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
      type: 'select' as const,
      fieldProps: {
        mode: 'multiple',
        options: USER_OPTIONS,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '搜索并多选收件人（显示 姓名/工号 · 组织路径）',
        maxTagCount: 'responsive' as const,
      },
    },
    {
      label: '抄送',
      name: 'cc',
      type: 'select' as const,
      fieldProps: {
        mode: 'multiple',
        options: USER_OPTIONS,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '可选：搜索并多选抄送人',
        maxTagCount: 'responsive' as const,
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
      },
    },
  ];

  return (
    <Drawer
      open={open}
      width={920}
      title={isEdit ? '编辑模板' : '新增模板'}
      onClose={onClose}
      footer={
        <Space style={{ float: 'right' }}>
          <SButton onClick={onClose}>取消</SButton>
          <SButton
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            保存
          </SButton>
        </Space>
      }
    >
      <SForm
        form={form}
        items={formItems}
        columns={1}
        onFinish={handleFinish}
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
    </Drawer>
  );
};

export default createDrawer<Params>(TemplateFormContent);
