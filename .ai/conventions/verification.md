# 验证流程规范

> 定义 AI 生成代码后的验证标准，确保每个 Task 的交付质量

## 三级验证体系

`Task 开发完成
    ↓
【Level 1】代码级验证（自动化）
    ↓ 通过
【Level 2】功能级验证（AI 辅助 + 人工）
    ↓ 通过
【Level 3】业务级验证（人工）
    ↓ 通过
Task 完成 ✓`

---

## Level 1: 代码级验证（自动化，AI 自执行）

> **执行者**：AI（自动执行）
> **触发时机**：每个 Task 代码生成后立即执行

### 验证命令

`bash
pnpm verify        # tsc + eslint + prettier 全量检查
`

### 验证内容

| 检查项          | 工具     | 说明                                         |
| --------------- | -------- | -------------------------------------------- |
| TypeScript 类型 | sc       | 类型错误、缺失导入、类型不匹配               |
| ESLint 规则     | eslint   | 禁止 any、禁止直接 axios、组件约束、导入路径 |
| Prettier 格式   | prettier | 代码格式统一                                 |

### 自修复流程

`pnpm verify → 有错误 → 按优先级修复 → 再次 verify
                              ↓
                    最多 3 轮，仍有错误 → 报告给用户`

**修复优先级**： sc 错误 > eslint 错误 > prettier 格式

### 通过标准

`bash
$ pnpm verify

# 输出：无错误，0 exit code

`

---

## Level 2: 功能级验证（AI 辅助 + 人工确认）

> **执行者**：AI 检查清单 + 人工确认
> **触发时机**：Level 1 通过后

### AI 自检清单

AI 在提交代码前，**必须**逐条自检以下项目：

#### 组件约束检查

`markdown

- [ ] 目标文件不在豁免目录（login/error/layouts/router）
- [ ] 业务页面使用 SSearchTable 而非 antd Table
- [ ] 业务页面使用 SForm 而非 antd Form
- [ ] 业务页面使用 SButton 而非 antd Button
- [ ] 业务页面使用 SDetail 而非 antd Descriptions
- [ ] 未使用 sdesign 中不存在的组件（如 ~~SModal~~、~~SDrawer~~）
      `

#### 代码质量检查

`markdown

- [ ] 无 any 类型
- [ ] 未直接 import axios，使用 request 封装
- [ ] 类型导入使用 import type { ... }
- [ ] 路径使用 @/ 或 src/ 别名，无 ../../ 相对路径
- [ ] 状态管理使用 Zustand，无 Redux
- [ ] API 对象命名正确（{module}Api）
- [ ] API 方法名添加了 HTTP 后缀（getListByGet/createByPost 等，禁止无后缀的 getList/create）
- [ ] API 标准方法齐全（getListByGet/getByIdByGet/createByPost/updateByPut/deleteByDelete）
- [ ] 回调函数中未使用的参数已加 `_` 前缀（如 render 中 `(_, record) => ...`）
- [ ] 页面中使用 useRequest，避免手动定义 loading/data/error
      `

#### 文件完整性检查

`markdown

- [ ] types.ts 中类型定义完整（Entity, EntityQuery, EntityFormData）
- [ ] API 模块统一导出（api/index.ts）
- [ ] 页面文件包含 index.tsx
- [ ] 页面私有组件放在 components/ 子目录
- [ ] 路由配置已更新（如需要）
      `

#### JSX 特有检查

`markdown

- [ ] SForm 字段联动是否用 `type: 'dependency'` + `depNames` 而非外部 useWatch 控制渲染？
- [ ] SDatePickerRange 是否用 `rangeKeys` 拆分字段而非手动 getFieldValue 拆分？
- [ ] Modal 是否使用条件渲染 `{open && <Modal/>}` 而非 destroyOnClose？
- [ ] Modal/Drawer 是否封装在子组件内部，而非由列表页管理 open 状态？
- [ ] 列表页是否仅通过 ref 或 props 触发弹层，不直接持有弹层状态？
      `

### 人工确认点

AI 自检通过后，标记为「AI 自检通过」，以下项目由人工最终确认：

`markdown

- [ ] 页面在开发服务器中正常渲染（无白屏、无报错）
- [ ] 搜索/筛选功能可用
- [ ] 分页功能正常
- [ ] 表单提交成功，数据正确
- [ ] 编辑模式数据回填正确
- [ ] 删除操作有确认提示
      `

---

## Level 3: 业务级验证（人工）

> **执行者**：人工
> **触发时机**：Level 2 通过后，或在功能联调完成后

### 验证方式

对照 specs/[feature]/spec.md 中的需求概要和完成标准，逐条验证。

### 验证清单模板

`markdown

## [功能名称] 业务验证

### 核心功能

- [ ] [需求点1] 描述 → 实际表现：
- [ ] [需求点2] 描述 → 实际表现：
- [ ] [需求点3] 描述 → 实际表现：

### 边界情况

- [ ] 空数据状态展示
- [ ] 超长文本截断/换行
- [ ] 必填字段未填的提示
- [ ] 网络异常时的错误提示
- [ ] 重复提交的防护

### 联调验证

- [ ] 接口返回数据格式与预期一致
- [ ] 分页参数和响应正确
- [ ] 新增后列表刷新
- [ ] 编辑后数据更新
- [ ] 删除后列表刷新
      `

---

## 验证与 Task 的对应关系

每个 Task 的 spec.md 中已定义「完成标准」，验证时严格对照执行：

`Task 完成标准
├── 包含 pnpm verify → Level 1 覆盖
├── 包含页面渲染/交互 → Level 2 覆盖
└── 包含业务需求匹配 → Level 3 覆盖`

## 快速验证流程（简易场景）

对于简单的 Task（如纯 API 模块、纯样式调整），可以简化为：

`pnpm verify（Level 1）→ AI 自检清单（Level 2 核心）→ 完成`

跳过 Level 3，但必须在 Task 的完成标准中注明：「本 Task 无需业务级验证」。

## 验证失败处理

| 失败层级 | 处理方式                                   |
| -------- | ------------------------------------------ |
| Level 1  | AI 自动修复，最多 3 轮                     |
| Level 2  | AI 修复后重新自检，仍不通过则报告用户      |
| Level 3  | 标记为未通过，记录问题，回到对应 Task 修复 |
