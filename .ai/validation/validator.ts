/**
 * AI 代码验证器
 * 用于验证生成的代码是否符合规范和目标
 */

import * as fs from 'fs';
import * as path from 'path';

// 验证结果类型
interface ValidationResult {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'warn' | 'error';
  message?: string;
  fix?: string;
}

interface ValidationReport {
  module: string;
  type: string;
  summary: {
    total: number;
    pass: number;
    warn: number;
    error: number;
  };
  results: ValidationResult[];
}

// 验证规则定义
const validationRules = {
  'api-module': {
    goals: [
      {
        id: 'api-goal-1',
        name: '接口完整性',
        check: (content: string, context: any) => {
          const requiredMethods = ['getList', 'getById', 'create', 'update', 'delete'];
          const missing = requiredMethods.filter(m => !content.includes(`${m}:`));
          return {
            status: missing.length === 0 ? 'pass' : 'warn',
            message: missing.length > 0 ? `缺少方法: ${missing.join(', ')}` : '所有标准方法已实现',
          };
        },
      },
      {
        id: 'api-goal-2',
        name: '类型完整性',
        check: (content: string) => {
          const hasAny = content.includes(': any') || content.includes('as any');
          return {
            status: hasAny ? 'warn' : 'pass',
            message: hasAny ? '代码中包含 any 类型' : '类型定义完整',
          };
        },
      },
    ],
    standards: [
      {
        id: 'api-std-1',
        name: '命名规范',
        check: (content: string, context: any) => {
          const expectedName = `${context.module}Api`;
          const hasCorrectName = content.includes(`export const ${expectedName}`);
          return {
            status: hasCorrectName ? 'pass' : 'error',
            message: hasCorrectName ? `API 对象命名为 ${expectedName}` : `API 对象应命名为 ${expectedName}`,
          };
        },
      },
      {
        id: 'api-std-2',
        name: '请求封装',
        check: (content: string) => {
          const hasRequest = /request\.(get|post|put|delete)/.test(content);
          return {
            status: hasRequest ? 'pass' : 'error',
            message: hasRequest ? '使用 request 实例发送请求' : '必须使用 request 实例发送请求',
          };
        },
      },
      {
        id: 'api-std-3',
        name: 'JSDoc 注释',
        check: (content: string) => {
          const methods = content.match(/(getList|getById|create|update|delete)\s*:/g) || [];
          const jsdocPattern = /\/\*\*[\s\S]*?\*\//;
          const hasJsdoc = jsdocPattern.test(content);
          return {
            status: hasJsdoc ? 'pass' : 'warn',
            message: hasJsdoc ? '包含 JSDoc 注释' : '建议为接口方法添加 JSDoc 注释',
          };
        },
      },
    ],
    dependencies: [
      {
        id: 'api-dep-1',
        name: 'request 导入',
        check: (content: string) => {
          const hasImport = content.includes("from '@/plugins/request'") || content.includes('from "@/plugins/request"');
          return {
            status: hasImport ? 'pass' : 'error',
            message: hasImport ? '正确导入 request' : '必须导入 @/plugins/request',
          };
        },
      },
    ],
  },
  'list-page': {
    goals: [
      {
        id: 'list-goal-1',
        name: '数据展示',
        check: (content: string) => {
          const hasTable = content.includes('SSearchTable') || content.includes('STable');
          return {
            status: hasTable ? 'pass' : 'error',
            message: hasTable ? '使用表格组件展示数据' : '必须使用表格组件',
          };
        },
      },
      {
        id: 'list-goal-2',
        name: '分页功能',
        check: (content: string) => {
          const hasPagination = content.includes('pagination') || content.includes('page') || content.includes('pageSize');
          return {
            status: hasPagination ? 'pass' : 'warn',
            message: hasPagination ? '支持分页功能' : '建议添加分页功能',
          };
        },
      },
    ],
    standards: [
      {
        id: 'list-std-1',
        name: '组件使用',
        check: (content: string) => {
          const hasCorrectComponent = content.includes('SSearchTable') || 
            (content.includes('STable') && content.includes('SForm.Search'));
          return {
            status: hasCorrectComponent ? 'pass' : 'error',
            message: hasCorrectComponent ? '使用正确的列表组件' : '必须使用 SSearchTable 或 STable + SForm.Search',
          };
        },
      },
      {
        id: 'list-std-2',
        name: 'Hook 使用',
        check: (content: string) => {
          const hasHook = content.includes('useSearchTable');
          return {
            status: hasHook ? 'pass' : 'warn',
            message: hasHook ? '使用 useSearchTable' : '建议使用 useSearchTable 管理状态',
          };
        },
      },
    ],
    dataflow: [
      {
        id: 'list-flow-1',
        name: 'API 调用',
        check: (content: string, context: any) => {
          const pattern = new RegExp(`${context.module}Api\\.getList`);
          const hasApiCall = pattern.test(content);
          return {
            status: hasApiCall ? 'pass' : 'error',
            message: hasApiCall ? `调用 ${context.module}Api.getList` : `必须调用 ${context.module}Api.getList`,
          };
        },
      },
    ],
  },
  'form-page': {
    goals: [
      {
        id: 'form-goal-1',
        name: '表单提交',
        check: (content: string) => {
          const hasSubmit = content.includes('onFinish') || content.includes('handleSubmit');
          return {
            status: hasSubmit ? 'pass' : 'error',
            message: hasSubmit ? '有表单提交处理' : '必须处理表单提交',
          };
        },
      },
      {
        id: 'form-goal-2',
        name: '表单验证',
        check: (content: string) => {
          const hasValidation = content.includes('required') || content.includes('rules');
          return {
            status: hasValidation ? 'pass' : 'warn',
            message: hasValidation ? '有表单验证' : '建议添加表单验证',
          };
        },
      },
    ],
    standards: [
      {
        id: 'form-std-1',
        name: '组件使用',
        check: (content: string) => {
          const hasSForm = content.includes('SForm');
          return {
            status: hasSForm ? 'pass' : 'error',
            message: hasSForm ? '使用 SForm 组件' : '必须使用 SForm 组件',
          };
        },
      },
      {
        id: 'form-std-2',
        name: 'items 配置',
        check: (content: string) => {
          const hasItems = content.includes('items=');
          return {
            status: hasItems ? 'pass' : 'error',
            message: hasItems ? '配置 items 属性' : '必须配置 items 属性',
          };
        },
      },
    ],
    dataflow: [
      {
        id: 'form-flow-1',
        name: '创建 API',
        check: (content: string, context: any) => {
          const createPattern = new RegExp(`${context.module}Api\\.create`);
          const updatePattern = new RegExp(`${context.module}Api\\.update`);
          const hasCreate = createPattern.test(content);
          const hasUpdate = updatePattern.test(content);
          return {
            status: hasCreate || hasUpdate ? 'pass' : 'error',
            message: hasCreate ? `调用 ${context.module}Api.create` : 
                     hasUpdate ? `调用 ${context.module}Api.update` : 
                     `必须调用 ${context.module}Api.create 或 update`,
          };
        },
      },
    ],
  },
  'detail-page': {
    goals: [
      {
        id: 'detail-goal-1',
        name: '数据展示',
        check: (content: string) => {
          const hasDetail = content.includes('SDetail');
          return {
            status: hasDetail ? 'pass' : 'error',
            message: hasDetail ? '使用 SDetail 组件' : '必须使用 SDetail 组件',
          };
        },
      },
    ],
    standards: [
      {
        id: 'detail-std-1',
        name: 'items 配置',
        check: (content: string) => {
          const hasItems = content.includes('items=');
          return {
            status: hasItems ? 'pass' : 'error',
            message: hasItems ? '配置 items 属性' : '必须配置 items 属性',
          };
        },
      },
    ],
    dataflow: [
      {
        id: 'detail-flow-1',
        name: 'API 调用',
        check: (content: string, context: any) => {
          const pattern = new RegExp(`${context.module}Api\\.getById`);
          const hasApiCall = pattern.test(content);
          return {
            status: hasApiCall ? 'pass' : 'error',
            message: hasApiCall ? `调用 ${context.module}Api.getById` : `必须调用 ${context.module}Api.getById`,
          };
        },
      },
    ],
  },
};

// 执行验证
export function validate(
  type: keyof typeof validationRules,
  content: string,
  context: { module: string; page?: string }
): ValidationReport {
  const rules = validationRules[type];
  const results: ValidationResult[] = [];

  // 验证 Goals
  if (rules.goals) {
    for (const rule of rules.goals) {
      const check = rule.check(content, context);
      results.push({
        id: rule.id,
        name: rule.name,
        description: '',
        status: check.status,
        message: check.message,
      });
    }
  }

  // 验证 Standards
  if (rules.standards) {
    for (const rule of rules.standards) {
      const check = rule.check(content, context);
      results.push({
        id: rule.id,
        name: rule.name,
        description: '',
        status: check.status,
        message: check.message,
      });
    }
  }

  // 验证 Dataflow/Dependencies
  const flowRules = rules.dataflow || rules.dependencies;
  if (flowRules) {
    for (const rule of flowRules) {
      const check = rule.check(content, context);
      results.push({
        id: rule.id,
        name: rule.name,
        description: '',
        status: check.status,
        message: check.message,
      });
    }
  }

  const pass = results.filter(r => r.status === 'pass').length;
  const warn = results.filter(r => r.status === 'warn').length;
  const error = results.filter(r => r.status === 'error').length;

  return {
    module: context.module,
    type,
    summary: {
      total: results.length,
      pass,
      warn,
      error,
    },
    results,
  };
}

// 生成验证报告
export function generateReport(report: ValidationReport): string {
  const lines: string[] = [];
  
  lines.push(`## 验证报告: ${report.module} - ${report.type}`);
  lines.push('');
  lines.push('### 摘要');
  lines.push(`- 总检查项: ${report.summary.total}`);
  lines.push(`- 通过: ${report.summary.pass}`);
  lines.push(`- 警告: ${report.summary.warn}`);
  lines.push(`- 错误: ${report.summary.error}`);
  lines.push(`- 状态: ${report.summary.error === 0 ? '✅ 通过' : '❌ 需修复'}`);
  lines.push('');
  
  const passItems = report.results.filter(r => r.status === 'pass');
  const warnItems = report.results.filter(r => r.status === 'warn');
  const errorItems = report.results.filter(r => r.status === 'error');
  
  if (passItems.length > 0) {
    lines.push('### ✅ 通过的检查');
    passItems.forEach(item => {
      lines.push(`- ${item.name}: ${item.message}`);
    });
    lines.push('');
  }
  
  if (warnItems.length > 0) {
    lines.push('### ⚠️ 警告项');
    warnItems.forEach(item => {
      lines.push(`- ${item.name}: ${item.message}`);
    });
    lines.push('');
  }
  
  if (errorItems.length > 0) {
    lines.push('### ❌ 错误项');
    errorItems.forEach(item => {
      lines.push(`- ${item.name}: ${item.message}`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npx tsx validator.ts <type> <file-path> [module-name]');
    console.log('Types: api-module, list-page, form-page, detail-page');
    process.exit(1);
  }
  
  const [type, filePath, moduleName] = args;
  
  if (!validationRules[type as keyof typeof validationRules]) {
    console.error(`Unknown type: ${type}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const context = { module: moduleName || path.basename(path.dirname(filePath)) };
  
  const report = validate(type as keyof typeof validationRules, content, context);
  console.log(generateReport(report));
  
  process.exit(report.summary.error > 0 ? 1 : 0);
}
