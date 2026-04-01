# 步骤 3：逐文件场景分析（调度中枢）

> 本步骤是整个分析流程的核心循环。根据 overview.md 中的待分析文件列表，
> 逐个文件按其场景类型路由到对应的场景分析手册执行。
>
> **支持跨会话**：每完成一个文件分析即更新 overview.md 进度，
> 新会话可从断点继续。

---

## 前置条件

- [ ] `output/{module}/overview.md` 已完成且用户已确认分类
- [ ] `output/{module}/context.md` 已完成

## 必读文件（每次分析时）

```
1. output/project-profile.md    （项目技术背景）
2. output/{module}/overview.md  （查看待分析文件）
3. output/{module}/context.md   （模块共享上下文）
4. 根据场景类型 → scenes/{对应手册}.md
```

---

## 执行指令

### 1. 查看进度

读取 `output/{module}/overview.md`，找到下一个待分析文件（状态为 ⬜ 或 ⏳）。

如果所有文件状态均为 ✅ → 跳转到步骤 4。

### 2. 场景路由

根据待分析文件的场景类型，读取对应的场景分析手册：

| 场景类型                 | 读取文件                                                        |
| ------------------------ | --------------------------------------------------------------- |
| 查询列表页               | `scenes/list-page.md`                                           |
| 表单页                   | `scenes/form-page.md`                                           |
| 详情页                   | `scenes/detail-page.md`                                         |
| 复杂组合页               | `scenes/complex-page.md`                                        |
| 查询列表页（含内嵌表单） | `scenes/list-page.md`（内嵌表单部分参考 `scenes/form-page.md`） |
| 表单页（含子表格）       | `scenes/form-page.md`（子表格部分参考 `scenes/list-page.md`）   |
| 业务组件                 | 根据组件用途参考对应场景手册中的局部维度                        |
| unknown                  | 先向用户确认场景类型，再路由                                    |

### 3. 更新状态为分析中

将当前文件在 overview.md 中的状态更新为 ⏳。

### 4. 执行分析

按场景分析手册中的指令执行：

```
1. 检查前置条件（手册顶部）
2. 读取 Vue 源码文件
3. 按采集维度逐项提取信息
4. 按提取指令追踪变量和逻辑
5. 按产出模板生成描述文档
6. 执行完整性检查清单
```

### 5. 保存产出

将分析结果保存为独立文件：

```
output/{module}/{page-name}.md
```

文件命名规则：

- `OrderList.vue` → `order-list.md`
- `OrderForm.vue` → `order-form.md`
- `components/StatusTag.vue` → `status-tag.md`

### 6. 更新进度

将当前文件在 overview.md 中的状态更新为 ✅，并填入产出文件路径。

### 7. 循环或中断

- 如果还有待分析文件 → 回到步骤 1
- 如果上下文接近容量上限 → 建议用户新开会话，告知恢复方式
- 如果所有文件分析完成 → 进入步骤 4

---

## 会话中断与恢复

### 建议中断时机

- 已连续分析 2-3 个复杂页面
- 上下文中已有大量代码片段积累
- 用户主动要求中断

### 中断时的操作

1. 确保当前文件的分析产出已保存
2. 更新 overview.md 进度
3. 告知用户恢复指令：

```
新会话恢复指令：
"请读取 .migration/GUIDE.md，然后按跨会话恢复协议继续迁移分析。
目标模块：{module}。"
```

### 恢复时的操作

1. 读取 GUIDE.md → project-profile.md → overview.md → context.md
2. 从 overview.md 中找到下一个 ⬜ 或 ⏳ 状态的文件
3. 继续执行本步骤的流程

---

## 产出文件

```
output/{module}/{page-name}.md  （每个文件一个）
output/{module}/overview.md     （进度更新）
```

## 完成标准（单个文件）

- [ ] 场景分析手册中的完整性检查清单全部通过
- [ ] 产出文件已保存
- [ ] overview.md 进度已更新为 ✅

## 完成标准（整体）

- [ ] overview.md 中所有文件状态均为 ✅
- [ ] 每个文件都有对应的产出描述文档

---

## 下一步

→ `steps/step-4-tasks.md`（汇总生成 Task 拆解方案）
