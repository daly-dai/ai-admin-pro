import eslint from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 全局忽略
  { ignores: ['dist', 'node_modules', '*.config.*'] },

  // 基础规则
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // 全局配置
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // === Harness Engineering: 硬约束规则 ===

      // 禁止 any 类型
      '@typescript-eslint/no-explicit-any': 'error',

      // 强制使用 import type
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],

      // 禁止直接导入 axios
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message:
                '禁止直接导入 axios，请使用 @/plugins/request 中的 request 对象。',
            },
          ],
        },
      ],
    },
  },

  // src/plugins/request/ 是唯一允许直接使用 axios 的目录
  {
    files: ['src/plugins/request/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },

  // 业务页面和组件：限制 antd 高阶组件，引导使用 sdesign
  {
    files: ['src/pages/**/*.tsx', 'src/components/**/*.tsx'],
    ignores: [
      'src/pages/login/**',
      'src/pages/error/**',
      'src/pages/register/**',
      'src/components/editable-tables/**', // 可编辑表格组件库豁免
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message:
                '禁止直接导入 axios，请使用 @/plugins/request 中的 request 对象。',
            },
            {
              name: 'antd',
              importNames: ['Table', 'Form', 'Button', 'Descriptions'],
              message:
                '业务页面请使用 @dalydb/sdesign 的 STable/SForm/SButton/SDetail 替代。',
            },
          ],
        },
      ],
      // 示例：禁止在非豁免目录使用 Modal.confirm
      // .eslintrc 中配置 no-restricted-syntax 或自定义规则
      'no-restricted-properties': [
        'error',
        {
          object: 'Modal',
          property: 'confirm',
          message: '使用 SConfirm 组件替代',
        },
      ],
    },
  },
);
