/**
 * Scaffold CLI — 场景化代码生成
 *
 * 用法:
 *   pnpm scaffold <module>
 *   # 读取 temp/scaffold/<module>.json → 校验 → 按 scene 路由生成
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { genApi } from './gen-api.js';
import { genDetail } from './gen-detail.js';
import { genForm } from './gen-form.js';
import { genListPage } from './gen-list-page.js';
import { genTypes } from './gen-types.js';
import type {
  ApiSceneConfig,
  CrudSceneConfig,
  DetailSceneConfig,
  FormSceneConfig,
  ListSceneConfig,
  SceneConfig,
  TypesSceneConfig,
} from './types.js';
import { tryPrettier, writeFileWithDir } from './utils.js';
import { validateConfig } from './validate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const CONFIGS_DIR = path.join(PROJECT_ROOT, 'temp', 'scaffold');

function fail(msg: string): never {
  console.error(`\n\u274C ${msg}\n`);
  process.exit(1);
}

/** 场景标签映射 */
const SCENE_LABELS: Record<string, string> = {
  form: '\u8868\u5355',
  detail: '\u8be6\u60c5',
  list: '\u5217\u8868\u9875',
  types: '\u7c7b\u578b\u5b9a\u4e49',
  api: 'API \u5c42',
  crud: '\u5168\u91cf CRUD',
};

/** 按场景路由生成文件 */
function generateByScene(
  config: SceneConfig,
): { path: string; content: string }[] {
  const scene = config.scene || 'crud';
  const files: { path: string; content: string }[] = [];

  switch (scene) {
    case 'form': {
      const result = genForm(config as FormSceneConfig);
      files.push(...result.files);
      break;
    }
    case 'detail': {
      const result = genDetail(config as DetailSceneConfig);
      files.push(...result.files);
      break;
    }
    case 'list': {
      files.push({
        path: `src/pages/${config.module}/index.tsx`,
        content: genListPage(config as ListSceneConfig),
      });
      break;
    }
    case 'types': {
      files.push({
        path: `src/api/${config.module}/types.ts`,
        content: genTypes(config as TypesSceneConfig),
      });
      break;
    }
    case 'api': {
      files.push({
        path: `src/api/${config.module}/index.ts`,
        content: genApi(config as ApiSceneConfig),
      });
      break;
    }
    case 'crud':
    default: {
      const crudConfig = config as CrudSceneConfig;
      // 1. types
      files.push({
        path: `src/api/${crudConfig.module}/types.ts`,
        content: genTypes(crudConfig),
      });
      // 2. api
      files.push({
        path: `src/api/${crudConfig.module}/index.ts`,
        content: genApi(crudConfig),
      });
      // 3. list page
      files.push({
        path: `src/pages/${crudConfig.module}/index.tsx`,
        content: genListPage(crudConfig),
      });
      // 4. form
      const formResult = genForm(crudConfig);
      files.push(...formResult.files);
      // 5. detail
      const detailResult = genDetail(crudConfig);
      files.push(...detailResult.files);
      break;
    }
  }

  return files;
}

function main(): void {
  // ─── 解析参数 ───
  const args = process.argv.slice(2);
  const module = args.find((a) => !a.startsWith('--'));

  if (!module) {
    fail(
      '\u8bf7\u6307\u5b9a\u6a21\u5757\u540d\n  \u7528\u6cd5: pnpm scaffold <module>\n  \u793a\u4f8b: pnpm scaffold contract',
    );
  }

  // ─── 读取配置 ───
  const configPath = path.join(CONFIGS_DIR, `${module}.json`);
  if (!fs.existsSync(configPath)) {
    fail(
      `\u914d\u7f6e\u6587\u4ef6\u4e0d\u5b58\u5728: temp/scaffold/${module}.json`,
    );
  }

  let rawConfig: unknown;
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    rawConfig = JSON.parse(content);
  } catch (e) {
    fail(
      `\u914d\u7f6e\u6587\u4ef6\u89e3\u6790\u5931\u8d25: ${(e as Error).message}`,
    );
  }

  // ─── 校验配置 ───
  const config = validateConfig(rawConfig);
  const scene = config.scene || 'crud';
  const sceneLabel = SCENE_LABELS[scene] || scene;
  const configLabel =
    'label' in config && config.label ? config.label : config.entity;

  console.log(
    `\n\uD83D\uDD27 Scaffold [${sceneLabel}]: ${configLabel} (${config.module})`,
  );
  console.log('\u2500'.repeat(50));

  // ─── 按场景生成 ───
  const generatedFiles = generateByScene(config);

  // ─── 写入文件 ───
  console.log('\n\uD83D\uDCC2 \u751f\u6210\u6587\u4ef6:');
  for (const file of generatedFiles) {
    const fullPath = path.join(PROJECT_ROOT, file.path);
    writeFileWithDir(fullPath, file.content);
    console.log(`  \u2705 ${file.path}`);
  }

  // ─── Prettier 格式化 ───
  const skipPrettier = args.includes('--no-prettier');
  if (!skipPrettier) {
    console.log('\n\uD83C\uDFA8 \u683c\u5f0f\u5316...');
    let formatted = 0;
    for (const file of generatedFiles) {
      const fullPath = path.join(PROJECT_ROOT, file.path);
      if (tryPrettier(fullPath)) {
        formatted++;
      }
    }
    console.log(
      `  ${formatted}/${generatedFiles.length} \u4e2a\u6587\u4ef6\u5df2\u683c\u5f0f\u5316`,
    );
  } else {
    console.log(
      '\n\u26A0\uFE0F \u8df3\u8fc7 Prettier \u683c\u5f0f\u5316 (--no-prettier)',
    );
  }

  // ─── 输出统计 ───
  console.log('\n' + '\u2500'.repeat(50));
  console.log(`\uD83D\uDCCA \u7edf\u8ba1:`);
  console.log(`  \u573a\u666f: ${sceneLabel}`);
  console.log(`  \u6a21\u5757: ${config.module}`);
  console.log(`  \u5b9e\u4f53: ${config.entity}`);
  console.log(`  \u751f\u6210\u6587\u4ef6\u6570: ${generatedFiles.length}`);
  console.log(
    `\n\uD83D\uDCA1 \u4e0b\u4e00\u6b65: \u8fd0\u884c pnpm verify \u68c0\u67e5\u751f\u6210\u7684\u4ee3\u7801\n`,
  );
}

main();
