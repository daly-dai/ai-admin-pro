/**
 * Scaffold CLI — 生成表单（Modal 模式 或 Page 模式）
 */

import { collectFormEnumMaps, matchEnum } from './collectors.js';
import { getIdType } from './normalize.js';
import type { ResolvedApiNames } from './resolve-api-names.js';
import { resolveApiNames } from './resolve-api-names.js';
import type { FormFieldDef, FormSceneConfig, ScaffoldConfig } from './types.js';
import { enumOptionsCode } from './utils.js';

/** 表单生成器接受的配置类型 */
type FormGenConfig = FormSceneConfig | ScaffoldConfig;

/** 生成表单 items 代码片段 */
function genFormItemsCode(
  fields: FormFieldDef[],
  config: FormGenConfig,
  varName: string,
): string {
  const lines: string[] = [];
  lines.push(`  const ${varName}: SFormItems[] = [`);
  for (const f of fields) {
    lines.push('    {');
    lines.push(`      label: '${f.label}',`);
    lines.push(`      name: '${f.name}',`);
    lines.push(`      type: '${f.type}',`);
    if (f.required) {
      lines.push('      required: true,');
    }
    // fieldProps
    const fp = f.fieldProps || {};

    // 如果是 select 且没有显式 fieldProps.options，尝试从枚举生成
    if (f.type === 'select' && !fp.options) {
      const matched = config.enums
        ? matchEnum(f.name, config.enums)
        : undefined;
      if (matched) {
        lines.push(
          `      fieldProps: { options: ${enumOptionsCode(matched.name)}, allowClear: true },`,
        );
      } else if (Object.keys(fp).length > 0) {
        lines.push(`      fieldProps: ${JSON.stringify(fp)},`);
      }
    } else if (Object.keys(fp).length > 0) {
      lines.push(`      fieldProps: ${JSON.stringify(fp)},`);
    }

    if (f.colSpan) {
      lines.push(`      colProps: { span: ${f.colSpan} },`);
    }
    lines.push('    },');
  }
  lines.push('  ];');
  return lines.join('\n');
}

/** 生成 watchRules 的 useWatch + 条件展开代码 */
function genWatchCode(config: FormGenConfig): {
  declarations: string;
  spreadCode: string;
} {
  if (!config.form.watchRules || config.form.watchRules.length === 0) {
    return { declarations: '', spreadCode: '' };
  }

  const decls: string[] = [];
  const spreads: string[] = [];

  for (let i = 0; i < config.form.watchRules.length; i++) {
    const rule = config.form.watchRules[i];
    const watchVar = `${rule.watchField}Value`;
    decls.push(
      `  const ${watchVar} = SForm.useWatch('${rule.watchField}', form);`,
    );

    // 生成条件展开的字段
    const extraItems: string[] = [];
    for (const f of rule.fields) {
      const parts: string[] = [];
      parts.push(`label: '${f.label}'`);
      parts.push(`name: '${f.name}'`);
      parts.push(`type: '${f.type}' as const`);
      if (f.required) parts.push('required: true');
      if (f.fieldProps && Object.keys(f.fieldProps).length > 0) {
        parts.push(`fieldProps: ${JSON.stringify(f.fieldProps)}`);
      }
      extraItems.push(`{ ${parts.join(', ')} }`);
    }

    spreads.push(
      `    ...(${watchVar} && ${rule.condition.replace('value', watchVar)} ? [${extraItems.join(', ')}] : []),`,
    );
  }

  return { declarations: decls.join('\n'), spreadCode: spreads.join('\n') };
}

// ────────────────────────────────────────────
//  模式 A: Modal
// ────────────────────────────────────────────

function genFormModal(config: FormGenConfig, names: ResolvedApiNames): string {
  const { entity, module, form } = config;
  const idType = getIdType(config);

  const lines: string[] = [];

  // Imports
  lines.push(
    "import React, { forwardRef, useImperativeHandle, useState } from 'react';",
  );
  lines.push("import { Modal, message } from 'antd';");
  lines.push("import { useRequest } from 'ahooks';");
  lines.push("import type { SFormItems } from '@dalydb/sdesign';");
  lines.push("import { SForm, SButton } from '@dalydb/sdesign';");
  lines.push(
    `import { ${names.create}, ${names.getById}, ${names.update} } from 'src/api/${module}';`,
  );
  lines.push(
    `import type { ${entity}FormData } from 'src/api/${module}/types';`,
  );

  // 枚举 MAP imports
  const enumImports = collectFormEnumMaps(form.fields, config.enums);
  if (enumImports.size > 0) {
    lines.push(
      `import { ${[...enumImports].join(', ')} } from 'src/api/${module}/types';`,
    );
  }

  lines.push('');

  // Types
  lines.push(`export interface ${entity}FormModalRef {`);
  lines.push(`  open: (mode: 'create' | 'edit', id?: ${idType}) => void;`);
  lines.push('}');
  lines.push('');
  lines.push(`interface ${entity}FormModalProps {`);
  lines.push('  onSuccess?: () => void;');
  lines.push('}');
  lines.push('');

  // Component
  lines.push(
    `const ${entity}FormModal = forwardRef<${entity}FormModalRef, ${entity}FormModalProps>((props, ref) => {`,
  );
  lines.push('  const [open, setOpen] = useState(false);');
  lines.push(
    "  const [mode, setMode] = useState<'create' | 'edit'>('create');",
  );
  lines.push(`  const [editId, setEditId] = useState<${idType}>();`);
  lines.push('  const [form] = SForm.useForm();');
  lines.push('');

  // useImperativeHandle
  lines.push('  useImperativeHandle(ref, () => ({');
  lines.push('    open: (m, id?) => {');
  lines.push('      setMode(m);');
  lines.push('      setEditId(id);');
  lines.push('      setOpen(true);');
  lines.push("      if (m === 'create') form.resetFields();");
  lines.push('    },');
  lines.push('  }));');
  lines.push('');

  // 加载详情
  lines.push(`  useRequest(() => ${names.getById}(editId!), {`);
  lines.push("    ready: open && mode === 'edit' && !!editId,");
  lines.push('    refreshDeps: [editId],');
  lines.push('    onSuccess: (data) => form.setFieldsValue(data),');
  lines.push('  });');
  lines.push('');

  // 提交
  lines.push(`  const { run: runSubmit, loading } = useRequest(`);
  lines.push(`    (values: ${entity}FormData) =>`);
  lines.push(
    `      mode === 'create' ? ${names.create}(values) : ${names.update}(editId!, values),`,
  );
  lines.push('    {');
  lines.push('      manual: true,');
  lines.push('      onSuccess: () => {');
  lines.push(
    "        message.success(mode === 'create' ? '创建成功' : '更新成功');",
  );
  lines.push('        setOpen(false);');
  lines.push('        props.onSuccess?.();');
  lines.push('      },');
  lines.push('    },');
  lines.push('  );');
  lines.push('');

  // watchRules
  const { declarations: watchDecls, spreadCode } = genWatchCode(config);
  if (watchDecls) {
    lines.push(watchDecls);
    lines.push('');
  }

  // formItems
  lines.push(genFormItemsCode(form.fields, config, 'formItems'));
  if (spreadCode) {
    // 需要在 formItems 最后展开条件字段
    // 替换最后的 ]; 为展开代码
    const lastIdx = lines.length - 1;
    lines[lastIdx] = lines[lastIdx].replace('  ];', `${spreadCode}\n  ];`);
  }
  lines.push('');

  // Render
  lines.push('  return (');
  lines.push('    <>');
  lines.push('      {open && (');
  lines.push('        <Modal');
  lines.push('          open');
  const formLabel = config.label || config.entity;
  lines.push(
    `          title={mode === 'create' ? '新增${formLabel}' : '编辑${formLabel}'}`,
  );
  lines.push('          onCancel={() => setOpen(false)}');
  lines.push('          footer={null}');
  lines.push(`          width={${(form.columns || 2) * 300 + 100}}`);
  lines.push('        >');
  lines.push('          <SForm');
  lines.push('            form={form}');
  lines.push(`            items={formItems}`);
  lines.push(`            columns={${form.columns || 2}}`);
  lines.push('            onFinish={runSubmit}');
  lines.push('          />');
  lines.push("          <div style={{ textAlign: 'right', marginTop: 16 }}>");
  lines.push('            <SButton.Group items={[');
  lines.push(
    `              { actionType: 'cancel', onClick: () => setOpen(false) },`,
  );
  lines.push(
    `              { actionType: 'save', onClick: () => form.submit(), loading },`,
  );
  lines.push('            ]} />');
  lines.push('          </div>');
  lines.push('        </Modal>');
  lines.push('      )}');
  lines.push('    </>');
  lines.push('  );');
  lines.push('});');
  lines.push('');
  lines.push(`${entity}FormModal.displayName = '${entity}FormModal';`);
  lines.push('');
  lines.push(`export default ${entity}FormModal;`);

  return lines.join('\n') + '\n';
}

// ────────────────────────────────────────────
//  模式 B: Page (create.tsx + edit.tsx)
// ────────────────────────────────────────────

function genFormCreatePage(
  config: FormGenConfig,
  names: ResolvedApiNames,
): string {
  const { entity, module, form } = config;
  const lines: string[] = [];

  lines.push("import React from 'react';");
  lines.push("import { message } from 'antd';");
  lines.push("import { useNavigate } from 'react-router-dom';");
  lines.push("import { useRequest } from 'ahooks';");
  lines.push("import type { SFormItems } from '@dalydb/sdesign';");
  lines.push("import { SForm, SButton } from '@dalydb/sdesign';");
  lines.push(`import { ${names.create} } from 'src/api/${module}';`);
  lines.push(
    `import type { ${entity}FormData } from 'src/api/${module}/types';`,
  );

  // 枚举 imports
  const enumImports = collectFormEnumMaps(config.form.fields, config.enums);
  if (enumImports.size > 0) {
    lines.push(
      `import { ${[...enumImports].join(', ')} } from 'src/api/${module}/types';`,
    );
  }

  lines.push('');
  lines.push(`const ${entity}Create: React.FC = () => {`);
  lines.push('  const navigate = useNavigate();');
  lines.push('  const [form] = SForm.useForm();');
  lines.push('');

  lines.push(`  const { run: runCreate, loading } = useRequest(`);
  lines.push(`    (values: ${entity}FormData) => ${names.create}(values),`);
  lines.push('    {');
  lines.push('      manual: true,');
  lines.push(
    "      onSuccess: () => { message.success('创建成功'); navigate(-1); },",
  );
  lines.push('    },');
  lines.push('  );');
  lines.push('');

  // watchRules
  const { declarations: watchDecls, spreadCode } = genWatchCode(config);
  if (watchDecls) {
    lines.push(watchDecls);
    lines.push('');
  }

  lines.push(genFormItemsCode(form.fields, config, 'formItems'));
  if (spreadCode) {
    const lastIdx = lines.length - 1;
    lines[lastIdx] = lines[lastIdx].replace('  ];', `${spreadCode}\n  ];`);
  }
  lines.push('');

  lines.push('  return (');
  lines.push('    <div>');
  lines.push('      <SForm');
  lines.push('        form={form}');
  lines.push('        items={formItems}');
  lines.push(`        columns={${form.columns || 2}}`);
  lines.push('        onFinish={runCreate}');
  lines.push('      />');
  lines.push("      <div style={{ textAlign: 'center', marginTop: 24 }}>");
  lines.push('        <SButton.Group items={[');
  lines.push("          { actionType: 'back', onClick: () => navigate(-1) },");
  lines.push(
    "          { actionType: 'save', onClick: () => form.submit(), loading },",
  );
  lines.push('        ]} />');
  lines.push('      </div>');
  lines.push('    </div>');
  lines.push('  );');
  lines.push('};');
  lines.push('');
  lines.push(`export default ${entity}Create;`);

  return lines.join('\n') + '\n';
}

function genFormEditPage(
  config: FormGenConfig,
  names: ResolvedApiNames,
): string {
  const { entity, module, form } = config;
  const lines: string[] = [];

  lines.push("import React from 'react';");
  lines.push("import { message, Spin } from 'antd';");
  lines.push("import { useNavigate, useParams } from 'react-router-dom';");
  lines.push("import { useRequest } from 'ahooks';");
  lines.push("import type { SFormItems } from '@dalydb/sdesign';");
  lines.push("import { SForm, SButton } from '@dalydb/sdesign';");
  lines.push(
    `import { ${names.getById}, ${names.update} } from 'src/api/${module}';`,
  );
  lines.push(
    `import type { ${entity}FormData } from 'src/api/${module}/types';`,
  );

  const enumImports = collectFormEnumMaps(config.form.fields, config.enums);
  if (enumImports.size > 0) {
    lines.push(
      `import { ${[...enumImports].join(', ')} } from 'src/api/${module}/types';`,
    );
  }

  lines.push('');
  lines.push(`const ${entity}Edit: React.FC = () => {`);
  lines.push('  const navigate = useNavigate();');
  lines.push('  const { id } = useParams<{ id: string }>();');
  lines.push('  const [form] = SForm.useForm();');
  lines.push('');

  // 加载详情
  lines.push('  const { loading: detailLoading } = useRequest(');
  lines.push(`    () => ${names.getById}(id!),`);
  lines.push('    {');
  lines.push('      ready: !!id,');
  lines.push('      onSuccess: (data) => form.setFieldsValue(data),');
  lines.push('    },');
  lines.push('  );');
  lines.push('');

  // 提交
  lines.push(
    `  const { run: runUpdate, loading: submitLoading } = useRequest(`,
  );
  lines.push(
    `    (values: ${entity}FormData) => ${names.update}(id!, values),`,
  );
  lines.push('    {');
  lines.push('      manual: true,');
  lines.push(
    "      onSuccess: () => { message.success('更新成功'); navigate(-1); },",
  );
  lines.push('    },');
  lines.push('  );');
  lines.push('');

  // watchRules
  const { declarations: watchDecls, spreadCode } = genWatchCode(config);
  if (watchDecls) {
    lines.push(watchDecls);
    lines.push('');
  }

  lines.push(genFormItemsCode(form.fields, config, 'formItems'));
  if (spreadCode) {
    const lastIdx = lines.length - 1;
    lines[lastIdx] = lines[lastIdx].replace('  ];', `${spreadCode}\n  ];`);
  }
  lines.push('');

  lines.push('  return (');
  lines.push('    <Spin spinning={detailLoading}>');
  lines.push('      <SForm');
  lines.push('        form={form}');
  lines.push('        items={formItems}');
  lines.push(`        columns={${form.columns || 2}}`);
  lines.push('        onFinish={runUpdate}');
  lines.push('      />');
  lines.push("      <div style={{ textAlign: 'center', marginTop: 24 }}>");
  lines.push('        <SButton.Group items={[');
  lines.push("          { actionType: 'back', onClick: () => navigate(-1) },");
  lines.push(
    "          { actionType: 'save', onClick: () => form.submit(), loading: submitLoading },",
  );
  lines.push('        ]} />');
  lines.push('      </div>');
  lines.push('    </Spin>');
  lines.push('  );');
  lines.push('};');
  lines.push('');
  lines.push(`export default ${entity}Edit;`);

  return lines.join('\n') + '\n';
}

// ─── 导出 ───

export interface GenFormResult {
  files: { path: string; content: string }[];
}

export function genForm(config: FormGenConfig): GenFormResult {
  const { form, entity, module } = config;
  const names = resolveApiNames(config.apiNames);

  if (form.mode === 'modal') {
    return {
      files: [
        {
          path: `src/pages/${module}/components/${entity}FormModal.tsx`,
          content: genFormModal(config, names),
        },
      ],
    };
  }

  // page 模式
  return {
    files: [
      {
        path: `src/pages/${module}/create.tsx`,
        content: genFormCreatePage(config, names),
      },
      {
        path: `src/pages/${module}/edit.tsx`,
        content: genFormEditPage(config, names),
      },
    ],
  };
}
