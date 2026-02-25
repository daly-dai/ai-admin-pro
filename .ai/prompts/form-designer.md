# Prompt: 生成表单设计器/动态表单

## 使用方式

提供表单字段配置，AI 会生成可配置的动态表单或表单设计器。

## 模板

```markdown
请根据以下需求，生成动态表单代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + Ant Design 5 + ahooks + Zustand
- 表单组件: 使用 Ant Design 的 Form 或 ProForm

## 表单信息

表单名称: [FORM_NAME]
表单用途: [FORM_PURPOSE]
表单类型: [dynamic-form | form-designer]

## 字段配置

### 字段列表

[
{
"name": "fieldName",
"label": "字段标签",
"type": "input | textarea | number | select | radio | checkbox | date | datetime | switch | upload | cascader | treeSelect",
"required": true | false,
"placeholder": "占位符",
"defaultValue": "默认值",
"rules": [
{ "required": true, "message": "必填提示" },
{ "type": "email", "message": "邮箱格式不正确" }
],
"options": [
{ "label": "选项1", "value": "value1" },
{ "label": "选项2", "value": "value2" }
],
"props": {
"maxLength": 100,
"rows": 4
},
"col": 12
}
]

## 功能要求

1. 表单验证
2. 表单提交
3. 表单重置
4. 表单数据回显
5. 字段联动（如需要）
6. 表单预览（设计器模式）

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
   - `components/business/[FormName]/index.tsx` - 表单组件
   - `components/business/[FormName]/types.ts` - 类型定义
   - `components/business/[FormName]/config.ts` - 字段配置（如需要）

2. 代码规范:
   - 使用 TypeScript 严格模式
   - 使用路径别名导入
   - 使用 Ant Design 的 Form/ProForm
   - 类型定义完整，不使用 any
```

## 示例

```markdown
请根据以下需求，生成动态表单代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + Ant Design 5 + ahooks + Zustand
- 表单组件: 使用 ProForm
- 路径别名: @/ 指向 src/

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
   - col: 12

2. 工号
   - name: employeeNo
   - type: input
   - required: true
   - placeholder: 请输入工号
   - col: 12

3. 部门
   - name: department
   - type: select
   - required: true
   - placeholder: 请选择部门
   - options:
     - 技术部
     - 产品部
     - 市场部
     - 运营部
   - col: 12

4. 职位
   - name: position
   - type: select
   - required: true
   - placeholder: 请选择职位
   - options:
     - 初级工程师
     - 中级工程师
     - 高级工程师
     - 技术总监
   - col: 12

5. 入职日期
   - name: hireDate
   - type: date
   - required: true
   - placeholder: 请选择入职日期
   - col: 12

6. 薪资
   - name: salary
   - type: number
   - required: true
   - placeholder: 请输入薪资
   - props: { min: 0, precision: 2 }
   - col: 12

7. 邮箱
   - name: email
   - type: input
   - required: true
   - placeholder: 请输入邮箱
   - rules: [{ type: 'email', message: '邮箱格式不正确' }]
   - col: 12

8. 手机号
   - name: phone
   - type: input
   - required: true
   - placeholder: 请输入手机号
   - col: 12

9. 备注
   - name: remark
   - type: textarea
   - required: false
   - placeholder: 请输入备注
   - props: { rows: 4 }
   - col: 24

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

1. `components/business/EmployeeForm/index.tsx` - 员工表单组件
2. `components/business/EmployeeForm/types.ts` - 类型定义
3. `components/business/EmployeeForm/config.ts` - 字段配置

所有代码都遵循项目规范，可以直接使用。
