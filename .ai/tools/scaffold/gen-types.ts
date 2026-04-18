/**
 * Scaffold CLI — 生成 src/api/{module}/types.ts
 */

import type { ScaffoldConfig, TypesSceneConfig } from './types.js';
import { jsdoc, toUpperSnake } from './utils.js';

/** 类型生成器接受的配置类型 */
type TypesGenConfig = TypesSceneConfig | ScaffoldConfig;

export function genTypes(config: TypesGenConfig): string {
  const lines: string[] = [];

  // ─── 枚举常量 ───
  if (config.enums && config.enums.length > 0) {
    for (const enumDef of config.enums) {
      const mapName = `${toUpperSnake(enumDef.name)}_MAP`;
      const hasEntries = enumDef.entries && enumDef.entries.length > 0;

      if (hasEntries) {
        lines.push(jsdoc(`${enumDef.name} 映射`));
        lines.push(`export const ${mapName} = {`);
        for (const entry of enumDef.entries!) {
          lines.push(`  ${entry.value}: '${entry.label}',`);
        }
        lines.push('} as const;');
        lines.push('');
        lines.push(`export type ${enumDef.name} = keyof typeof ${mapName};`);
      } else {
        lines.push(
          jsdoc(`${enumDef.name} 映射（TODO: 补充枚举数据或接入字典接口）`),
        );
        lines.push(`export const ${mapName}: Record<string, string> = {};`);
        lines.push('');
        lines.push(`export type ${enumDef.name} = string;`);
      }
      lines.push('');
    }
  }

  // ─── 实体接口 ───
  lines.push(jsdoc(config.label));
  lines.push(`export interface ${config.entity} {`);
  for (const field of config.fields) {
    const comment = field.comment || field.label;
    lines.push(`  ${jsdoc(comment)}`);
    const optional = field.required === false ? '?' : '';
    lines.push(`  ${field.name}${optional}: ${field.type};`);
  }
  lines.push('}');
  lines.push('');

  // ─── 查询参数（有 queryParams 时才生成）───
  const hasQuery = config.queryParams && config.queryParams.length > 0;
  if (hasQuery) {
    lines.push(jsdoc(`${config.label}查询参数`));
    lines.push(`export interface ${config.entity}Query extends PageQuery {`);
    for (const q of config.queryParams!) {
      lines.push(`  ${jsdoc(q.label)}`);
      lines.push(`  ${q.name}?: ${q.type};`);
    }
    lines.push('}');
    lines.push('');
  }

  // ─── 表单数据（有 form.fields 时才生成）───
  if (config.form && config.form.fields && config.form.fields.length > 0) {
    const formFieldNames = new Set(config.form.fields.map((f) => f.name));
    const watchExtraNames = new Set<string>();
    if (config.form.watchRules) {
      for (const rule of config.form.watchRules) {
        for (const f of rule.fields) {
          if (!formFieldNames.has(f.name)) {
            watchExtraNames.add(f.name);
          }
        }
      }
    }

    lines.push(jsdoc(`${config.label}表单数据`));
    lines.push(`export interface ${config.entity}FormData {`);
    for (const ff of config.form.fields) {
      // 从 fields 中找到对应的类型
      const fieldDef = config.fields.find((f) => f.name === ff.name);
      const tsType = fieldDef ? fieldDef.type : 'string';
      const optional = ff.required ? '' : '?';
      lines.push(`  ${jsdoc(ff.label)}`);
      lines.push(`  ${ff.name}${optional}: ${tsType};`);
    }
    // watchRules 额外字段标记为可选
    for (const rule of config.form.watchRules || []) {
      for (const f of rule.fields) {
        if (watchExtraNames.has(f.name)) {
          const fieldDef = config.fields.find((fd) => fd.name === f.name);
          const tsType = fieldDef ? fieldDef.type : 'string';
          lines.push(`  ${jsdoc(f.label)}`);
          lines.push(`  ${f.name}?: ${tsType};`);
          watchExtraNames.delete(f.name); // 避免重复
        }
      }
    }
    lines.push('}');
  }

  // ─── 组装完整文件 ───
  const imports: string[] = [];
  if (hasQuery) {
    imports.push("import type { PageQuery } from 'src/types';");
  }

  const importBlock = imports.length > 0 ? imports.join('\n') + '\n\n' : '';
  return importBlock + lines.join('\n') + '\n';
}
