# @dalydb/sdesign 组件库文档

> ⚠️ 本文件由脚本自动生成，请勿手动修改
> 
> 源文件: node_modules/@dalydb/sdesign/ai/llms.txt
> 同步时间: 2026/3/8 21:40:42
> 版本: 1.3.0

---

# @dalydb/sdesign v1.3.0

基于 Ant Design 5.x 的企业级 React 组件库。所有组件以 S 前缀命名。

## 导入
```
import { SForm, STable, SSearchTable, SButton, SDetail } from '@dalydb/sdesign';
import type { SFormItems, SColumnsType, SDetailItem } from '@dalydb/sdesign';
import { useSearchTable } from '@dalydb/sdesign/hooks';
```

## 组件
- **SButton** [.Group]: 增强按钮，支持 actionType 预设操作类型和按钮组
- **SCard**: 卡片容器，内置错误边界
- **SCascader**: 增强级联选择器
- **SCheckGroup**: 复选框组
- **SCollapse**: 折叠面板
- **SConfigProvider**: 全局配置（字典、上传地址），STable/SDetail 自动读取
- **SConfirm**: 确认组件，支持 Popconfirm 和 Modal 两种模式
- **SDatePicker**: 增强日期选择器，onChange 直接返回字符串
- **SDatePickerRange**: 日期范围选择器，支持 rangeKeys 拆分字段
- **SDependency**: 字段依赖联动组件
- **SDetail** [.Group, .Item]: 详情展示，支持 8 种渲染类型（text/dict/file/img 等）
- **SDynamicContainer**: 动态容器
- **SErrorBoundary**: 错误边界
- **SErrorCom**: 错误展示
- **SFile** [.List]: 文件上传/列表
- **SForm** [.Search, .Group, .Item, .FormItem] [.useForm, .useWatch, .useFormInstance, .ErrorList, .List]: 配置化表单，items 数组声明 22 种控件、联动、分组、搜索
- **SFrameAnimation**: 帧动画
- **SInput**: 增强输入框，支持 trim、onEnter
- **SLucideIcon**: Lucide 图标
- **SNoData**: 无数据占位
- **SNoPage**: 无页面占位
- **SRadioGroup**: 单选框组
- **SSearchTable**: SForm.Search + STable 一体化，列表页首选
- **SSelect**: 增强选择器
- **STable**: 增强表格，支持 dictKey 字典映射、render 快捷类型、序号列
- **STextEllipsis**: 文本省略
- **STitle**: 标题组件（page/table/form 三种类型）

## 核心组件 Props
### SForm (extends FormProps)
  - rowProps?: RowProps — 行布局配置
  - children?: ReactNode
  - items?: Array<SFormItems<FormItemType>> — 表单项配置数组，核心属性
  - columns?: number — 列数，表单项自动等分排列 @default 1
  - required?: string | boolean — 全局必填设置 - true: 所有项必填 - string: 所有项必填且使用该提示
  - onFinish?: (e?: any) => void — 表单提交回调
  - onReset?: (e?: any) => void — 表单重置回调
  - readonly?: boolean — 只读模式
  - formName?: string — 嵌套表单的字段前缀

### SSearchTable
  - headTitle?: STitleProps — 页面顶部标题配置
  - tableTitle?: STitleProps — 表格区域标题配置
  - requestFn: (data?: any) => Promise<any> — 数据请求函数 接收搜索参数 + 分页参数，返回包含列表数据和总数的对象。 默认字段映射: `{ dataList, totalSize, pageNum, pageSize }`， 可通过 options.paginationFields 自定义。
  - options?: Omit<useSearchTableOptions, 'form'> — useSearchTable 的配置选项
  - tableProps?: STableProps<any> — 表格 props，会合并到 useSearchTable 返回的 tableProps 中
  - formProps?: SearchProps — 搜索表单 props，透传给 SForm.Search

### STable
  - columns?: SColumnsType<RecordType> — 列定义，支持 dictKey 和字符串 render
  - isSeq?: boolean — 是否显示序号列
  - current?: number — 当前页码（用于序号计算）
  - pageSize?: number — 每页条数（用于序号计算）

### SDetail (extends Omit<DescriptionsProps, 'items' | 'title'>)
  - desc?: ReactNode — 描述文字
  - titleAction?: ReactNode — 标题右侧操作区
  - dataSource?: Record<string, any> — 数据源对象
  - items?: SDetailItem[] — 详情项配置数组
  - labelStyle?: React.CSSProperties
  - contentStyle?: React.CSSProperties
  - hasCardBg?: boolean — 是否显示卡片背景
  - container?: React.ComponentType<any> — 自定义容器组件
  - title?: string | ReactNode — 标题
  - detailName?: string — 从 dataSource 中取值的 key 前缀

### SButton (extends ButtonProps)
  - type?: ButtonProps['type'] — antd 按钮类型
  - actionType?: SButtonActionType — 预设操作类型，自动设置文字和样式
  - compact?: boolean — 紧凑模式，样式与 t-link 相同

## 关键配置类型

### SFormItems (表单项配置)
extends Omit<FormItemProps, "label | name" | "required">
```ts
{
  label?: ReactNode;              // 表单项标签
  name?: NamePath;                // 字段名，支持嵌套 ['user', 'name']
  type?: FormComType;             // 控件类型，默认 'input'，见下方 type 值表
  fieldProps?: ComponentProps;    // 控件属性，类型根据 type 自动推导（如 type='select' 则为 SelectProps）
  required?: string | boolean;    // true=默认提示 | string=自定义提示
  disabled?: boolean;
  readonly?: boolean;             // 只读模式，展示文本
  regKey?: RegKeyType;            // 内置校验: 'phone' | 'percentage' 等
  customCom?: ReactNode;          // 自定义组件，替代 type 内置组件
  render?: (form) => ReactNode;   // 自定义渲染函数
  depNames?: string[];            // 依赖字段名，仅 type='dependency' 生效
  formName?: string;              // 嵌套表单字段前缀
  colProps?: ColProps;            // 栅格布局，控制单项列宽
  hidden?: boolean;               // 隐藏（仍参与表单提交）
}
```

### SColumnsType<T> (表格列定义)
extends antd ColumnType<T>，额外属性:
```ts
{
  // ...antd ColumnType 所有属性（title, dataIndex, width, fixed, sorter 等）
  dictKey?: string;               // 字典映射 key，配合 SConfigProvider globalDict 自动转换值
  render?: ((text, record, index) => ReactNode) | 'datetime' | 'date' | 'ellipsis';
                                  // 除函数外支持字符串快捷类型
}
```

### SDetailItem (详情项配置)
```ts
{
  label?: ReactNode;              // 详情项标签
  name?: string | string[];       // 数据源字段名，支持嵌套
  type?: 'text' | 'dict' | 'file' | 'img' | 'rangeTime' | 'checkbox' | 'empty' | 'placeholder';
                                  // 渲染类型，默认 'text'
  dictKey?: string;               // 字典 key，type='dict' 时配合 SConfigProvider
  dictMap?: Record<string, string> | any[];  // 直接提供字典数据
  render?: (value, dataSource) => ReactNode; // 自定义渲染
  fileProps?: Partial<FileListProps>;        // type='file' 时文件展示配置
  span?: number;                  // 栅格占位
  hidden?: boolean;
}
```

### SearchProps (搜索表单配置)
extends SFormProps，额外属性:
```ts
{
  defaultExpand?: boolean;        // 是否默认展开，默认 false
  showExpand?: boolean;           // 是否显示展开/收起按钮
  expandLine?: number;            // 收起时显示的行数
  actionNode?: ReactNode;         // 搜索栏右侧自定义操作
  isCard?: boolean;               // 是否包裹在卡片中
}
```

### SButton.Group items 配置
```ts
{
  actionType?: SButtonActionType; // 预设类型
  onClick?: () => void;
  visible?: boolean;              // 是否可见
  render?: ReactNode | (() => ReactNode); // 自定义渲染
  // ...其他 SButtonProps 属性
}
```

### SForm.Group groupItems 配置
```ts
{
  title?: ReactNode;              // 分组标题
  items?: SFormItems[];           // 该分组的表单项
  columns?: number;               // 该分组的列数
  formName?: string;              // 嵌套表单字段前缀
  container?: React.ComponentType; // 自定义分组容器
}
```

### SDetail.Group items 配置
```ts
{
  groupTitle?: string | ReactNode;
  items?: SDetailItem[];          // 分组内详情项
  groupItems?: SDetailProps[];    // 分组内多个详情面板
  dataSource?: Record<string, any>;
  hidden?: boolean;
}
```

### SButtonActionType 可选值
save | cancel | reset | upload | download | export | import | delete | view | back | next | previous | finish | create | edit | confirm | close | refresh | search | t-link

## SForm 表单控件 type 值
input | inputNumber | password | textarea | select | slider | radio | radioGroup | switch | treeSelect | upload | datePicker | SDatePicker | datePickerRange | SDatePickerRange | timePicker | timePickerRange | checkbox | checkGroup | cascader | SCascader | table | dependency

fieldProps 类型根据 type 自动推导。

## STable columns
render 除函数外可传字符串: "datetime" | "date" | "ellipsis"
dictKey 配合 SConfigProvider globalDict 自动映射。

## useSearchTable
```
const { tableProps, formConfig, form, getPageData, handleReset } = useSearchTable(requestFn, options);
```
Options:
  - form?: FormInstance<any> — 外部传入的表单实例
  - extraParams?: Record<string, any> — 额外请求参数，每次请求都会携带
  - manual?: boolean — 是否手动触发首次请求 @default false
  - dispatchParams?: (params?: any) => any — 请求前参数处理
  - serviceProps?: Options<any, any> — ahooks useRequest 配置
  - paginationFields?: PaginationFields — 分页字段映射
  - transformRequestParams?: (params: any) => any — 请求参数转换函数
  - transformResponseData?: (data: any) => any — 响应数据转换函数
Returns:
  - getPageData: (params?: any) => void — 手动触发数据加载
  - handleReset: () => void — 重置搜索并刷新
  - tableProps: TableProps<any> — 直接传给 STable/antd Table 的 props 包含 dataSource、pagination、loading
  - dataSource: any[] — 表格数据
  - pagination: false | TablePaginationConfig — 分页配置
  - loading: boolean — 加载状态
  - error: any — 错误信息
  - form: FormInstance<any> — 表单实例
  - formConfig: { — 搜索表单配置，直接展开传给 SForm.Search 包含 onFinish 和 onReset
  - onFinish: (params?: any) => void
  - onReset: () => void

## 示例

### 搜索表格页面
```tsx
import { SSearchTable, SFormItems, SColumnsType } from '@dalydb/sdesign';

const formItems: SFormItems[] = [
  { label: '姓名', name: 'name', type: 'input' },
  { label: '状态', name: 'status', type: 'select', fieldProps: { options: statusOptions } },
];
const columns: SColumnsType<any> = [
  { title: '姓名', dataIndex: 'name' },
  { title: '状态', dataIndex: 'status', dictKey: 'userStatus' },
  { title: '创建时间', dataIndex: 'createTime', render: 'datetime' },
];

<SSearchTable
  headTitle={{ children: '用户管理' }}
  requestFn={api.getUsers}
  formProps={{ items: formItems, columns: 3 }}
  tableProps={{ columns, rowKey: 'id' }}
/>
```

### 配置化表单
```tsx
import { SForm, SFormItems } from '@dalydb/sdesign';

const items: SFormItems[] = [
  { label: '姓名', name: 'name', type: 'input', required: '请输入姓名' },
  { label: '部门', name: 'dept', type: 'select', fieldProps: { options: deptOptions } },
  { label: '日期', name: 'date', type: 'SDatePicker' },
];

<SForm items={items} columns={2} onFinish={(values) => save(values)} />
```

### 详情展示
```tsx
import { SDetail, SDetailItem } from '@dalydb/sdesign';

const items: SDetailItem[] = [
  { label: '姓名', name: 'name' },
  { label: '状态', name: 'status', type: 'dict', dictKey: 'userStatus' },
  { label: '附件', name: 'files', type: 'file' },
];

<SDetail title="用户详情" dataSource={data} items={items} column={2} />
```

## 注意事项
1. 优先使用 S 前缀组件而非 antd 原生组件
2. SForm 通过 items 数组配置，不需要手动写 Form.Item
3. SSearchTable = SForm.Search + STable 一体化，列表页首选
4. SConfigProvider 提供全局字典，STable/SDetail 自动读取
5. SButton 用 actionType 选择预设类型，无需设置 children
6. 完整类型定义和 @example 见 node_modules/@dalydb/sdesign/dist 中的 .d.ts 声明文件