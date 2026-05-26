# 简单 CRUD 页面

> 提供基础数据的增删改查功能，支持按名称模糊搜索

## 背景

用户需要管理基础数据，包括数据的查询、新增、编辑和删除操作。

## 需求概要

提供基础数据的管理功能，包括列表查询（支持按名称模糊搜索）、新增、编辑和删除。列表展示名称、状态、创建时间等信息。

## Task 拆解

### Task 1: 基础数据 API 模块

**类型**: api

**描述**:
创建基础数据管理的 API 模块，定义数据类型和接口方法。

**前置条件**: 无

**文件清单**:

- src/api/product/types.ts (新建)
- src/api/product/index.ts (新建)

**完成标准**:

- [ ] Product 接口定义完整（id, name, status, remark, createTime）
- [ ] ProductQuery 支持按名称模糊搜索
- [ ] productApi 对象导出 getList/getById/create/update/delete
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/api-module.md
- [ ] .ai/conventions/api-conventions.md

### Task 2: 基础数据列表页

**类型**: page-list

**描述**:
创建基础数据列表页，支持搜索和分页。

**前置条件**: Task 1

**文件清单**:

- src/pages/product/index.tsx (新建)

**完成标准**:

- [ ] SSearchTable 渲染正常，展示名称、状态、创建时间
- [ ] 支持按名称模糊搜索
- [ ] 操作列：编辑、删除
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/crud-page.md
- [ ] .ai/sdesign/components/SSearchTable.md
- [ ] .ai/sdesign/components/SButton.md

### Task 3: 基础数据新增页

**类型**: page-form

**描述**:
创建基础数据新增表单页。

**前置条件**: Task 1

**文件清单**:

- src/pages/product/create.tsx (新建)

**完成标准**:

- [ ] SForm 包含：名称（必填）、状态（下拉）、备注（文本）
- [ ] 名称必填校验
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/form-page.md
- [ ] .ai/sdesign/components/SForm.md

### Task 4: 基础数据编辑页

**类型**: page-form

**描述**:
创建基础数据编辑表单页，支持数据回填。

**前置条件**: Task 1

**文件清单**:

- src/pages/product/edit.tsx (新建)

**完成标准**:

- [ ] SForm 包含：名称（必填）、状态（下拉）、备注（文本）
- [ ] 编辑模式回填数据
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/form-page.md
- [ ] .ai/sdesign/components/SForm.md

### Task 5: 基础数据详情页

**类型**: page-detail

**描述**:
创建基础数据详情展示页。

**前置条件**: Task 1

**文件清单**:

- src/pages/product/detail.tsx (新建)

**完成标准**:

- [ ] SDetail 展示所有字段，分 2 列布局
- [ ] 状态字段使用 Tag 展示
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/detail-page.md
- [ ] .ai/sdesign/components/SDetail.md

## 验证计划

| 验证层级 | 验证方式         | 覆盖范围  |
| -------- | ---------------- | --------- |
| 代码级   | pnpm verify      | 所有 Task |
| 功能级   | 页面交互测试     | 所有 Task |
| 业务级   | 对照需求逐条检查 | 整个功能  |

## 风险与备注

- 产品文档中未指定模块名，暂使用 "product" 作为示例
- 状态枚举值待接口确认
