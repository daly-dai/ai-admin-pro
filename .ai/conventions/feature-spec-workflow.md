# 功能规格书合并工作流

> **用途**：定义 spec-gen 模式的执行规范，AI 按此流程将 Swagger + PRD 合并为功能规格书
> **流程位置**：对应 AGENTS.md 模式 F: spec-gen
> **输出模板**：`.ai/templates/feature-spec.md`

---

## 一、工作流总览

```
输入准备 → Swagger 解析 → PRD 解析 → 交叉对比 → 合并输出 → 用户审查 → 确认衔接
   ①           ②            ③           ④           ⑤          ⑥          ⑦
```

| 阶段           | 执行者 | 输入                     | 输出                              |
| -------------- | ------ | ------------------------ | --------------------------------- |
| ① 输入准备     | 用户   | Swagger 文档 + PRD       | 确认双源可用                      |
| ② Swagger 解析 | AI     | Swagger 原文             | 内部 YAML（实体 + 接口）          |
| ③ PRD 解析     | AI     | PRD 原文                 | 结构化提取（功能 + 页面 + 规则）  |
| ④ 交叉对比     | AI     | ② + ③ 的输出             | 差异清单                          |
| ⑤ 合并输出     | AI     | ② + ③ + ④                | `specs/[feature]/feature-spec.md` |
| ⑥ 用户审查     | 用户   | feature-spec.md          | 差异决策（逐条填写）              |
| ⑦ 确认衔接     | AI     | 含决策的 feature-spec.md | spec.md + progress.md → full-sdd  |

---

## 二、Swagger 解析规范

### 2.1 输入格式识别

| 输入形式  | 识别方式                                              | 解析策略                               |
| --------- | ----------------------------------------------------- | -------------------------------------- |
| JSON 文本 | 包含 `"swagger": "2.0"` 或 `"openapi": "3.0"`         | 直接解析 JSON 结构                     |
| YAML 文本 | 包含 `swagger: "2.0"` 或 `openapi: "3.0"`             | 解析 YAML 结构                         |
| URL       | `http(s)://` 开头，含 `swagger` / `api-docs` 等关键词 | 请求获取后按 JSON/YAML 解析            |
| 截图/图片 | 用户提供图片文件                                      | 视觉识别提取结构，低置信度字段标 `[?]` |
| 手动表格  | 非标准格式的接口描述（如 Markdown 表格）              | 按字段逐行提取，缺失信息标 `[?]`       |

### 2.2 核心提取项

从 Swagger 中**必须**提取的信息：

| 提取项   | Swagger 2.0 位置       | OpenAPI 3.0 位置             | 用途                |
| -------- | ---------------------- | ---------------------------- | ------------------- |
| 基础路径 | `basePath`             | `servers[0].url`             | 模块标识推断        |
| 实体定义 | `definitions`          | `components.schemas`         | 数据模型            |
| 接口列表 | `paths`                | `paths`                      | 接口清单            |
| 请求参数 | `parameters`           | `parameters` / `requestBody` | 查询参数 + 表单字段 |
| 响应结构 | `responses.200.schema` | `responses.200.content`      | 实体字段验证        |
| 枚举值   | 字段的 `enum` 属性     | 字段的 `enum` 属性           | 枚举定义            |
| 必填标记 | `required` 数组        | `required` 数组              | 必填性              |

### 2.3 类型映射

复用 `api-conventions.md` 的字段类型映射表，补充 Swagger 特有类型：

| Swagger 类型   | format    | TypeScript 类型         | SForm 控件类型 |
| -------------- | --------- | ----------------------- | -------------- |
| string         | -         | string                  | input          |
| string         | date      | string                  | datePicker     |
| string         | date-time | string                  | datePicker     |
| string         | binary    | File                    | upload         |
| integer        | int32     | number                  | inputNumber    |
| integer        | int64     | string                  | input          |
| number         | float     | number                  | inputNumber    |
| number         | double    | number                  | inputNumber    |
| boolean        | -         | boolean                 | switch         |
| array          | -         | T[]                     | -              |
| object         | -         | Record<string, unknown> | -              |
| string + enum  | -         | 联合类型                | select         |
| integer + enum | -         | number 联合类型         | select         |

### 2.4 转换为内部 YAML

解析后转换为与 `api-conventions.md` 对齐的内部格式。

> **YAML 格式参考** → `api-conventions.md`「接口定义格式」章节（`module` / `types` / `interfaces` 结构）。
> **方法命名规则** → `api-conventions.md`「方法命名规则」表。

在标准 YAML 基础上，spec-gen 模式额外追加 `deviations` 节：

```yaml
# module / types / interfaces 结构同 api-conventions.md，此处不重复

deviations: # 与 api-conventions 标准的偏离（spec-gen 特有）
  - item: { 偏离项 }
    standard: { 标准定义 }
    actual: { 实际定义 }
    impact: { 影响说明 }
```

---

## 三、PRD 解析规范

### 3.1 输入格式识别

| 输入形式          | 识别方式                            | 解析策略                                     |
| ----------------- | ----------------------------------- | -------------------------------------------- |
| prd-template 格式 | 包含 prd-template.md 的标准章节标题 | 按章节结构化提取                             |
| 自由格式文档      | 纯文本 / Markdown / Word            | 按关键词匹配提取（实体、字段、页面、规则）   |
| 截图/原型图       | 图片文件                            | 视觉解析页面结构，提取表格列、表单字段、按钮 |
| 口头描述          | 短文本，无结构                      | 提取关键信息，缺失部分标 `[?]` 待确认        |

### 3.2 核心提取项

| 提取项   | prd-template 对应章节 | 自由格式识别关键词      |
| -------- | --------------------- | ----------------------- |
| 功能名称 | 一、功能概述          | 标题、模块名            |
| 模块标识 | 一、功能概述          | 英文标识、路由路径      |
| 业务域   | 一、功能概述          | 所属系统、菜单位置      |
| 实体字段 | 三、数据模型          | 字段、属性、列          |
| 枚举定义 | 三、数据模型 3.2      | 状态、类型、枚举        |
| 查询参数 | 三、数据模型 3.3      | 搜索、筛选、过滤        |
| 接口需求 | 四、接口设计          | 接口、API、调用         |
| 页面类型 | 五、页面与交互 5.1    | 列表、表单、详情        |
| 搜索字段 | 五、页面与交互 5.2    | 搜索区域、筛选条件      |
| 表格列   | 五、页面与交互 5.2    | 表格、列表展示          |
| 表单字段 | 五、页面与交互 5.3    | 表单、新增、编辑        |
| 字段联动 | 五、页面与交互 5.3    | 联动、依赖、显示隐藏    |
| 操作按钮 | 五、页面与交互 5.2    | 操作、按钮、删除        |
| 交互模式 | 五、页面与交互 5.3    | Modal、弹窗、抽屉、页面 |
| 业务规则 | 六、业务规则          | 规则、约束、校验、流转  |

### 3.3 信息完整性评估

AI 对 PRD 各维度打完整性标记，指导后续合并策略：

| PRD 信息维度 | 完整性 | 缺失影响               | 补偿策略                                 |
| ------------ | ------ | ---------------------- | ---------------------------------------- |
| 数据模型     | ✅/❌  | 高：无法对比字段       | 以 Swagger 为主，标 `[S]`                |
| 页面设计     | ✅/❌  | 中：可从 Swagger 推断  | 根据接口推断页面类型                     |
| 交互模式     | ✅/❌  | 低：按字段数量自动判断 | 使用 crud-page.md 决策规则               |
| 业务规则     | ✅/❌  | 低：不影响代码骨架     | 标注「待补充」                           |
| 枚举定义     | ✅/❌  | 中：影响显示文本       | 以 Swagger enum 值为准，显示文本标 `[?]` |

---

## 四、交叉对比规则

### 4.1 对比执行顺序

按以下 5 步顺序执行对比，每步的输出作为下一步的输入：

```
Step 1: 模块标识对齐
  ├── Swagger basePath → 提取模块名
  └── PRD 模块标识 → 对比是否一致
  └── 输出：统一的模块标识

Step 2: 实体字段对比
  ├── Swagger definitions → 字段列表
  └── PRD 数据模型 → 字段列表
  └── 输出：合并字段表（含来源和状态标记）

Step 3: 接口映射
  ├── Swagger paths → 接口列表
  └── PRD 功能需求 → 期望接口
  └── 输出：接口映射表 + 缺失/多余清单

Step 4: 页面字段映射
  ├── PRD 搜索/列表/表单字段 → 字段列表
  └── Swagger 参数/响应字段 → 字段列表
  └── 输出：页面字段可用性标记

Step 5: 业务规则验证
  ├── PRD 业务规则 → 规则列表
  └── Swagger 接口能力 → 能力列表
  └── 输出：规则可实现性标记
```

### 4.2 字段匹配策略

按优先级从高到低尝试匹配：

| 优先级 | 匹配策略        | 示例                                             | 置信度     |
| ------ | --------------- | ------------------------------------------------ | ---------- |
| 1      | 精确匹配        | `userName` ↔ `userName`                          | 100%       |
| 2      | 大小写忽略      | `userName` ↔ `username`                          | 95%        |
| 3      | 下划线/驼峰互转 | `user_name` ↔ `userName`                         | 90%        |
| 4      | 语义匹配        | `desc` ↔ `description`，`remark` ↔ `description` | 70%        |
| 5      | 无法匹配        | —                                                | 标记为差异 |

- 置信度 < 80% 的匹配在差异报告中标注 `[语义匹配]`，供用户确认
- 常见语义匹配对（内置）：
  - `desc` / `description` / `remark`
  - `name` / `title` / `label`
  - `status` / `state`
  - `createTime` / `createdAt` / `gmtCreate`
  - `updateTime` / `updatedAt` / `gmtModified`

### 4.3 类型匹配规则

| Swagger 类型              | PRD 类型描述          | 匹配结果                                        |
| ------------------------- | --------------------- | ----------------------------------------------- |
| integer / int32           | number / 数字         | ✅ 一致                                         |
| integer / int64           | string / 字符串       | ✅ 一致（int64 精度问题，前端用 string）        |
| string + format:date-time | string / 时间 / 日期  | ✅ 一致                                         |
| integer + enum            | string / 枚举         | ⚠️ 类型不一致（需在类型层适配 number → string） |
| string + enum             | string / 枚举         | ✅ 一致                                         |
| boolean                   | boolean / 开关 / 是否 | ✅ 一致                                         |
| array + $ref              | Entity[] / 列表       | ✅ 一致（递归解析引用）                         |
| object                    | Record / 对象         | ✅ 一致                                         |

### 4.4 接口能力匹配

将 PRD 的页面功能需求映射到 Swagger 接口：

| PRD 功能 | 期望接口          | Swagger 匹配规则                                                    |
| -------- | ----------------- | ------------------------------------------------------------------- |
| 列表展示 | getListByGet      | `GET /basePath` 或 `POST /basePath/search` 或 `POST /basePath/list` |
| 详情查看 | getByIdByGet      | `GET /basePath/{id}` 或 `GET /basePath/detail`                      |
| 新增     | createByPost      | `POST /basePath`                                                    |
| 编辑     | updateByPut       | `PUT /basePath/{id}` 或 `PATCH /basePath/{id}`                      |
| 删除     | deleteByDelete    | `DELETE /basePath/{id}`                                             |
| 批量删除 | batchDeleteByPost | `DELETE /basePath/batch` 或 `POST /basePath/batch-delete`           |
| 批量操作 | batch\*ByPost     | 路径含 `batch` / `bulk` 关键词                                      |
| 状态变更 | updateStatusByPut | `PUT/PATCH` + 路径含 `status` / `enable` / `disable`                |
| 导出     | export            | `GET/POST` + 路径含 `export` / `download`                           |
| 树形数据 | getTree           | `GET` + 路径含 `tree`                                               |

---

## 五、差异处理策略

### 5.1 差异维度体系

4 类 14 维度的完整对比体系：

```
A. 数据模型维度
├── A1. 字段缺失-Swagger侧    Swagger 有、PRD 没提
├── A2. 字段缺失-PRD侧        PRD 要求、Swagger 没定义
├── A3. 类型不一致             同一字段双方类型定义不同
├── A4. 必填性不一致           PRD 标必填但 Swagger 可选，或反之
└── A5. 枚举值不一致           状态/类型枚举的值列表不同

B. 接口定义维度
├── B1. 接口缺失              PRD 需要的功能找不到对应 Swagger 接口
├── B2. 接口多余              Swagger 有但 PRD 未涉及的接口
├── B3. 方法/路径偏离          与 api-conventions 标准模板不一致
└── B4. 分页/排序参数偏离      分页参数命名、响应结构与标准不同

C. 页面映射维度
├── C1. 搜索字段缺口           PRD 搜索字段在 getList query 中无对应参数
├── C2. 展示字段缺口           PRD 列表列/详情字段在响应中无对应
└── C3. 表单字段缺口           PRD 表单字段在请求 body 中无对应

D. 业务规则维度
├── D1. 状态流转冲突           PRD 定义的状态机与 Swagger 接口能力不匹配
└── D2. 权限缺口               PRD 要求的权限控制无对应接口支持
```

### 5.2 严重级定义

| 严重级      | 含义               | 处理策略                         |
| ----------- | ------------------ | -------------------------------- |
| 🔴 冲突     | 阻塞开发，必须解决 | 必须用户决策后才能进入 Task 拆解 |
| ⚠️ 需确认   | 不阻塞但影响完整性 | AI 给出建议，用户确认或覆盖      |
| 🟢 自动处理 | AI 可自行决策      | AI 标注决策理由，用户可覆盖      |

### 5.3 自动决策规则（🟢 级，AI 直接处理）

| 差异场景                                                             | 自动决策                                 | 理由                                     |
| -------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| Swagger 有系统字段 PRD 未提及（createTime, updateTime, createBy 等） | 包含在实体中，列表页默认展示 createTime  | 标准系统字段                             |
| Swagger 类型精度高于 PRD 描述                                        | 以 Swagger 为准                          | 后端实现是真实约束                       |
| 分页参数命名与标准不同（如 current/size vs page/pageSize）           | 在 deviation 中记录，代码按 Swagger 适配 | SSearchTable 支持自定义 paginationFields |
| 响应结构与标准不同（如 data.records vs data.list）                   | 在 deviation 中记录，代码适配            | SSearchTable 支持自定义                  |
| int64 类型字段                                                       | TypeScript 类型用 string                 | JS 精度限制                              |
| Swagger 有额外接口 PRD 明确不涉及                                    | 标注「备用」，不纳入 Task                | 范围限定                                 |

### 5.4 需确认规则（⚠️ 级，AI 给建议 + 用户决策）

| 差异场景                                  | AI 默认建议                          | 用户需决策       |
| ----------------------------------------- | ------------------------------------ | ---------------- |
| PRD 字段 Swagger 未定义                   | 标注「需后端补充」或「本期不实现」   | 是否本期实现     |
| Swagger 有非标准接口 PRD 未提             | 标注「备用」                         | 是否本期实现     |
| 枚举值不一致（仅显示文本）                | 以 Swagger 值为准，显示文本从 PRD 取 | 确认映射关系     |
| PRD 搜索字段无对应 query 参数             | 建议与后端确认                       | 是否要求后端添加 |
| 类型不一致（integer enum vs string enum） | 以 Swagger 为准，类型层做适配        | 确认适配方案     |
| 必填性不一致                              | 以 Swagger 为准（接口实际约束）      | 前端是否额外校验 |
| PRD 表格列在 response 中无对应            | 建议与后端确认                       | 是否添加字段     |

### 5.5 阻塞规则（🔴 级，必须用户决策）

| 差异场景                                        | 阻塞原因         | 典型处理方式              |
| ----------------------------------------------- | ---------------- | ------------------------- |
| PRD 核心功能无对应 Swagger 接口                 | 功能无法实现     | 等后端补充 / 修改需求范围 |
| 实体主键/关键字段定义冲突                       | 影响全局数据结构 | 与后端对齐                |
| PRD 交互需要特殊接口（如 getTree）但 Swagger 无 | 页面无法渲染     | 等后端补充 / 改用平铺方案 |
| PRD 状态流转与 Swagger 接口能力矛盾             | 业务逻辑不通     | 修改 PRD 或等后端补充接口 |

---

## 六、输出格式要求

### 6.1 输出文件

| 项目     | 说明                              |
| -------- | --------------------------------- |
| 输出路径 | `specs/[feature]/feature-spec.md` |
| 模板来源 | `.ai/templates/feature-spec.md`   |
| 编码     | UTF-8                             |
| 格式     | Markdown                          |

### 6.2 必须标注项

- 所有信息项必须标注来源 `[S]` / `[P]` / `[M]`
- 所有合并字段必须标注状态 ✅ / ⚠️ / 🔴
- 差异明细表的「用户决策」列必须留空
- 🟢 级自动决策必须标注决策理由

### 6.3 向用户展示内容

生成 feature-spec.md 后，AI 应向用户展示以下摘要：

```
## 功能规格书生成完成

**模块**: {module} ({中文名})
**Swagger 接口数**: X 个（标准 Y + 非标准 Z）
**PRD 页面数**: X 个

### 差异汇总
- ✅ 一致: X 项
- ⚠️ 需确认: X 项（AI 已给出建议）
- 🔴 冲突: X 项（需您决策）

### 🔴 阻塞项清单
1. D-XX: {差异描述}
2. D-XX: {差异描述}

请审查 specs/[feature]/feature-spec.md 并对差异项做出决策。
所有 🔴 项决策完成后，我将自动生成 Task 拆解进入开发。
```

---

## 七、确认后衔接流程

用户审查并填写所有差异决策后，AI 按以下步骤衔接到 full-sdd 模式：

### 7.1 处理用户决策

```
1. 读取用户决策
   ├── 「不实现」→ 从 Task 骨架中移除相关 Task
   ├── 「需后端补充」→ 在 Task 前置条件中标注「依赖后端接口就绪」
   ├── 「以 Swagger 为准」→ 更新数据模型为 Swagger 定义
   ├── 「以 PRD 为准」→ 保留 PRD 定义，在 deviation 中标注
   └── 「[AI 默认]」→ 按 AI 建议执行

2. 更新 feature-spec.md
   ├── 填充「用户决策」列
   ├── 移除被取消的功能
   └── 标注最终数据模型
```

### 7.2 生成 spec.md

基于决策后的 feature-spec.md，展开 Task 骨架为完整的 `specs/[feature]/spec.md`：

- 使用 `specs/template.md` 的 Task 格式
- 每个 Task 包含：类型、描述、前置条件、文件清单、完成标准、AI 必读文档
- 接口偏离点写入 API Task 的描述中
- 差异影响写入对应 Task 的备注中

### 7.3 生成 progress.md

使用 `specs/progress-template.md` 格式创建进度追踪文件。

### 7.4 切换模式

自动切换到 full-sdd 模式，从 Task 1（通常是 API 模块）开始执行。

---

## 附录：权威性原则

在整个合并流程中，始终遵循以下权威性原则：

| 决策领域           | 权威来源 | 原因                           |
| ------------------ | -------- | ------------------------------ |
| 字段类型           | Swagger  | 后端已实现，接口约束是真实的   |
| 接口路径和方法     | Swagger  | 后端已实现，不可前端单方面修改 |
| 必填性             | Swagger  | 接口层的 required 是运行时约束 |
| 功能范围（做不做） | PRD      | 产品决策，不由接口有无决定     |
| 页面交互模式       | PRD      | 用户体验决策                   |
| 业务规则           | PRD      | 业务逻辑由产品定义             |
| 字段显示文本       | PRD      | 面向用户的文本由产品定义       |
| 枚举值             | Swagger  | 值由后端定义                   |
| 枚举显示文本       | PRD      | 显示文本由产品定义             |
