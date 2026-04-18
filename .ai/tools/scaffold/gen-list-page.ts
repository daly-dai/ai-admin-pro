/**
 * Scaffold CLI — 生成 src/pages/{module}/index.tsx (列表页)
 */

import { collectListEnumMaps } from './collectors.js';
import { getIdType } from './normalize.js';
import { resolveApiNames } from './resolve-api-names.js';
import type { ListSceneConfig, ScaffoldConfig } from './types.js';
import { enumOptionsCode, httpSuffix, toUpperSnake } from './utils.js';

/** 列表页生成器接受的配置类型 */
type ListGenConfig = ListSceneConfig | ScaffoldConfig;

/** 检查 handler 名是否匹配 API 名: handleSubmitReview ↔ submitReview */
function handlerMatchesApi(handler: string, apiName: string): boolean {
  const expected = `handle${apiName.charAt(0).toUpperCase()}${apiName.slice(1)}`;
  return handler === expected;
}

export function genListPage(config: ListGenConfig): string {
  const { entity, module, listPage } = config;
  const idType = getIdType(config);
  const names = resolveApiNames(config.apiNames);
  const formMode = 'form' in config && config.form ? config.form.mode : 'page';
  const detailMode =
    'detail' in config && config.detail ? config.detail.mode : 'page';
  const isFormModal = formMode === 'modal';
  const isDetailDrawer = detailMode === 'drawer';

  // ─── 收集需要的 imports ───
  const reactImports = ['useRef'];
  const antdImports = new Set<string>(['message', 'Modal']);
  const sdesignTypeImports = new Set([
    'SColumnsType',
    'SFormItems',
    'SearchTableRef',
  ]);
  const sdesignImports = new Set(['SButton', 'SSearchTable']);
  const apiImports = new Set([names.getList, names.delete]);
  const typeFileImports = new Set<string>([entity]);

  // 收集枚举 MAP imports
  const enumMapImports = collectListEnumMaps(
    listPage.columns,
    config.queryParams,
  );

  // 收集 extra API imports
  for (const act of [...listPage.actions, ...(listPage.toolbarActions || [])]) {
    if (
      act.handler !== 'handleDelete' &&
      act.handler !== 'handleEdit' &&
      act.handler !== 'handleDetail' &&
      act.handler !== 'handleCreate'
    ) {
      const extraApi = config.extraApis?.find((a) => {
        return handlerMatchesApi(act.handler, a.name);
      });
      if (extraApi) {
        apiImports.add(`${extraApi.name}${httpSuffix(extraApi.method)}`);
      }
    }
  }

  // 需要 Tag
  const hasEnumCol = listPage.columns.some((c) => c.enumName);
  if (hasEnumCol) antdImports.add('Tag');

  // 需要 navigate
  const needsNavigate = !isFormModal || !isDetailDrawer;

  const lines: string[] = [];

  // ─── Imports ───
  lines.push(`import React, { ${reactImports.join(', ')} } from 'react';`);
  lines.push(`import { ${[...antdImports].join(', ')} } from 'antd';`);

  if (needsNavigate) {
    lines.push("import { useNavigate } from 'react-router-dom';");
  }

  lines.push("import { useRequest } from 'ahooks';");
  lines.push(
    `import type { ${[...sdesignTypeImports].join(', ')} } from '@dalydb/sdesign';`,
  );
  lines.push(
    `import { ${[...sdesignImports].join(', ')} } from '@dalydb/sdesign';`,
  );
  lines.push(
    `import { ${[...apiImports].join(', ')} } from 'src/api/${module}';`,
  );

  // 类型 + 枚举 MAP 从 types 导入
  const typesImportParts: string[] = [];
  if (typeFileImports.size > 0) {
    typesImportParts.push(
      `import type { ${[...typeFileImports].join(', ')} } from 'src/api/${module}/types';`,
    );
  }
  if (enumMapImports.size > 0) {
    typesImportParts.push(
      `import { ${[...enumMapImports].join(', ')} } from 'src/api/${module}/types';`,
    );
  }
  lines.push(...typesImportParts);

  // Modal/Drawer 组件导入
  if (isFormModal) {
    lines.push(
      `import ${entity}FormModal from './components/${entity}FormModal';`,
    );
    lines.push(
      `import type { ${entity}FormModalRef } from './components/${entity}FormModal';`,
    );
  }
  if (isDetailDrawer) {
    lines.push(
      `import ${entity}DetailDrawer from './components/${entity}DetailDrawer';`,
    );
    lines.push(
      `import type { ${entity}DetailDrawerRef } from './components/${entity}DetailDrawer';`,
    );
  }

  lines.push('');

  // ─── 组件声明 ───
  lines.push(`const ${entity}Page: React.FC = () => {`);

  // Ref / State
  lines.push('  const tableRef = useRef<SearchTableRef>(null);');
  if (isFormModal) {
    lines.push(`  const formRef = useRef<${entity}FormModalRef>(null);`);
  }
  if (isDetailDrawer) {
    lines.push(`  const detailRef = useRef<${entity}DetailDrawerRef>(null);`);
  }
  if (needsNavigate) {
    lines.push('  const navigate = useNavigate();');
  }
  lines.push('');

  // ─── useRequest hooks ───
  // 删除
  lines.push(`  const { run: runDelete } = useRequest(${names.delete}, {`);
  lines.push('    manual: true,');
  lines.push(
    "    onSuccess: () => { message.success('删除成功'); tableRef.current?.refresh(); },",
  );
  lines.push('  });');
  lines.push('');

  // 非标准 API hooks
  if (config.extraApis) {
    for (const api of config.extraApis) {
      const fnName = `${api.name}${httpSuffix(api.method)}`;
      const runName = `run${api.name.charAt(0).toUpperCase() + api.name.slice(1)}`;
      // 只为在 actions 中被引用的 API 生成 hook
      const isReferenced = [
        ...listPage.actions,
        ...(listPage.toolbarActions || []),
      ].some((a) => handlerMatchesApi(a.handler, api.name));
      if (isReferenced) {
        lines.push(`  const { run: ${runName} } = useRequest(${fnName}, {`);
        lines.push('    manual: true,');
        lines.push(
          `    onSuccess: () => { message.success('${api.desc}成功'); tableRef.current?.refresh(); },`,
        );
        lines.push('  });');
        lines.push('');
      }
    }
  }

  // ─── 操作函数 ───
  // handleDelete
  lines.push(`  const handleDelete = (id: ${idType}) => {`);
  lines.push('    Modal.confirm({');
  lines.push("      title: '确认删除',");
  lines.push("      content: '删除后不可恢复，确认删除？',");
  lines.push('      onOk: () => runDelete(id),');
  lines.push('    });');
  lines.push('  };');
  lines.push('');

  // handleCreate
  if (isFormModal) {
    lines.push("  const handleCreate = () => formRef.current?.open('create');");
  } else {
    lines.push(`  const handleCreate = () => navigate('/${module}/create');`);
  }
  lines.push('');

  // handleEdit
  if (isFormModal) {
    lines.push(
      `  const handleEdit = (id: ${idType}) => formRef.current?.open('edit', id);`,
    );
  } else {
    lines.push(
      `  const handleEdit = (id: ${idType}) => navigate(\`/${module}/edit/\${id}\`);`,
    );
  }
  lines.push('');

  // handleDetail
  if (isDetailDrawer) {
    lines.push(
      `  const handleDetail = (id: ${idType}) => detailRef.current?.open(id);`,
    );
  } else {
    lines.push(
      `  const handleDetail = (id: ${idType}) => navigate(\`/${module}/detail/\${id}\`);`,
    );
  }
  lines.push('');

  // extraApi handlers — 行级操作 (来自 listPage.actions)
  // const toolbarHandlerNames = new Set((listPage.toolbarActions || []).map((a) => a.handler));
  for (const act of listPage.actions) {
    if (
      act.handler === 'handleDelete' ||
      act.handler === 'handleCreate' ||
      act.handler === 'handleEdit' ||
      act.handler === 'handleDetail'
    )
      continue;

    const extraApi = config.extraApis?.find((a) =>
      handlerMatchesApi(act.handler, a.name),
    );
    if (!extraApi) continue;

    const runName = `run${extraApi.name.charAt(0).toUpperCase() + extraApi.name.slice(1)}`;

    if (act.confirm) {
      lines.push(`  const ${act.handler} = (id: ${idType}) => {`);
      lines.push('    Modal.confirm({');
      lines.push(`      title: '${act.confirm}',`);
      lines.push(`      onOk: () => ${runName}(id),`);
      lines.push('    });');
      lines.push('  };');
    } else {
      lines.push(`  const ${act.handler} = (id: ${idType}) => ${runName}(id);`);
    }
    lines.push('');
  }

  // extraApi handlers — 工具栏批量操作 (来自 listPage.toolbarActions)
  for (const act of listPage.toolbarActions || []) {
    if (act.handler === 'handleCreate') continue;

    const extraApi = config.extraApis?.find((a) =>
      handlerMatchesApi(act.handler, a.name),
    );
    if (!extraApi) continue;

    const runName = `run${extraApi.name.charAt(0).toUpperCase() + extraApi.name.slice(1)}`;
    const isBatch = extraApi.body?.some((b) => b.type.includes('[]'));

    if (isBatch) {
      // 批量操作：从 tableRef 获取选中行 keys
      lines.push(`  const ${act.handler} = () => {`);
      lines.push('    // TODO: 从 tableRef 获取选中行 keys');
      lines.push(`    const keys: string[] = [];`);
      lines.push(
        `    if (keys.length === 0) { message.warning('请先选择数据'); return; }`,
      );
      lines.push(`    ${runName}(keys);`);
      lines.push('  };');
    } else {
      lines.push(`  const ${act.handler} = () => ${runName}();`);
    }
    lines.push('');
  }

  // ─── searchItems ───
  lines.push('  const searchItems: SFormItems[] = [');
  for (const q of config.queryParams) {
    lines.push('    {');
    lines.push(`      label: '${q.label}',`);
    lines.push(`      name: '${q.name}',`);
    lines.push(`      type: '${q.formType}',`);
    if (q.enumName) {
      lines.push(
        `      fieldProps: { options: ${enumOptionsCode(q.enumName)}, allowClear: true },`,
      );
    }
    lines.push('    },');
  }
  lines.push('  ];');
  lines.push('');

  // ─── columns ───
  lines.push(`  const columns: SColumnsType<${entity}> = [`);
  for (const col of listPage.columns) {
    lines.push('    {');
    lines.push(`      title: '${col.title}',`);
    lines.push(`      dataIndex: '${col.dataIndex}',`);
    if (col.width) lines.push(`      width: ${col.width},`);

    if (col.enumName) {
      const mapName = `${toUpperSnake(col.enumName)}_MAP`;
      lines.push(
        `      render: (val: string) => <Tag>{${mapName}[val as keyof typeof ${mapName}] ?? val}</Tag>,`,
      );
    } else if (col.render === 'amount') {
      lines.push(
        "      render: (val: number) => val?.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),",
      );
    } else if (col.render === 'datetime' || col.render === 'date') {
      lines.push(`      render: '${col.render}',`);
    } else if (col.render === 'ellipsis') {
      lines.push("      render: 'ellipsis',");
    }

    if (col.hideInTable) lines.push('      hideInTable: true,');
    lines.push('    },');
  }

  // 操作列
  if (listPage.actions.length > 0) {
    lines.push('    {');
    lines.push("      title: '操作',");
    lines.push("      dataIndex: '__actions',");
    lines.push(`      width: ${Math.max(listPage.actions.length * 70, 150)},`);
    lines.push("      fixed: 'right',");
    lines.push(`      render: (_: unknown, record: ${entity}) => (`);
    lines.push('        <SButton.Group');
    lines.push('          size="small"');
    lines.push('          items={[');

    for (const act of listPage.actions) {
      const itemParts: string[] = [];
      itemParts.push(`actionType: '${act.actionType}'`);

      // onClick
      if (act.handler === 'handleDetail') {
        itemParts.push(`onClick: () => handleDetail(record.id)`);
      } else if (act.handler === 'handleEdit') {
        itemParts.push(`onClick: () => handleEdit(record.id)`);
      } else if (act.handler === 'handleDelete') {
        itemParts.push(`onClick: () => handleDelete(record.id)`);
      } else {
        itemParts.push(`onClick: () => ${act.handler}(record.id)`);
      }

      // condition → visible
      if (act.condition) {
        itemParts.push(`visible: ${act.condition}`);
      }

      lines.push(`            { ${itemParts.join(', ')} },`);
    }

    lines.push('          ]}');
    lines.push('        />');
    lines.push('      ),');
    lines.push('    },');
  }

  lines.push('  ];');
  lines.push('');

  // ─── 工具栏按钮 ───
  let toolbarNode = '';
  if (listPage.toolbarActions && listPage.toolbarActions.length > 0) {
    const toolbarItems: string[] = [];
    for (const act of listPage.toolbarActions) {
      const parts: string[] = [];
      parts.push(`actionType: '${act.actionType}'`);
      if (act.handler === 'handleCreate') {
        parts.push('onClick: handleCreate');
      } else {
        parts.push(`onClick: ${act.handler}`);
      }
      if (act.condition) {
        parts.push(`visible: ${act.condition}`);
      }
      toolbarItems.push(`{ ${parts.join(', ')} }`);
    }
    toolbarNode = `<SButton.Group items={[${toolbarItems.join(', ')}]} />`;
  }

  // ─── Return JSX ───
  lines.push('  return (');
  lines.push('    <>');
  lines.push('      <SSearchTable');
  lines.push('        ref={tableRef}');
  lines.push(`        headTitle={{ children: '${listPage.title}' }}`);
  lines.push(`        requestFn={${names.getList}}`);
  lines.push(
    `        formProps={{ items: searchItems, columns: ${listPage.searchColumns || 3} }}`,
  );
  const rowSelectionPart = listPage.rowSelection ? ', rowSelection: {}' : '';
  lines.push(
    `        tableProps={{ columns, rowKey: '${listPage.rowKey || 'id'}'${rowSelectionPart} }}`,
  );
  if (toolbarNode) {
    lines.push(`        tableTitle={{ actionNode: ${toolbarNode} }}`);
  }
  lines.push('      />');

  // Modal/Drawer 组件
  if (isFormModal) {
    lines.push(
      `      <${entity}FormModal ref={formRef} onSuccess={() => tableRef.current?.refresh()} />`,
    );
  }
  if (isDetailDrawer) {
    lines.push(`      <${entity}DetailDrawer ref={detailRef} />`);
  }

  lines.push('    </>');
  lines.push('  );');
  lines.push('};');
  lines.push('');
  lines.push(`export default ${entity}Page;`);

  return lines.join('\n') + '\n';
}
