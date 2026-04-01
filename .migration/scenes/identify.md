# 场景识别判定规则

> 本文件定义四种页面场景的识别方法，供步骤 1（场景分类）使用。

---

## 一、判定规则

### 查询列表页（满足 >=2 条即判定）

- [ ] `<template>` 中使用了表格组件（`el-table` / `a-table` / `van-list` 等）
- [ ] `<script setup>` 中有分页相关变量（`pageNum` / `pageSize` / `current` / `total` / `pagination`）
- [ ] `<script setup>` 中有列表查询函数（`getList` / `fetchList` / `loadData` / `queryList` 等命名）
- [ ] `<template>` 中有搜索表单区域（表单内含「查询」「搜索」「重置」按钮）
- [ ] 文件命名含 `List` / `Index`（当该目录下还有 Form/Detail 文件时）

### 表单页（满足 >=2 条即判定）

- [ ] `<template>` 中有表单组件 + 提交按钮（「保存」「确定」「提交」）
- [ ] `<script setup>` 中有表单提交函数（`handleSubmit` / `onSubmit` / `save` / `handleSave`）
- [ ] `<script setup>` 中有表单校验调用（`formRef.validate` / `formRef.value.validate`）
- [ ] 路由路径含 `/add` / `/edit` / `/create` 或通过 props / 路由参数接收 `mode` / `id`
- [ ] 文件命名含 `Form` / `Add` / `Edit` / `Create`

### 详情页（满足 >=2 条即判定）

- [ ] `<template>` 中有描述列表组件（`el-descriptions` / `a-descriptions`）或纯展示性布局
- [ ] `<script setup>` 中有详情查询（`getDetail` / `fetchDetail` / `getInfo`）但**无表单提交**
- [ ] 路由路径含 `/detail` / `/view` / `/info`
- [ ] 页面无可编辑控件（Input / Select 等），纯展示
- [ ] 文件命名含 `Detail` / `View` / `Info`

### 复杂组合页

- [ ] 同时命中以上多个场景的特征（如既有表格又有表单提交）
- [ ] `<template>` 中有容器组件（`el-tabs` / `a-tabs` / `el-steps` / `a-steps`）包裹不同功能区
- [ ] 页面结构为左右分栏或上下分区，各区域功能独立
- [ ] 文件命名含 `Config` / `Setting` / `Dashboard` / `Manage`

---

## 二、混合场景处理

一个文件可能同时具有多种场景特征，按以下规则处理：

| 情况                            | 处理方式                                                                    |
| ------------------------------- | --------------------------------------------------------------------------- |
| 列表页 + 内嵌 Modal/Drawer 表单 | 标记为 `查询列表页（含内嵌表单）`，按列表页为主场景分析，表单部分作为子章节 |
| 表单页 + 内嵌子表格             | 标记为 `表单页（含子表格）`，按表单页为主场景分析                           |
| 多 Tab 各自独立                 | 标记为 `复杂组合页`，每个 Tab 递归识别子场景                                |
| 无法判定                        | 标记为 `unknown`，在 overview.md 备注中说明原因，等待用户确认               |

---

## 三、Vue 3 → 中性概念映射表

> 产出文档中应使用**中性业务概念**（右列），不使用 Vue 特有术语。

| Vue 3 概念                  | 中性概念（产出中使用） | 说明                                 |
| --------------------------- | ---------------------- | ------------------------------------ |
| `ref()` / `reactive()`      | 状态变量               | 可变数据                             |
| `computed()`                | 派生值 / 计算值        | 基于其他状态计算得出                 |
| `watch()` / `watchEffect()` | 监听逻辑 / 副作用      | 状态变化时触发                       |
| `v-model`                   | 双向绑定字段           | 组件与数据双向同步                   |
| `v-if` / `v-show`           | 条件显隐               | 控制元素是否渲染/显示                |
| `v-for`                     | 列表循环               | 基于数组渲染多个元素                 |
| `v-permission` / `v-auth`   | 权限控制               | 需查 project-profile.md 确认具体指令 |
| `<script setup>`            | 组件逻辑               | 组件的状态和行为定义                 |
| `defineProps`               | 组件入参（Props）      | 父组件传入的参数                     |
| `defineEmits`               | 组件事件（Events）     | 向父组件发出的事件                   |
| `onMounted`                 | 初始化逻辑             | 组件挂载时执行                       |
| `nextTick`                  | DOM 更新后回调         | 等待渲染完成再执行                   |
| `provide` / `inject`        | 跨层级数据传递         | 祖先组件向后代传数据                 |

---

## 四、UI 库组件标签映射

> 根据 `project-profile.md` 中填写的 UI 库，确定组件标签名。

### Element Plus

| 组件类型 | 标签名                                     |
| -------- | ------------------------------------------ |
| 表格     | `el-table` + `el-table-column`             |
| 表单     | `el-form` + `el-form-item`                 |
| 下拉框   | `el-select` + `el-option`                  |
| 输入框   | `el-input`                                 |
| 日期选择 | `el-date-picker`                           |
| 描述列表 | `el-descriptions` + `el-descriptions-item` |
| 标签页   | `el-tabs` + `el-tab-pane`                  |
| 弹窗     | `el-dialog`                                |
| 抽屉     | `el-drawer`                                |
| 按钮     | `el-button`                                |
| 级联选择 | `el-cascader`                              |
| 树选择   | `el-tree-select`                           |

### Ant Design Vue

| 组件类型 | 标签名                                   |
| -------- | ---------------------------------------- |
| 表格     | `a-table`                                |
| 表单     | `a-form` + `a-form-item`                 |
| 下拉框   | `a-select` + `a-select-option`           |
| 输入框   | `a-input`                                |
| 日期选择 | `a-date-picker` / `a-range-picker`       |
| 描述列表 | `a-descriptions` + `a-descriptions-item` |
| 标签页   | `a-tabs` + `a-tab-pane`                  |
| 弹窗     | `a-modal`                                |
| 抽屉     | `a-drawer`                               |
| 按钮     | `a-button`                               |
| 级联选择 | `a-cascader`                             |
| 树选择   | `a-tree-select`                          |
