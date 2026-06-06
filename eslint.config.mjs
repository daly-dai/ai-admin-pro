import eslint from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '*.config.*'] },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // 全局规则
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          extraHOCs: ['createModal', 'createDrawer'],
        },
      ],

      // === Harness Engineering 硬约束 ===

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],

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

  // ======================== 函数质量约束 ========================

  // 业内共识：圈复杂度 + 嵌套深度已足够衡量函数质量。
  // JSX 行数 ≠ 逻辑复杂度，行数用 code review 管。
  {
    rules: {
      'complexity': ['error', { max: 10 }],
      'max-depth': ['error', { max: 3 }],
      'max-params': ['warn', { max: 3 }],
    },
  },

  // ======================== 目录级规则 ========================

  // src/plugins/request/ — 允许直接使用 axios
  {
    files: ['src/plugins/request/**/*.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },

  // 业务页面：限制 antd Table/Form/Button/Descriptions，引导使用 sdesign
  {
    files: ['src/pages/**/*.tsx', 'src/components/**/*.tsx'],
    ignores: [
      'src/pages/login/**',
      'src/pages/error/**',
      'src/pages/register/**',
      'src/components/editable-tables/**',
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
    },
  },

  // 页面组件命名规范
  {
    files: ['src/pages/**/*.tsx'],
    ignores: [
      'src/pages/login/**',
      'src/pages/error/**',
      'src/pages/register/**',
    ],
    rules: {
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
    },
  },
);
