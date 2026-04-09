/**
 * Scaffold CLI — 生成 src/api/{module}/index.ts
 */

import { getIdType } from './normalize.js';
import type { ApiSceneConfig, ScaffoldConfig } from './types.js';
import { httpSuffix, jsdoc, lcFirst } from './utils.js';

/** API 生成器接受的配置类型 */
type ApiGenConfig = ApiSceneConfig | ScaffoldConfig;

export function genApi(config: ApiGenConfig): string {
  const { entity, basePath } = config;
  const idType = getIdType(config);
  const apiVar = `${lcFirst(entity)}Api`;
  const todoPath = basePath.replace(/^\/api\//, '/api/TODO/');

  const imports: string[] = [];
  imports.push("import { createRequest } from '@/plugins/request';");
  imports.push("import type { PageData } from '@/types';");

  // 构建类型导入列表
  const typeImports: string[] = [entity, `${entity}FormData`, `${entity}Query`];
  imports.push(`import type { ${typeImports.join(', ')} } from './types';`);

  const lines: string[] = [];

  // createRequest
  if (config.requestConfig) {
    const cfgParts: string[] = [];
    const rc = config.requestConfig;
    if (rc.prefix) cfgParts.push(`prefix: '${rc.prefix}'`);
    if (rc.codeKey) cfgParts.push(`codeKey: '${rc.codeKey}'`);
    if (rc.successCode !== undefined)
      cfgParts.push(`successCode: ${JSON.stringify(rc.successCode)}`);
    if (rc.dataKey) cfgParts.push(`dataKey: '${rc.dataKey}'`);
    if (rc.msgKey) cfgParts.push(`msgKey: '${rc.msgKey}'`);
    lines.push(`const ${apiVar} = createRequest({ ${cfgParts.join(', ')} });`);
  } else {
    lines.push(`const ${apiVar} = createRequest();`);
  }
  lines.push('');

  // ─── 5 个标准 CRUD 方法 ───

  // getListByGet
  lines.push(jsdoc('分页列表查询'));
  lines.push(
    `export const getListByGet = (params?: ${entity}Query): Promise<PageData<${entity}>> =>`,
  );
  lines.push(
    `  ${apiVar}.get<PageData<${entity}>>('${todoPath}', { params });`,
  );
  lines.push('');

  // getByIdByGet
  lines.push(jsdoc('根据 ID 获取详情'));
  lines.push(
    `export const getByIdByGet = (id: ${idType}): Promise<${entity}> =>`,
  );
  lines.push(`  ${apiVar}.get<${entity}>(\`${todoPath}/\${id}\`);`);
  lines.push('');

  // createByPost
  lines.push(jsdoc('新增'));
  lines.push(
    `export const createByPost = (data: ${entity}FormData): Promise<${entity}> =>`,
  );
  lines.push(`  ${apiVar}.post<${entity}>('${todoPath}', data);`);
  lines.push('');

  // updateByPut
  lines.push(jsdoc('编辑'));
  lines.push(
    `export const updateByPut = (id: ${idType}, data: Partial<${entity}FormData>): Promise<${entity}> =>`,
  );
  lines.push(`  ${apiVar}.put<${entity}>(\`${todoPath}/\${id}\`, data);`);
  lines.push('');

  // deleteByDelete
  lines.push(jsdoc('删除'));
  lines.push(`export const deleteByDelete = (id: ${idType}): Promise<void> =>`);
  lines.push(`  ${apiVar}.delete<void>(\`${todoPath}/\${id}\`);`);

  // ─── 非标准接口 ───
  if (config.extraApis && config.extraApis.length > 0) {
    lines.push('');
    lines.push('// ─── 非标准接口 ───');

    for (const api of config.extraApis) {
      const suffix = httpSuffix(api.method);
      const fnName = `${api.name}${suffix}`;
      const retType = api.response || 'void';
      const httpMethod = api.method.toLowerCase();

      // 构建路径
      const apiPath = `${todoPath}${api.path}`;
      // 将 {id} 替换为 ${id}
      const pathTemplate = apiPath.replace(/\{(\w+)\}/g, '${$1}');
      const hasPathParams = /\{(\w+)\}/.test(api.path);

      // 构建参数列表
      const params: string[] = [];
      if (api.params) {
        for (const p of api.params) {
          params.push(`${p.name}: ${p.type}`);
        }
      }
      if (api.body) {
        if (api.body.length === 1) {
          params.push(`${api.body[0].name}: ${api.body[0].type}`);
        } else {
          const bodyType = `{ ${api.body.map((b) => `${b.name}: ${b.type}`).join('; ')} }`;
          params.push(`data: ${bodyType}`);
        }
      }

      lines.push('');
      lines.push(jsdoc(api.desc));
      lines.push(
        `export const ${fnName} = (${params.join(', ')}): Promise<${retType}> =>`,
      );

      // 构建调用
      const isGet = httpMethod === 'get' || httpMethod === 'delete';
      const bodyArg = api.body
        ? api.body.length === 1
          ? api.body[0].name
          : 'data'
        : '';

      if (hasPathParams) {
        if (bodyArg && !isGet) {
          lines.push(
            `  ${apiVar}.${httpMethod}<${retType}>(\`${pathTemplate}\`, ${bodyArg});`,
          );
        } else {
          lines.push(
            `  ${apiVar}.${httpMethod}<${retType}>(\`${pathTemplate}\`);`,
          );
        }
      } else {
        if (bodyArg && !isGet) {
          lines.push(
            `  ${apiVar}.${httpMethod}<${retType}>('${apiPath}', ${bodyArg});`,
          );
        } else {
          lines.push(`  ${apiVar}.${httpMethod}<${retType}>('${apiPath}');`);
        }
      }
    }
  }

  return imports.join('\n') + '\n\n' + lines.join('\n') + '\n';
}
