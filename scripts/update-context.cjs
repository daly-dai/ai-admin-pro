const fs = require('fs');
const path = require('path');

// eslint-disable-next-line no-undef
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(ROOT_DIR, 'src');
const AI_CONTEXT_DIR = path.resolve(ROOT_DIR, '.ai', 'context');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function scanApiModules() {
  const apiDir = path.resolve(SRC_DIR, 'api');
  if (!fs.existsSync(apiDir)) return [];

  const modules = [];
  const items = fs.readdirSync(apiDir, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory() && item.name !== 'types') {
      const modulePath = path.resolve(apiDir, item.name, 'index.ts');
      if (fs.existsSync(modulePath)) {
        const content = fs.readFileSync(modulePath, 'utf-8');
        const methods = [];

        const simpleMatch = content.match(/export const \w+Api = \{([^}]+)\}/s);
        if (simpleMatch) {
          const methodMatches = simpleMatch[1].matchAll(/(\w+):/g);
          for (const m of methodMatches) {
            if (!['get', 'post', 'put', 'delete', 'patch'].includes(m[1])) {
              methods.push(m[1]);
            }
          }
        }

        modules.push({
          name: item.name,
          path: `api/${item.name}/`,
          methods,
        });
      }
    }
  }

  return modules;
}

function scanComponents() {
  const componentsDir = path.resolve(SRC_DIR, 'components');
  if (!fs.existsSync(componentsDir)) return [];

  const components = [];
  const categories = ['layout', 'business', 'common'];

  for (const category of categories) {
    const categoryDir = path.resolve(componentsDir, category);
    if (fs.existsSync(categoryDir)) {
      const items = fs.readdirSync(categoryDir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          const indexPath = path.resolve(categoryDir, item.name, 'index.tsx');
          const tsxPath = path.resolve(categoryDir, `${item.name}.tsx`);
          if (fs.existsSync(indexPath) || fs.existsSync(tsxPath)) {
            components.push({
              name: item.name,
              path: `components/${category}/${item.name}/`,
              category,
            });
          }
        } else if (item.isFile() && item.name.endsWith('.tsx')) {
          const name = item.name.replace('.tsx', '');
          components.push({
            name,
            path: `components/${category}/${item.name}`,
            category,
          });
        }
      }
    }
  }

  return components;
}

function scanPages() {
  const routerPath = path.resolve(SRC_DIR, 'router', 'index.tsx');
  const pages = [];

  if (fs.existsSync(routerPath)) {
    const content = fs.readFileSync(routerPath, 'utf-8');
    const pathMatches = content.matchAll(/path:\s*["']([^"']+)["']/g);
    for (const m of pathMatches) {
      const routePath = m[1];
      if (routePath && routePath !== '*') {
        let name = routePath;
        if (routePath === '/') name = '首页';
        else if (routePath === '/login') name = '登录页';
        else if (routePath === '/dashboard') name = '仪表盘';
        else name = routePath.replace('/', '');

        pages.push({
          path: routePath,
          name,
        });
      }
    }
  }

  pages.push({ path: '*', name: '404页面' });
  return pages;
}

function generateExistingApis(modules) {
  let content = '# 已有API清单\n\n';

  for (const module of modules) {
    const moduleName =
      module.name.charAt(0).toUpperCase() + module.name.slice(1);
    content += `## ${moduleName}模块 (${module.path})\n`;
    for (const method of module.methods) {
      content += `- ${method}\n`;
    }
    content += '\n';
  }

  return content;
}

function generateExistingComponents(components) {
  let content = '# 已有组件清单\n\n';

  const categoryMap = {
    layout: '布局组件',
    business: '业务组件',
    common: '通用组件',
  };

  const grouped = {};
  for (const comp of components) {
    if (!grouped[comp.category]) grouped[comp.category] = [];
    grouped[comp.category].push(comp);
  }

  for (const [category, comps] of Object.entries(grouped)) {
    content += `## ${categoryMap[category] || category} (components/${category}/)\n`;
    for (const comp of comps) {
      content += `- ${comp.name}\n`;
    }
    content += '\n';
  }

  return content;
}

function generateExistingPages(pages) {
  let content = '# 已有页面清单\n\n';

  for (const page of pages) {
    content += `- ${page.path} - ${page.name}\n`;
  }

  return content;
}

function main() {
  console.log('🔄 开始更新项目上下文...\n');

  ensureDir(AI_CONTEXT_DIR);

  const apiModules = scanApiModules();
  const components = scanComponents();
  const pages = scanPages();

  const apisContent = generateExistingApis(apiModules);
  const componentsContent = generateExistingComponents(components);
  const pagesContent = generateExistingPages(pages);

  fs.writeFileSync(
    path.resolve(AI_CONTEXT_DIR, 'existing-apis.md'),
    apisContent,
    'utf-8',
  );
  fs.writeFileSync(
    path.resolve(AI_CONTEXT_DIR, 'existing-components.md'),
    componentsContent,
    'utf-8',
  );
  fs.writeFileSync(
    path.resolve(AI_CONTEXT_DIR, 'existing-pages.md'),
    pagesContent,
    'utf-8',
  );

  console.log('✅ 更新完成！');
  console.log(`   - API模块: ${apiModules.length} 个`);
  console.log(`   - 组件: ${components.length} 个`);
  console.log(`   - 页面: ${pages.length} 个`);
  console.log(`\n📁 文件已保存到: ${AI_CONTEXT_DIR}`);
}

main();
