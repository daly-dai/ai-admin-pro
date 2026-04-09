/**
 * Scaffold CLI — 生成详情（Drawer 模式 或 Page 模式）
 */

import type { DetailSceneConfig, ScaffoldConfig } from './types.js';
import { toUpperSnake } from './utils.js';

/** 详情生成器接受的配置类型 */
type DetailGenConfig = DetailSceneConfig | ScaffoldConfig;

/** 收集详情页需要导入的枚举 MAP */
function collectDetailEnumImports(config: DetailGenConfig): Set<string> {
  const imports = new Set<string>();
  for (const group of config.detail.groups) {
    for (const item of group.items) {
      if (item.enumName) {
        imports.add(`${toUpperSnake(item.enumName)}_MAP`);
      }
    }
  }
  return imports;
}

/** 生成 SDetail.Group items 代码 */
function genDetailGroupItems(config: DetailGenConfig): string {
  const lines: string[] = [];
  lines.push('  const detailItems = [');
  for (const group of config.detail.groups) {
    lines.push('    {');
    lines.push(`      groupTitle: '${group.title}',`);
    lines.push('      items: [');
    for (const item of group.items) {
      lines.push('        {');
      lines.push(`          label: '${item.label}',`);
      lines.push(`          name: '${item.name}',`);
      if (item.enumName) {
        const mapName = `${toUpperSnake(item.enumName)}_MAP`;
        lines.push(`          dictMap: ${mapName},`);
      }
      if (item.type && item.type !== 'text') {
        lines.push(`          type: '${item.type}' as const,`);
      }
      if (item.render) {
        lines.push(`          render: ${item.render},`);
      }
      lines.push('        },');
    }
    lines.push('      ],');
    lines.push('    },');
  }
  lines.push('  ];');
  return lines.join('\n');
}

// ────────────────────────────────────────────
//  模式 A: Drawer
// ────────────────────────────────────────────

function genDetailDrawer(config: DetailGenConfig): string {
  const { entity, module, detail } = config;
  const lines: string[] = [];

  lines.push(
    "import React, { forwardRef, useImperativeHandle, useState } from 'react';",
  );
  lines.push("import { Drawer, Spin } from 'antd';");
  lines.push("import { useRequest } from 'ahooks';");
  lines.push("import { SDetail, SButton } from '@dalydb/sdesign';");
  lines.push(`import { getByIdByGet } from '@/api/${module}';`);

  const enumImports = collectDetailEnumImports(config);
  if (enumImports.size > 0) {
    lines.push(
      `import { ${[...enumImports].join(', ')} } from '@/api/${module}/types';`,
    );
  }

  lines.push('');

  lines.push(`export interface ${entity}DetailDrawerRef {`);
  lines.push('  open: (id: string) => void;');
  lines.push('}');
  lines.push('');

  lines.push(
    `const ${entity}DetailDrawer = forwardRef<${entity}DetailDrawerRef>((_, ref) => {`,
  );
  lines.push('  const [open, setOpen] = useState(false);');
  lines.push('  const [detailId, setDetailId] = useState<string>();');
  lines.push('');

  lines.push('  useImperativeHandle(ref, () => ({');
  lines.push('    open: (id) => { setDetailId(id); setOpen(true); },');
  lines.push('  }));');
  lines.push('');

  lines.push('  const { data, loading } = useRequest(');
  lines.push('    () => getByIdByGet(detailId!),');
  lines.push('    { ready: open && !!detailId, refreshDeps: [detailId] },');
  lines.push('  );');
  lines.push('');

  lines.push(genDetailGroupItems(config));
  lines.push('');

  lines.push('  return (');
  lines.push('    <Drawer');
  lines.push('      open={open}');
  lines.push(`      title="${config.label}详情"`);
  lines.push('      onClose={() => setOpen(false)}');
  lines.push(`      width={${(detail.column || 2) * 300 + 100}}`);
  lines.push('    >');
  lines.push('      <Spin spinning={loading}>');
  lines.push('        {data && (');
  lines.push('          <SDetail.Group');
  lines.push('            dataSource={data}');
  lines.push('            items={detailItems}');
  lines.push('          />');
  lines.push('        )}');
  lines.push('      </Spin>');
  lines.push('    </Drawer>');
  lines.push('  );');
  lines.push('});');
  lines.push('');
  lines.push(`${entity}DetailDrawer.displayName = '${entity}DetailDrawer';`);
  lines.push('');
  lines.push(`export default ${entity}DetailDrawer;`);

  return lines.join('\n') + '\n';
}

// ────────────────────────────────────────────
//  模式 B: Page (detail.tsx)
// ────────────────────────────────────────────

function genDetailPage(config: DetailGenConfig): string {
  const { entity, module } = config;
  const lines: string[] = [];

  lines.push("import React from 'react';");
  lines.push("import { Spin } from 'antd';");
  lines.push("import { useNavigate, useParams } from 'react-router-dom';");
  lines.push("import { useRequest } from 'ahooks';");
  lines.push("import { SDetail, SButton } from '@dalydb/sdesign';");
  lines.push(`import { getByIdByGet } from '@/api/${module}';`);

  const enumImports = collectDetailEnumImports(config);
  if (enumImports.size > 0) {
    lines.push(
      `import { ${[...enumImports].join(', ')} } from '@/api/${module}/types';`,
    );
  }

  lines.push('');
  lines.push(`const ${entity}Detail: React.FC = () => {`);
  lines.push('  const navigate = useNavigate();');
  lines.push('  const { id } = useParams<{ id: string }>();');
  lines.push('');

  lines.push('  const { data, loading } = useRequest(');
  lines.push('    () => getByIdByGet(id!),');
  lines.push('    { ready: !!id },');
  lines.push('  );');
  lines.push('');

  lines.push(genDetailGroupItems(config));
  lines.push('');

  lines.push('  return (');
  lines.push('    <Spin spinning={loading}>');
  lines.push('      {data && (');
  lines.push('        <SDetail.Group');
  lines.push('          dataSource={data}');
  lines.push('          items={detailItems}');
  lines.push('        />');
  lines.push('      )}');
  lines.push("      <div style={{ textAlign: 'center', marginTop: 24 }}>");
  lines.push(
    '        <SButton actionType="back" onClick={() => navigate(-1)} />',
  );
  lines.push('      </div>');
  lines.push('    </Spin>');
  lines.push('  );');
  lines.push('};');
  lines.push('');
  lines.push(`export default ${entity}Detail;`);

  return lines.join('\n') + '\n';
}

// ─── 导出 ───

export interface GenDetailResult {
  files: { path: string; content: string }[];
}

export function genDetail(config: DetailGenConfig): GenDetailResult {
  const { detail, entity, module } = config;

  if (detail.mode === 'drawer') {
    return {
      files: [
        {
          path: `src/pages/${module}/components/${entity}DetailDrawer.tsx`,
          content: genDetailDrawer(config),
        },
      ],
    };
  }

  return {
    files: [
      {
        path: `src/pages/${module}/detail.tsx`,
        content: genDetailPage(config),
      },
    ],
  };
}
