# 合同管理

> 为企业提供合同全生命周期的管理能力，包括合同创建、审批、执行和归档

## 背景

企业需要统一管理合同，减少纸质合同遗失风险，并支持合同审批流程以规范合同签订。

## 需求概要

提供合同的增删改查管理功能，支持合同状态流转（草稿、待审批、已审批、执行中、已完成、已终止），包含合同创建、提交审批、审批通过、终止等操作。合同列表支持按关键词、状态、类型、签约日期范围搜索。

## Task 拆解

> 每个 Task 必须满足：
>
> - **独立可执行**：不依赖其他 Task 的代码（依赖关系需声明）
> - **可验证**：有明确的完成标准
> - **边界清晰**：范围明确，不模糊

### Task 1: 合同 API 模块

**类型**: api

**描述**:
创建合同管理的 API 模块，定义 Contract 数据类型、查询参数 ContractQuery、表单数据 ContractFormData，并实现标准 CRUD 方法及非标准接口（提交审批、审批通过、批量审批、终止合同）。

**前置条件**: 无

**文件清单**:

- src/api/contract/types.ts (新建)
- src/api/contract/index.ts (新建)

**完成标准**:

- [ ] Contract 接口定义完整，包含所有字段（id, contractNo, title, partyA, partyB, amount, signDate, startDate, endDate, status, type, remark, createTime, updateTime）
- [ ] ContractStatus 和 ContractType 枚举定义正确
- [ ] ContractQuery 支持 keyword、status、type、signDateRange 筛选
- [ ] contractApi 对象导出 getList、getById、create、update、delete 标准方法
- [ ] contractApi 对象导出 submitReview、approve、batchApprove、terminate 非标准方法
- [ ] 占位 API URL 使用 '/api/TODO/contract' 格式
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/api-module.md
- [ ] .ai/conventions/api-conventions.md

**关键决策**:

- API 方法命名遵循标准：getListByGet、getByIdByGet、createByPost、updateByPut、deleteByDelete
- 非标准接口方法命名：submitReviewByPut、approveByPut、batchApproveByPut、terminateByPut
- 分页参数使用 PageQuery 基类

### Task 2: 合同列表页

**类型**: page-list

**描述**:
创建合同管理列表页，使用 SSearchTable 一体化组件，包含搜索区域（关键词、状态、类型、签约日期范围）和表格列（合同编号、合同标题、甲方、乙方、金额、签约日期、状态、操作列）。操作列包含查看详情、编辑（仅草稿/待审批状态）、删除（仅草稿状态）、提交审批（仅草稿状态）按钮。表格上方提供新增按钮和批量审批按钮（选中待审批合同可操作）。

**前置条件**: Task 1

**文件清单**:

- src/pages/contract/index.tsx (新建)

**完成标准**:

- [ ] SSearchTable 渲染正常，展示合同列表
- [ ] 搜索区域包含所有指定字段，类型正确（input、select、SDatePickerRange）
- [ ] 表格列显示正确，金额使用千分位格式，状态使用 Tag 映射
- [ ] 操作列按钮根据合同状态条件显示
- [ ] 新增按钮跳转到新增页
- [ ] 批量审批按钮在选中待审批合同时可用
- [ ] 删除操作二次确认
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/crud-page.md
- [ ] .ai/sdesign/components/SSearchTable.md
- [ ] .ai/sdesign/components/SButton.md
- [ ] .ai/sdesign/components/SForm.md

**关键决策**:

- 使用 SSearchTable 一体化组件，减少代码量
- 状态枚举映射使用 dictMap 配置
- 金额格式化使用 `new Intl.NumberFormat('zh-CN').format`
- 操作列按钮使用 SButton.Group

### Task 3: 合同新增页

**类型**: page-form

**描述**:
创建合同新增页面，使用独立页面（字段>8个），包含合同编号、合同标题、合同类型、甲方、乙方、合同金额、签约日期、生效日期、到期日期、备注等字段，2列布局。当合同类型为“租赁合同”时，额外显示“租赁期限(月)”字段。

**前置条件**: Task 1

**文件清单**:

- src/pages/contract/create.tsx (新建)

**完成标准**:

- [ ] SForm 表单渲染正常，包含所有必填字段
- [ ] 表单布局为2列
- [ ] 合同类型为 lease 时动态显示租赁期限字段
- [ ] 表单提交调用 createByPost 接口
- [ ] 提交成功后跳转回列表页
- [ ] 金额输入框精度为分（小数点后2位）
- [ ] 日期验证：到期日期晚于生效日期
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/form-page.md
- [ ] .ai/sdesign/components/SForm.md
- [ ] .ai/sdesign/components/SDatePicker.md

**关键决策**:

- 使用独立页面而非弹窗（字段>8）
- 字段联动使用 SForm.useWatch 动态控制租赁期限字段显隐
- 日期字段使用 SDatePicker 组件，返回字符串格式
- 金额字段使用 InputNumber，精度通过 step=0.01 控制

### Task 4: 合同编辑页

**类型**: page-form

**描述**:
创建合同编辑页面，与新增页类似，但加载已有合同数据并允许编辑。仅草稿和待审批状态的合同可编辑。

**前置条件**: Task 1, Task 3（可复用表单逻辑）

**文件清单**:

- src/pages/contract/edit.tsx (新建)

**完成标准**:

- [ ] 根据路由参数 id 加载合同详情
- [ ] 表单填充已有数据
- [ ] 仅当合同状态为 draft 或 pending_review 时允许编辑（否则只读或禁用）
- [ ] 表单提交调用 updateByPut 接口
- [ ] 提交成功后跳转回列表页
- [ ] 所有验证规则与新增页一致
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/form-page.md
- [ ] .ai/sdesign/components/SForm.md

**关键决策**:

- 复用新增页的表单配置，通过 mode 参数区分
- 使用 useRequest 加载详情数据
- 根据状态设置 readonly 属性

### Task 5: 合同详情页

**类型**: page-detail

**描述**:
创建合同详情页面，展示合同所有字段，分组展示：基本信息、合同双方、金额与日期、其他信息。2列布局。

**前置条件**: Task 1

**文件清单**:

- src/pages/contract/detail.tsx (新建)

**完成标准**:

- [ ] 根据路由参数 id 加载合同详情
- [ ] 使用 SDetail.Group 分组展示字段
- [ ] 状态和类型字段使用字典映射显示文本
- [ ] 金额格式化为千分位
- [ ] 日期字段格式化
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/detail-page.md
- [ ] .ai/sdesign/components/SDetail.md

**关键决策**:

- 使用 SDetail.Group 实现分组展示
- 字典映射通过 dictMap 实现（无需全局字典配置）

---

## 验证计划

| 验证层级 | 验证方式         | 覆盖范围  |
| -------- | ---------------- | --------- |
| 代码级   | pnpm verify      | 所有 Task |
| 功能级   | 页面交互测试     | 所有 Task |
| 业务级   | 对照需求逐条检查 | 整个功能  |

## 风险与备注

- 合同编号全局唯一性由后端保障，前端仅做输入校验
- 状态流转部分操作（如自动生效、自动完成）由后端处理
- 批量审批接口需要传递 ids 数组，前端需处理选中逻辑
- 租赁期限字段仅在类型为 lease 时显示，需要动态表单逻辑
