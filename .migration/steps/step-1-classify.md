# 步骤 1：目录扫描与场景分类

> 扫描用户指定的 Vue 模块目录，对每个文件进行场景识别，输出分类总览。

---

## 前置条件

- [ ] `output/project-profile.md` 已完成（步骤 0 产出）

## 必读文件

- `scenes/identify.md`（场景识别判定规则）
- `templates/overview.md`（模块总览模板）
- `output/project-profile.md`（了解 UI 库 → 确定组件标签名）

---

## 执行指令

### 1. 获取迁移目标

向用户询问要迁移的模块路径，例如：

- `src/views/order/`
- `src/pages/user/`

### 2. 扫描目录

```bash
# 列出目标目录下所有 Vue 文件
Glob: {target-path}/**/*.vue

# 同时发现关联资源
Glob: src/api/*{module-name}*    # 对应的 API 文件
Glob: src/stores/*{module-name}* # 对应的 Store 文件
```

### 3. 逐文件场景识别

对每个 `.vue` 文件，按 `scenes/identify.md` 中的判定规则进行分类：

```
对每个文件：
1. 快速读取 <template> 部分：
   - 有表格组件（参考 identify.md 中 UI 库标签映射）？
   - 有表单组件 + 提交按钮？
   - 有描述列表组件？
   - 有 Tabs / Steps 等容器组件？

2. 快速读取 <script setup> 部分：
   - 有分页变量（pageNum/pageSize）？
   - 有列表查询函数？
   - 有表单提交函数 + validate？
   - 有详情查询但无提交？

3. 辅助判断：
   - 文件命名（List/Form/Detail/Config...）
   - 路由配置中的路径

4. 应用判定规则：
   - 满足 >=2 条特征 → 判定为对应场景
   - 同时命中多个 → 标记为复合类型或复杂组合页
   - 无法判定 → 标记为 unknown
```

### 4. 输出分类总览

按 `templates/overview.md` 的格式，输出文件清单和分类结果。

### 5. 等待用户确认

将分类结果展示给用户，**等待用户确认或纠正**：

- 用户确认正确 → 更新 overview.md，进入步骤 2
- 用户纠正某些文件的分类 → 更新 overview.md，记录纠正历史

> **重要**：分类结果必须经过用户确认才能进入下一步。AI 不应自行判断后直接继续。

---

## 产出文件

```
output/{module}/overview.md
```

其中 `{module}` 为模块名称（如 `order`、`user`）。

## 完成标准

- [ ] 目标目录下所有 `.vue` 文件都已列出
- [ ] 每个文件都标注了场景类型
- [ ] 关联资源（API 文件、Store 文件、路由配置）已记录
- [ ] 用户已确认分类结果
- [ ] 纠正记录已保存（如有）
- [ ] 产出文件已保存到 `output/{module}/overview.md`

---

## 下一步

→ `steps/step-2-context.md`（提取模块共享上下文）
