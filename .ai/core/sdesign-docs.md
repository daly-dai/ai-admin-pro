# @dalydb/sdesign 组件库文档

> ⚠️ 本文件由脚本自动生成，请勿手动修改
> 
> 源文件: node_modules/@dalydb/sdesign/ai/llms.txt
> 同步时间: 2026/3/9 23:31:58
> 版本: 1.3.2

---

# @dalydb/sdesign v1.3.2

基于 Ant Design 5.x 的企业级 React 组件库。所有组件以 S 前缀命名。

## 导入
```ts
import { SForm, STable, SSearchTable, SButton, SDetail } from '@dalydb/sdesign';
import type { SFormItems, SColumnsType, SDetailItem } from '@dalydb/sdesign';
import { useSearchTable } from '@dalydb/sdesign/hooks';
```

## 组件列表
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

## 组件类型定义

### SButton
> 增强按钮，支持 actionType 预设操作类型和按钮组

**SButtonProps** extends ButtonProps — SButton 增强按钮 Props 继承 antd Button，增加了 actionType 预设类型和 compact 紧凑模式。 ```tsx <SButton actionType="save" onClick={handleSave} /> <SButton actionType="delete" onClick={handleDelete} /> <SButton type="primary">自定义文字</SButton> ```
  - type?: ButtonProps['type'] — antd 按钮类型
  - actionType?: SButtonActionType — 预设操作类型，自动设置文字和样式
  - compact?: boolean — 紧凑模式，样式与 t-link 相同

**SButtonsItem** extends Partial<SButtonProps> — SButton.Group 中单个按钮的配置
  - key?: React.Key
  - visible?: boolean — 是否可见
  - render?: ReactNode | (() => ReactNode) — 自定义渲染

**SButtonsProps** — SButton.Group 按钮组 Props ```tsx <SButton.Group items={[ { actionType: 'create', onClick: handleAdd }, { actionType: 'export', onClick: handleExport }, { actionType: 'delete', visible: hasSelected, onClick: handleBatchDelete }, ]} /> ```
  - items?: SButtonsItem[] — 按钮配置数组
  - size?: SButtonProps['size'] — 统一尺寸
  - spaceProps?: React.ComponentProps<typeof Space> — Space 组件属性
  - disabled?: boolean — 统一禁用
  - loading?: boolean — 统一 loading

**SButtonActionType** — 预设操作按钮类型 可选值: `'save'` | `'cancel'` | `'reset'` | `'upload'` | `'download'` | `'export'` | `'import'` | `'delete'` | `'view'` | `'back'` | `'next'` | `'previous'` | `'finish'` | `'create'` | `'edit'` | `'confirm'` | `'close'` | `'refresh'` | `'search'` | `'t-link'`: `(typeof SButtonActionTypes)[number]`

### SCard
> 卡片容器，内置错误边界

**SCardProps** extends Omit<CardProps, 'children'> — SCard 卡片容器 Props 继承 antd Card，内置错误边界，内容出错时不影响整体页面。
  - children?: ReactNode
  - hasBottomPadding?: boolean — 底部是否包含边距

### SCascader
> 增强级联选择器

**SCascaderProps**: `Omit< CascaderProps<any>, 'onChange' | 'value' | 'defaultValue' | 'multiple' > & { onChange?: (value: string, selectOptions?: any[]) => void`

**SingleValueType**: `(string | number)[]`

**ValueType**: `SingleValueType | SingleValueType[] | undefined`

### SCheckGroup
> 复选框组

**SCheckGroupProps**: `CheckboxGroupType &`

**CheckboxGroupType**: `HTMLAttributes<object> &`

**CheckboxValueType**: `any`

### SCollapse
> 折叠面板

**SCollapseProps** extends ButtonProps — SCollapse 折叠面板 Props 用于控制内容区域的展开/折叠。
  - collapse?: boolean — 当前折叠状态
  - setCollapse?: (collapse: boolean) => void — 设置折叠状态
  - onExpand?: (collapse: boolean) => void — 展开/折叠回调

### SConfigProvider
> 全局配置（字典、上传地址），STable/SDetail 自动读取

**ConfigContextProps**
  - globalDict?: Record<string, Record<string, any> | any>
  - uploadUrl?: string
  - getPrefixCls: (suffixCls?: string, customizePrefixCls?: string) => string

**SConfigProviderType** — SConfigProvider 全局配置 Props 为 STable、SDetail 等组件提供全局字典和上传地址配置。 ```tsx <SConfigProvider globalDict={{ userStatus: { 1: '启用', 2: '禁用' } }} uploadUrl="/api/upload" > <App /> </SConfigProvider> ```
  - globalDict?: Record<string, any> — 全局字典数据，STable dictKey / SDetail dictKey 自动读取
  - uploadUrl?: string — 文件上传接口地址
  - children?: ReactNode
  - prefixCls?: string — 样式前缀

### SConfirm
> 确认组件，支持 Popconfirm 和 Modal 两种模式

**SConfirmProps** — SConfirm 确认组件 Props 统一封装了 Popconfirm 和 Modal.confirm 两种确认交互。 ```tsx <SConfirm type="pop" onConfirm={handleDelete}> <SButton actionType="delete" /> </SConfirm> <SConfirm type="modal" title="确认删除？" onConfirm={handleDelete}> <SButton actionType="delete" /> </SConfirm> ```
  - onConfirm?: () => void — 确认回调
  - onCancel?: () => void — 取消回调
  - type?: ConfirmType — 确认方式
  - text?: string — 确认提示文字
  - title?: React.ReactNode — 标题
  - description?: React.ReactNode — 描述
  - children?: React.ReactNode — 触发元素
  - popConfirmProps?: PopconfirmProps — Popconfirm 额外属性
  - buttonProps?: ButtonProps — 按钮额外属性
  - disabled?: boolean — 是否禁用
  - eventStop?: boolean — 是否阻止事件冒泡
  - modalProps?: ModalFuncProps — Modal.confirm 额外属性

**ConfirmType** — 确认方式类型 - `'pop'` — 气泡确认框 (Popconfirm) - `'modal'` — 模态对话框 (Modal.confirm): `(typeof ConfirmTypes)[number]`

### SDatePicker
> 增强日期选择器，onChange 直接返回字符串

**SDatePickerType** — SDatePicker 增强日期选择器 Props 与 antd DatePicker 不同，onChange 直接返回格式化后的字符串， value 支持字符串/Date/Dayjs 等多种格式，简化表单集成。 ```tsx <SDatePicker onChange={(dateStr) => console.log(dateStr)} /> ```: `Omit<DatePickerProps, 'onChange' | 'value'> & { onChange?: ( dateString?: string | string[] | null, date?: Dayjs | string | null, ) => void`

**PanelMode**: `| 'time'`

**PickerMode**: `Exclude<PanelMode, 'datetime' | 'decade'>`

### SDatePickerRange
> 日期范围选择器，支持 rangeKeys 拆分字段

**SDatePickerRangeProps** — SDatePickerRange 增强日期范围选择器 Props 相比 antd RangePicker，支持 rangeKeys 将日期范围拆分为两个独立字段， 方便表单提交。onChange 直接返回格式化字符串。 ```tsx // 拆分为 startDate 和 endDate 两个字段 <SDatePickerRange rangeKeys={['startDate', 'endDate']} /> ```: `Omit< RangePickerProps, 'value' | 'onChange' > & { value?: RangeValueValuesType; formatKeys?: RangeValueTuple; onChange?: ( formatString: RangeFormatString, values: RangeValueValuesType, ) => void`

**RangeValueType**: `string | string[] | number | Date | Dayjs | null`

**RangeValueValuesType**: `| RangeValueType[]`

**RangeDateType**: `Dayjs | null`

**RangeDateValueType**: `[RangeDateType, RangeDateType] | null`

**RangeValueTuple**: `[string, string]`

**RangeFormatString**: `RangeValueTuple | RangeValueObjectType`

### SDependency
> 字段依赖联动组件

**RenderChildren**: `( values: Record<string, any>, form: ProFormInstance<Values>, ) => React.ReactNode; export type SDependencyProps<T = Record<string, any>> = Omit<`

### SDetail
> 详情展示，支持 8 种渲染类型（text/dict/file/img 等）

**SDetailProps** extends Omit<DescriptionsProps, 'items' | 'title'> — SDetail 详情展示组件 Props 基于 antd Descriptions 封装，支持 8 种数据类型自动渲染。 配合 SConfigProvider 可自动进行字典映射。 ```tsx <SDetail title="用户详情" dataSource={userData} items={[ { label: '姓名', name: 'name' }, { label: '状态', name: 'status', type: 'dict', dictKey: 'userStatus' }, ]} column={2} /> ```
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

**DictReflect**
  - label?: string
  - name?: string

**SDetailGroupItem** — SDetail.Group 分组配置项
  - groupTitle?: string | ReactNode — 分组标题
  - groupTitleProps?: Omit<STitleProps, 'title'> — 分组标题 Props
  - groupContainer?: React.ComponentType<any> — 分组容器组件
  - groupItems?: SDetailProps[] — 分组内的多个详情面板
  - items?: SDetailItem[] — 分组内的详情项
  - itemProps?: Omit<SDetailProps, 'items' | 'dataSource'> — 面板公共配置
  - dataSource?: Record<string, any> — 分组数据源
  - hidden?: boolean — 是否隐藏该分组

**SDetailGroupProps** — SDetail.Group 分组详情 Props 将详情按分组展示，每组可有独立标题和数据源。 ```tsx <SDetail.Group dataSource={data} items={[ { groupTitle: '基本信息', items: [...] }, { groupTitle: '扩展信息', items: [...] }, ]} /> ```
  - items?: SDetailGroupItem[] — 分组配置数组
  - dataSource?: Record<string, any> — 全局数据源

**ItemType** — 详情项渲染类型 - `'text'` — 纯文本 - `'dict'` — 字典映射，自动从 globalDict 转换 - `'file'` — 文件列表展示 - `'img'` — 图片展示 - `'rangeTime'` — 时间范围 - `'checkbox'` — 多选值展示 - `'empty'` — 空占位 - `'placeholder'` — 占位符: `(typeof ItemTypes)[number]`

**SDetailItemType** — SDetail 单个详情项配置 ```tsx const items: SDetailItem[] = [ { label: '姓名', name: 'name' }, { label: '状态', name: 'status', type: 'dict', dictKey: 'userStatus' }, { label: '附件', name: 'files', type: 'file' }, { label: '自定义', render: (val, data) => <Tag>{val}</Tag> }, ]; ```: `DetailItemType & { label?: ReactNode; name?: string | string[]; render?: (value?: any, dataSource?: any) => ReactNode`

**DetailItemType**
  - type?: ItemType — 渲染类型
  - fileProps?: Partial<FileListProps> — 文件展示配置，type='file' 时有效
  - dictReflect?: DictReflect — 字典映射关系
  - dictKey?: string — 字典 key，配合 SConfigProvider globalDict
  - value?: any
  - dictMap?: Record<string, string> | any[] | null — 字典数据源
  - render?: (value?: any, dataSource?: any) => ReactNode
  - dataSource?: Record<string, any>

**SDetailItem**: `SDetailItemType &`

### SErrorBoundary
> 错误边界

**SErrorBoundaryTypes**
  - children?: ReactNode
  - fallbackRender?: (props: FallbackProps) => ReactNode

### SErrorCom
> 错误展示

**SErrorComProps**
  - text?: string
  - style?: React.CSSProperties
  - iconStyle?: React.CSSProperties

### SFile
> 文件上传/列表

**FileListProps**: `Omit<FileItemType, 'fileData'> & { label?: string; fileList: any[]; style?: React.CSSProperties; direction?: directionType; itemRender?: (data: FileDataType[]) => ReactNode | null`

**ReflectFile**
  - fileName: string
  - fileUrl: string

**FileDataType**
  - id?: string
  - fileName: string — 文件名称
  - fileUrl: string — 文件地址

**directionType**: `(typeof DirectionTypes)[number]`

**FileIconMapFieldType**: `(typeof FileIconMapFieldTypes)[number]`

**FileItemType**
  - fileData?: FileDataType
  - style?: React.CSSProperties
  - onFileHandle?: (file: FileDataType) => void
  - reflect?: ReflectFile
  - nameLimit?: number
  - className?: string
  - children?: ReactNode
  - canClickName?: boolean
  - onClick?: (data: any) => void
  - fileIconMapField?: FileIconMapFieldType

### SForm
> 配置化表单，items 数组声明 22 种控件、联动、分组、搜索

**SFormProps** extends FormProps — SForm 表单组件 Props 继承 antd Form 全部属性，扩展了配置化表单能力。 通过 `items` 数组声明式定义表单，无需手动写 Form.Item。 ```tsx <SForm columns={2} items={[ { label: '姓名', name: 'name', type: 'input', required: true }, { label: '部门', name: 'dept', type: 'select', fieldProps: { options } }, ]} onFinish={(values) => console.log(values)} /> ```
  - rowProps?: RowProps — 行布局配置
  - children?: ReactNode
  - items?: Array<SFormItems<FormItemType>> — 表单项配置数组，核心属性
  - columns?: number — 列数，表单项自动等分排列
  - required?: string | boolean — 全局必填设置 - true: 所有项必填 - string: 所有项必填且使用该提示
  - onFinish?: (e?: any) => void — 表单提交回调
  - onReset?: (e?: any) => void — 表单重置回调
  - readonly?: boolean — 只读模式
  - formName?: string — 嵌套表单的字段前缀

**ItemsProps** extends Omit<FormItemProps, 'label | name' | 'required'> — 表单项配置 用于 SForm 的 `items` 数组中，每一项描述一个表单控件。 `type` 决定渲染哪种控件，`fieldProps` 类型会根据 `type` 自动推导。 ```tsx const item: ItemsProps = { label: '用户名', name: 'username', type: 'input', required: '请输入用户名', fieldProps: { placeholder: '请输入' }, }; ```
  - label?: ReactNode — 表单项标签
  - name?: NamePath — 表单项字段名，支持嵌套路径如 ['user', 'name']
  - style?: React.CSSProperties
  - type?: T — 控件类型，决定渲染哪种表单组件
  - depNames?: string[] — 依赖的字段名数组，仅在 type='dependency' 时生效
  - fieldProps?: T extends keyof FormFieldMapType — 控件属性，类型根据 type 自动推导 例如 type='select' 时，fieldProps 支持 options/mode 等 Select 属性
  - customCom?: ReactNode | RenderChildren<any> — 自定义组件，替代 type 内置组件
  - regKey?: RegKeyType — 内置校验规则 key，如 'phone'、'percentage' 等
  - render?: RenderChildren<any> — 自定义渲染函数
  - required?: string | boolean — 是否必填 - true: 使用默认提示 - string: 使用自定义提示文字
  - disabled?: boolean — 是否禁用
  - readonly?: boolean — 只读模式，展示文本而非控件
  - formName?: string — 嵌套表单的字段前缀，用于数据结构嵌套
  - children?: ReactNode

**SFormItems** extends ItemsProps<T> — SForm 表单项配置（带布局） 在 ItemsProps 基础上增加了栅格布局和显隐控制。
  - colProps?: ColProps — 栅格布局配置，控制单个表单项占据的列宽
  - hidden?: boolean — 是否隐藏该表单项（隐藏后仍参与表单提交）

**SFormGroupProps** extends FormProps — SForm.Group 分组表单 Props 将表单分为多个带标题的分组区块展示。 ```tsx <SForm.Group groupItems={[ { title: '基本信息', items: [...], columns: 2 }, { title: '详细信息', items: [...], columns: 3 }, ]} onFinish={handleSubmit} /> ```
  - groupItems?: GroupItemsType[] — 分组配置数组
  - onFinish?: (e: any) => void
  - onReset?: (e: any) => void
  - container?: React.ComponentType<any> — 自定义容器组件
  - formName?: string — 嵌套表单的字段前缀
  - children?: ReactNode
  - readonly?: boolean — 只读模式

**SearchProps** extends SFormProps — SForm.Search 搜索表单 Props 继承 SFormProps，增加了展开/收起、操作按钮等搜索场景功能。 通常与 STable/useSearchTable 配合使用。 ```tsx <SForm.Search form={form} items={searchItems} columns={3} showExpand {...formConfig} /> ```
  - defaultExpand?: boolean — 是否默认展开所有搜索项
  - showExpand?: boolean — 是否显示展开/收起按钮
  - onExpand?: (expand: boolean) => void — 展开/收起回调
  - expandLine?: number — 收起时显示的行数
  - actionNode?: ReactNode — 搜索栏右侧自定义操作节点
  - container?: React.ComponentType<any> — 自定义组件容器
  - isCard?: boolean — 是否包裹在卡片中

**FormFieldMapType** — 表单控件类型映射表 定义了 SForm items 中 `type` 字段所有可选值及其对应组件。 使用时，`fieldProps` 的类型会根据 `type` 自动推导。 ```tsx const items: SFormItems[] = [ { label: '姓名', name: 'name', type: 'input' }, { label: '年龄', name: 'age', type: 'inputNumber' }, { label: '性别', name: 'gender', type: 'select', fieldProps: { options: [...] } }, { label: '日期', name: 'date', type: 'SDatePicker' }, ]; ```
  - input: typeof SInput — 文本输入框 (SInput 增强版，支持 trim/onEnter)
  - inputNumber: typeof InputNumber — 数字输入框
  - password: typeof Input.Password — 密码输入框
  - textarea: typeof Input.TextArea — 多行文本输入
  - select: typeof SSelect — 下拉选择器 (SSelect 增强版)
  - slider: typeof Slider — 滑动输入条
  - radio: typeof Radio — 单选按钮
  - radioGroup: typeof SRadioGroup — 单选按钮组 (SRadioGroup)
  - switch: typeof Switch — 开关
  - treeSelect: typeof TreeSelect — 树选择
  - upload: typeof Upload — 文件上传
  - datePicker: typeof DatePicker — antd 日期选择器
  - SDatePicker: typeof SDatePicker — 增强日期选择器，onChange 直接返回字符串
  - datePickerRange: typeof DatePicker.RangePicker — antd 日期范围选择器
  - SDatePickerRange: typeof SDatePickerRange — 增强日期范围选择器，支持 rangeKeys 拆分
  - timePicker: typeof TimePicker — 时间选择器
  - timePickerRange: typeof TimePicker.RangePicker — 时间范围选择器
  - checkbox: typeof Checkbox — 复选框
  - checkGroup: typeof SCheckGroup — 复选框组 (SCheckGroup)
  - cascader: typeof Cascader — antd 级联选择器
  - SCascader: typeof SCascader — 增强级联选择器
  - table: typeof Table — 嵌套表格
  - dependency: typeof SDependency — 字段依赖联动

**FormComType** — 表单控件类型 可选值: `'input'` | `'inputNumber'` | `'password'` | `'textarea'` | `'select'` | `'slider'` | `'radio'` | `'radioGroup'` | `'switch'` | `'treeSelect'` | `'upload'` | `'datePicker'` | `'SDatePicker'` | `'datePickerRange'` | `'SDatePickerRange'` | `'timePicker'` | `'timePickerRange'` | `'checkbox'` | `'checkGroup'` | `'cascader'` | `'SCascader'` | `'table'` | `'dependency'`: `keyof FormFieldMapType`

**FormComPropsType**: `HTMLAttributes<object> &`

**FormItemType**: `FormComType | 'placeholder'`

**GroupItemsType** — 分组表单项配置 用于 SForm.Group 的 groupItems，将表单分成多个带标题的区块。
  - container?: React.ComponentType<any> — 自定义分组容器组件
  - columns?: number — 该分组的列数
  - title?: ReactNode — 分组标题
  - items?: Array<SFormItems<FormItemType>> — 该分组的表单项
  - rowProps?: RowProps
  - formName?: string — 嵌套表单的字段前缀

### SFrameAnimation
> 帧动画

**FrameAnimationProps**
  - direction?: 'vertical' | 'horizontal' — 帧动画方向
  - imgNumber: number — 图片的数量
  - frameNumber?: number — 一秒钟的动画量默认为60
  - width: React.CSSProperties['width']
  - height: React.CSSProperties['height']
  - icon: string — icon地址
  - style?: React.CSSProperties

### SInput
> 增强输入框，支持 trim、onEnter

**SInputProps** extends Omit<InputProps, 'onChange'> — SInput 增强输入框 Props 继承 antd Input，增加了 trim 和 onEnter 便捷功能。 ```tsx <SInput trim onEnter={(val) => search(val)} placeholder="搜索" /> ```
  - value?: string
  - onChange?: (value: string) => void — onChange 直接返回 string 值（非 event）
  - trim?: boolean — 是否自动去除首尾空格
  - onEnter?: (value?: string) => void — 按回车键触发的回调

### SLucideIcon
> Lucide 图标

**AntdLucideIconProps**
  - name: LucideIconName — lucide 图标名称（自动提示所有可选值）
  - size?: number | string — 尺寸（默认 1em 对齐 antd，支持数字/字符串）
  - strokeWidth?: number — 线条粗细（默认 2 对齐 antd Outlined）
  - color?: string — 颜色（默认继承父元素 currentColor）

**LucideIconName**: `keyof typeof LucideIcons`

### SNoData
> 无数据占位

**NotDataProps**
  - text?: ReactNode
  - type?: sizeType
  - className?: string
  - componentName?: string
  - imgProps?: React.DetailedHTMLProps< React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement >

**sizeType**: `'small' | 'middle' | 'large'`

**NoDataTypes**: `NotDataProps &`

### SRadioGroup
> 单选框组

**SRadioGroupProps**: `RadioType & ExtraComType`

**RadioType**: `HTMLAttributes<object> &`

### SSearchTable
> SForm.Search + STable 一体化，列表页首选

**SearchTableProps** — SSearchTable 搜索表格组件 Props 集成 SForm.Search + STable 的一体化组件，是管理后台列表页的首选方案。 自动处理搜索、分页、数据加载的联动逻辑。 ```tsx <SSearchTable headTitle={{ children: '用户管理' }} requestFn={async (params) => { const res = await api.getUsers(params); return { dataList: res.list, totalSize: res.total }; }} formProps={{ items: [ { label: '姓名', name: 'name', type: 'input' }, { label: '状态', name: 'status', type: 'select', fieldProps: { options } }, ], columns: 3, }} tableProps={{ columns: [ { title: '姓名', dataIndex: 'name' }, { title: '创建时间', dataIndex: 'createTime', render: 'datetime' }, ], rowKey: 'id', }} /> ```
  - headTitle?: STitleProps — 页面顶部标题配置
  - tableTitle?: STitleProps — 表格区域标题配置
  - requestFn: (data?: any) => Promise<any> — 数据请求函数 接收搜索参数 + 分页参数，返回包含列表数据和总数的对象。 默认字段映射: `{ dataList, totalSize, pageNum, pageSize }`， 可通过 options.paginationFields 自定义。
  - options?: Omit<useSearchTableOptions, 'form'> — useSearchTable 的配置选项
  - tableProps?: STableProps<any> — 表格 props，会合并到 useSearchTable 返回的 tableProps 中
  - formProps?: SearchProps — 搜索表单 props，透传给 SForm.Search

**SearchTableRef** — SSearchTable 的 ref 方法 通过 ref 可以从外部控制表格刷新、重置等操作。 ```tsx const tableRef = useRef<SearchTableRef>(null); tableRef.current?.refresh();       // 刷新当前页 tableRef.current?.reset();         // 重置搜索并刷新 tableRef.current?.getForm();       // 获取表单实例 ```
  - refresh: (params?: any) => void — 刷新表格数据，可传入额外参数合并到请求中
  - reset: () => void — 重置搜索条件并刷新到第一页
  - getForm: () => any — 获取内部表单实例，用于外部操作表单

### SSelect
> 增强选择器

**SSelectProps**: `SelectType & ExtraComType`

**SelectType**: `HTMLAttributes<object> & ComponentProps<typeof Select>`

### STable
> 增强表格，支持 dictKey 字典映射、render 快捷类型、序号列

**STableProps** extends Omit<TableProps<RecordType>, 'columns'> — STable 增强表格 Props 继承 antd Table 全部属性，扩展了字典映射、序号列、快捷 render 等能力。 ```tsx <STable columns={[ { title: '姓名', dataIndex: 'name' }, { title: '状态', dataIndex: 'status', dictKey: 'userStatus' }, { title: '时间', dataIndex: 'createTime', render: 'datetime' }, ]} dataSource={data} isSeq /> ```
  - columns?: SColumnsType<RecordType> — 列定义，支持 dictKey 和字符串 render
  - isSeq?: boolean — 是否显示序号列
  - current?: number — 当前页码（用于序号计算）
  - pageSize?: number — 每页条数（用于序号计算）

**DataType**
  - dataIndex: React.Key
  - title: string
  - width: number
  - dictKey?: string | undefined
  - render: () => void

**RenderType** — 列 render 快捷类型 在 columns 的 render 中可直接传字符串： - `'datetime'` — 渲染为日期时间格式 - `'date'` — 渲染为日期格式 - `'ellipsis'` — 超出省略显示: `(typeof RenderTypes)[number]`

**SColumnsType** — STable 列定义类型: `SColumn<RecordType>[]`

### STitle
> 标题组件（page/table/form 三种类型）

**STitleProps** extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'prefix'> — STitle 标题组件 Props ```tsx <STitle type="page" goBack onBackClick={() => navigate(-1)}> 用户详情 </STitle> ```
  - prefix?: ReactNode — 标题前缀自定义内容
  - gap?: number | string — 标题与内容的间距
  - goBack?: boolean — 是否显示返回按钮
  - type?: TitleType — 标题类型，影响字号和样式
  - desc?: ReactNode — 描述文字
  - actionNode?: ReactNode — 右侧操作区
  - style?: React.CSSProperties
  - hasBottomMargin?: boolean | number | string — 底部间距
  - fontSize?: CSSProperties['fontSize']
  - onBackClick?: () => void — 返回按钮点击回调
  - children?: ReactNode — 标题文字

**TitleType** — 标题类型 - `'page'` — 页面级标题（较大字号） - `'table'` — 表格区域标题 - `'form'` — 表单区域标题: `(typeof TitleTypes)[number]`

## Hook 列表与类型定义

### useComStyle

**签名**
```ts
useComStyle({ prefixCls, useStylesHook }: useComStyleProps)
```

### useDispatchDict

**签名**
```ts
useDispatchDict({ dict, disableKeys, options, }: useDispatchDictType)
```

### useExpand

**签名**
```ts
useExpand({ columns, items, showExpand, defaultExpand = true, }: useExpandProps)
```

### useFrameAnimation

**签名**
```ts
useFrameAnimation(props: UseFrameAnimationProps)
```

### useGetDictData

### useNumInput

**签名**
```ts
useNumInput(defaultVal = ''): [string, (e: any) => void]
```

### useScale

### useSearchLayout

**签名**
```ts
useSearchLayout({ columns, items, prefixCls, styles, }: { columns: number; items: ReactNode[] | any[]; prefixCls: string; styles?: Record<string, string>; })
```

### useSearchTable

**PaginationFields** — 分页字段映射配置 用于适配后端接口的分页字段名，默认值对应常见的后端接口规范。
  - current?: string — 当前页码字段名
  - pageSize?: string — 每页条数字段名
  - total?: string — 总条数字段名
  - list?: string — 数据列表字段名

**useSearchTableOptions** — useSearchTable Hook 配置选项 ```tsx const { tableProps, formConfig, form } = useSearchTable( (params) => api.getList(params), { manual: false, paginationFields: { list: 'records', total: 'total' }, extraParams: { orgId: '123' }, } ); ```
  - form?: FormInstance<any> — 外部传入的表单实例
  - extraParams?: Record<string, any> — 额外请求参数，每次请求都会携带
  - manual?: boolean — 是否手动触发首次请求
  - dispatchParams?: (params?: any) => any — 请求前参数处理
  - serviceProps?: Options<any, any> — ahooks useRequest 配置
  - paginationFields?: PaginationFields — 分页字段映射
  - transformRequestParams?: (params: any) => any — 请求参数转换函数
  - transformResponseData?: (data: any) => any — 响应数据转换函数

**useSearchTableProps** extends useSearchTableOptions
  - requestFn: (data?: any) => Promise<any> — 数据请求函数

**useSearchTableReturnType** — useSearchTable 返回值 ```tsx const { tableProps, formConfig, form } = useSearchTable(requestFn, options); // 搜索表单 <SForm.Search form={form} items={searchItems} {...formConfig} /> // 数据表格 <STable {...tableProps} columns={columns} /> ```
  - getPageData: (params?: any) => void — 手动触发数据加载
  - handleReset: () => void — 重置搜索并刷新
  - tableProps: TableProps<any> — 直接传给 STable/antd Table 的 props 包含 dataSource、pagination、loading
  - dataSource: any[] — 表格数据
  - pagination?: false | TablePaginationConfig — 分页配置
  - loading?: boolean — 加载状态
  - error?: any — 错误信息
  - form: FormInstance<any> — 表单实例
  - formConfig: { onFinish: (params?: any) => void — 搜索表单配置，直接展开传给 SForm.Search 包含 onFinish 和 onReset
  - onReset: () => void

### useStepForm

**签名**
```ts
useStepForm({ formInstanceList }: StepFormProps)
```

### useFormPerformance

**签名**
```ts
useFormPerformance(formName?: string)
```

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