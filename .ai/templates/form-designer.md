# Prompt: 生成表单设计器/动态表单 (基于 @dalydb/sdesign)

## 使用方式

提供表单字段配置，AI 会生成基于 @dalydb/sdesign 的动态表单或表单设计器。

## 模板

```markdown
请根据以下需求，生成基于 @dalydb/sdesign 的动态表单代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + @dalydb/sdesign + Ant Design 5
- 表单组件: 使用 @dalydb/sdesign 的 SForm 组件
- 路径引用: 使用路径别名 (src/)

## 表单信息

表单名称: [FORM_NAME]
表单用途: [FORM_PURPOSE]
表单类型: [dynamic-form | form-designer]

## 字段配置

### 字段列表

[
  {
    label: '字段标签',
    name: 'fieldName',
    type: 'input | inputNumber | textarea | select | radio | checkbox | datePicker | datePickerRange | timePicker | switch | upload',
    required: true | false,
    placeholder: '占位符',
    defaultValue: '默认值',
    rules: [
      { required: true, message: '必填提示' },
      { type: 'email', message: '邮箱格式不正确' }
    ],
    fieldProps: {
      options: [
        { label: '选项1', value: 'value1' },
        { label: '选项2', value: 'value2' }
      ],
      maxLength: 100,
      rows: 4
    },
    colProps: {
      span: 12,
      xs: 24,
      sm: 12,
      md: 8
    }
  }
]

## 功能要求

1. 使用 SForm 组件实现配置式表单
2. 支持表单验证
3. 支持表单提交
4. 支持表单重置
5. 支持表单数据回显
6. 支持字段联动（如需要）
7. 支持表单预览（设计器模式）
8. 响应式布局支持

## 接口定义（如需要）

### 接口列表

1. 获取表单配置
   - 方法: GET
   - 路径: [GET_CONFIG_PATH]
   - 响应: FormConfig

2. 提交表单
   - 方法: POST
   - 路径: [SUBMIT_PATH]
   - 参数: formData
   - 响应: SubmitResult

### 类型定义

[类型定义]

## 生成要求

1. 创建文件:
   - `src/components/business/[FormName]/index.tsx` - 表单组件 (使用 SForm)
   - `src/components/business/[FormName]/types.ts` - 类型定义
   - `src/components/business/[FormName]/config.ts` - 字段配置（如需要）

2. 代码规范:
   - 使用 TypeScript 严格模式
   - 使用路径别名导入
   - 使用 @dalydb/sdesign 的 SForm 组件
   - 使用 JSON 配置模式
   - 类型定义完整，不使用 any
```

## 示例

```markdown
请根据以下需求，生成动态表单代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + @dalydb/sdesign + Ant Design 5
- 表单组件: 使用 @dalydb/sdesign 的 SForm 组件

## 表单信息

表单名称: 员工信息表单
表单用途: 用于添加和编辑员工信息
表单类型: dynamic-form

## 字段配置

字段列表:

1. 姓名
   - name: name
   - type: input
   - required: true
   - placeholder: 请输入姓名
   - colProps: { span: 12 }

2. 工号
   - name: employeeNo
   - type: input
   - required: true
   - placeholder: 请输入工号
   - colProps: { span: 12 }

3. 部门
   - name: department
   - type: select
   - required: true
   - placeholder: 请选择部门
   - fieldProps: {
       options: [
         { label: '技术部', value: 'tech' },
         { label: '产品部', value: 'product' },
         { label: '市场部', value: 'marketing' },
         { label: '运营部', value: 'operation' }
       ]
     }
   - colProps: { span: 12 }

4. 职位
   - name: position
   - type: select
   - required: true
   - placeholder: 请选择职位
   - fieldProps: {
       options: [
         { label: '初级工程师', value: 'junior' },
         { label: '中级工程师', value: 'intermediate' },
         { label: '高级工程师', value: 'senior' },
         { label: '技术总监', value: 'director' }
       ]
     }
   - colProps: { span: 12 }

5. 入职日期
   - name: hireDate
   - type: datePicker
   - required: true
   - placeholder: 请选择入职日期
   - colProps: { span: 12 }

6. 薪资
   - name: salary
   - type: inputNumber
   - required: true
   - placeholder: 请输入薪资
   - fieldProps: { min: 0, precision: 2 }
   - colProps: { span: 12 }

7. 邮箱
   - name: email
   - type: input
   - required: true
   - placeholder: 请输入邮箱
   - rules: [{ type: 'email', message: '邮箱格式不正确' }]
   - colProps: { span: 12 }

8. 手机号
   - name: phone
   - type: input
   - required: true
   - placeholder: 请输入手机号
   - regKey: 'phone'
   - colProps: { span: 12 }

9. 备注
   - name: remark
   - type: textarea
   - required: false
   - placeholder: 请输入备注
   - fieldProps: { rows: 4 }
   - colProps: { span: 24 }

## 功能要求

1. 表单验证
2. 表单提交
3. 表单重置
4. 表单数据回显（编辑模式）
5. 支持查看和编辑两种模式

## 接口定义

### 接口列表

1. 获取员工详情
   - 方法: GET
   - 路径: /api/employees/:id
   - 响应: Employee

2. 创建员工
   - 方法: POST
   - 路径: /api/employees
   - 参数: EmployeeFormData
   - 响应: Employee

3. 更新员工
   - 方法: PUT
   - 路径: /api/employees/:id
   - 参数: EmployeeFormData
   - 响应: Employee

### 类型定义

Employee {
id: string
name: string
employeeNo: string
department: string
position: string
hireDate: string
salary: number
email: string
phone: string
remark?: string
createTime: string
}

EmployeeFormData {
name: string
employeeNo: string
department: string
position: string
hireDate: string
salary: number
email: string
phone: string
remark?: string
}
```

## AI输出示例

AI会生成以下文件：

1. `src/components/business/EmployeeForm/index.tsx` - 员工表单组件 (使用 SForm)
2. `src/components/business/EmployeeForm/types.ts` - 类型定义
3. `src/components/business/EmployeeForm/config.ts` - 字段配置

所有代码都基于 @dalydb/sdesign 组件库，使用配置式开发模式，可以直接使用。

## SForm 组件使用参考

### 基础使用

```tsx
import { SForm } from '@dalydb/sdesign';

const MyForm = () => {
  const formItems = [
    {
      label: '用户名',
      name: 'username',
      type: 'input',
      rules: [{ required: true, message: '请输入用户名' }],
    },
    {
      label: '邮箱',
      name: 'email',
      type: 'input',
      fieldProps: {
        placeholder: '请输入邮箱地址',
      },
    },
  ];

  const handleSubmit = (values) => {
    console.log('表单数据:', values);
  };

  return (
    <SForm
      items={formItems}
      onFinish={handleSubmit}
      layout="vertical"
    />
  );
};
```

### 表单类型支持

#### 1. 基础输入组件

```tsx
const basicFormItems = [
  {
    label: '文本输入',
    name: 'text',
    type: 'input',
  },
  {
    label: '数字输入',
    name: 'number',
    type: 'inputNumber',
  },
  {
    label: '文本域',
    name: 'textarea',
    type: 'textarea',
    colProps: { span: 24 },
  },
  {
    label: '密码',
    name: 'password',
    type: 'input',
    fieldProps: {
      type: 'password',
    },
  },
];
```

#### 2. 选择组件

```tsx
const selectFormItems = [
  {
    label: '下拉选择',
    name: 'select',
    type: 'select',
    fieldProps: {
      options: [
        { value: 'option1', label: '选项1' },
        { value: 'option2', label: '选项2' },
      ],
    },
  },
  {
    label: '多选框',
    name: 'checkbox',
    type: 'checkbox',
    fieldProps: {
      options: [
        { value: 'check1', label: '选项1' },
        { value: 'check2', label: '选项2' },
      ],
    },
  },
  {
    label: '单选框',
    name: 'radio',
    type: 'radio',
    fieldProps: {
      options: [
        { value: 'radio1', label: '选项1' },
        { value: 'radio2', label: '选项2' },
      ],
    },
  },
];
```

#### 3. 日期时间组件

```tsx
const dateFormItems = [
  {
    label: '日期选择',
    name: 'date',
    type: 'datePicker',
  },
  {
    label: '日期范围',
    name: ['startDate', 'endDate'],
    type: 'datePickerRange',
  },
  {
    label: '时间选择',
    name: 'time',
    type: 'timePicker',
  },
];
```

### 表单验证

```tsx
const validationFormItems = [
  {
    label: '邮箱',
    name: 'email',
    type: 'input',
    rules: [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '请输入有效邮箱' },
    ],
  },
  {
    label: '手机号',
    name: 'phone',
    type: 'input',
    regKey: 'phone', // 使用内置手机号验证
  },
  {
    label: '密码',
    name: 'password',
    type: 'input',
    fieldProps: { type: 'password' },
    rules: [
      { required: true, message: '请输入密码' },
      { min: 6, message: '密码至少6位' },
    ],
  },
];
```

### 响应式配置

```tsx
const responsiveFormItems = [
  {
    label: '用户名',
    name: 'username',
    type: 'input',
    colProps: {
      xs: 24,    // 小屏幕占满一行
      sm: 12,    // 中等屏幕占半行
      md: 8,     // 大屏幕占1/3行
    },
  },
];
```

### 分组表单

```tsx
const groupFormItems = [
  {
    label: '基本信息',
    type: 'group',
    items: [
      {
        label: '用户名',
        name: 'username',
        type: 'input',
        required: true,
      },
      {
        label: '邮箱',
        name: 'email',
        type: 'input',
        regKey: 'email',
      },
      {
        label: '手机号',
        name: 'phone',
        type: 'input',
        regKey: 'phone',
      },
    ],
  },
  {
    label: '工作信息',
    type: 'group',
    items: [
      {
        label: '部门',
        name: 'department',
        type: 'select',
        fieldProps: { options: deptOptions },
      },
      {
        label: '职位',
        name: 'position',
        type: 'input',
      },
    ],
  },
];
```
