/**
 * AI上下文更新工具
 * 自动扫描项目代码，更新AI理解所需的上下文信息
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录 - 使用绝对路径
const PROJECT_ROOT = 'e:\\work-space\\aI-admin-pro';
const AI_DIR = path.join(PROJECT_ROOT, '.ai');

console.log('Project root:', PROJECT_ROOT);
console.log('AI directory:', AI_DIR);

//配置
const CONFIG = {
  // API扫描配置
  api: {
    pattern: 'src/api/**/index.ts',
    outputPath: path.join(AI_DIR, 'context/existing-apis.md')
  },
  //组件扫描配置
  components: {
    pattern: 'src/components/**/*.{ts,tsx}',
    outputPath: path.join(AI_DIR, 'context/existing-components.md')
  },
  // 页面扫描配置
  pages: {
    pattern: 'src/pages/**/index.{ts,tsx}',
    outputPath: path.join(AI_DIR, 'context/existing-pages.md')
  }
};

/**
 *扫API模块
 */
function scanAPIs() {
  console.log('🔍扫API模块...');
  
  try {
    const apiFiles = globSync(CONFIG.api.pattern, { cwd: PROJECT_ROOT });
    console.log('Found API files:', apiFiles);
    const apiModules = [];
    
    apiFiles.forEach(filePath => {
      try {
        const fullPath = path.join(PROJECT_ROOT, filePath);
        const content = fs.readFileSync(fullPath, 'utf8');
        const moduleName = path.dirname(filePath).split('/').pop();
        
        // 提取API方法
        const apiMethods = [];
        const methodRegex = /(\w+):\s*\([^)]*\)\s*=>/g;
        let match;
        while ((match = methodRegex.exec(content))) {
          apiMethods.push(match[1]);
        }
        
        if (apiMethods.length > 0) {
          apiModules.push({
            name: moduleName,
            path: filePath,
            methods: apiMethods
          });
        }
      } catch (error) {
        console.warn(`Failed to read ${filePath}:`, error.message);
      }
    });
    
    // 生成API清单
    const apiContent = `#已有API清单

> 自动扫描生成于 ${new Date().toLocaleString()}

${apiModules.map(module => `
## ${module.name}模块 (${module.path})

${module.methods.map(method => `- ${method}`).join('\n')}
`).join('')}
`;
    
    fs.writeFileSync(CONFIG.api.outputPath, apiContent);
    console.log(`✅ API清单已更新: ${apiModules.length}个模块`);
    return apiModules;
  } catch (error) {
    console.error('API scan failed:', error.message);
    return [];
  }
}

/**
 *扫组件
 */
function scanComponents() {
  console.log('🔍扫描组件...');
  
  try {
    const componentFiles = globSync(CONFIG.components.pattern, { cwd: PROJECT_ROOT });
    console.log('Found component files:', componentFiles.length);
    const components = {
      business: [],
      common: [],
      layout: []
    };
    
    componentFiles.forEach(filePath => {
      try {
        const componentName = path.basename(filePath, path.extname(filePath));
        const parts = filePath.split('/');
        const componentDir = parts[2]; // src/components/[type]
        
        //判断组件类型
        if (componentDir === 'business') {
          components.business.push({ name: componentName, path: filePath });
        } else if (componentDir === 'common') {
          components.common.push({ name: componentName, path: filePath });
        } else if (componentDir === 'layout') {
          components.layout.push({ name: componentName, path: filePath });
        }
      } catch (error) {
        console.warn(`Failed to process ${filePath}:`, error.message);
      }
    });
    
    // 生成组件清单
    const componentContent = `#已有组件清单

> 自动扫描生成于 ${new Date().toLocaleString()}

## 业务组件 (components/business/)

${components.business.map(comp => `- ${comp.name} - ${comp.path}`).join('\n') || '无'}

## 通用组件 (components/common/)

${components.common.map(comp => `- ${comp.name} - ${comp.path}`).join('\n') || '无'}

##布局组件 (components/layout/)

${components.layout.map(comp => `- ${comp.name} - ${comp.path}`).join('\n') || '无'}
`;
    
    fs.writeFileSync(CONFIG.components.outputPath, componentContent);
    const totalComponents = Object.values(components).flat().length;
    console.log(`✅组件清单已更新: ${totalComponents}个组件`);
    return components;
  } catch (error) {
    console.error('Component scan failed:', error.message);
    return { business: [], common: [], layout: [] };
  }
}

/**
 *扫描页面
 */
function scanPages() {
  console.log('🔍扫页面...');
  
  try {
    const pageFiles = globSync(CONFIG.pages.pattern, { cwd: PROJECT_ROOT });
    console.log('Found page files:', pageFiles.length);
    const pages = [];
    
    pageFiles.forEach(filePath => {
      try {
        const pageName = path.dirname(filePath).split('/').pop();
        const route = `/${pageName}`;
        
        pages.push({
          name: pageName,
          route: route,
          path: filePath
        });
      } catch (error) {
        console.warn(`Failed to process ${filePath}:`, error.message);
      }
    });
    
    // 生成页面清单
    const pageContent = `#已有页面清单

> 自动扫描生成于 ${new Date().toLocaleString()}

${pages.map(page => `- ${page.route} - ${page.name} (${page.path})`).join('\n') || '无'}
`;
    
    fs.writeFileSync(CONFIG.pages.outputPath, pageContent);
    console.log(`✅ 页面清单已更新: ${pages.length}个页面`);
    return pages;
  } catch (error) {
    console.error('Page scan failed:', error.message);
    return [];
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🤖 AI上下文更新工具启动');
  console.log('========================');
  
  try {
    //确保context目录存在
    const contextDir = path.join(AI_DIR, 'context');
    console.log('Context directory:', contextDir);
    
    if (!fs.existsSync(contextDir)) {
      console.log('Creating context directory...');
      fs.mkdirSync(contextDir, { recursive: true });
    }
    
    //执行扫描
    const apis = scanAPIs();
    const components = scanComponents();
    const pages = scanPages();
    
    console.log('\n✅扫完成！');
    console.log(`📊统计信息:`);
    console.log(`   - API模块: ${apis.length}个`);
    console.log(`   -组件: ${Object.values(components).flat().length}个`);
    console.log(`   - 页面: ${pages.length}个`);
    
    console.log('\n📝 上下文文件已更新:');
    console.log(`   - ${CONFIG.api.outputPath}`);
    console.log(`   - ${CONFIG.components.outputPath}`);
    console.log(`   - ${CONFIG.pages.outputPath}`);
    
  } catch (error) {
    console.error('❌扫失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (process.argv[1] && process.argv[1].endsWith('update-context.js')) {
  main();
}

export {
  scanAPIs,
  scanComponents,
  scanPages,
  CONFIG
};