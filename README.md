# AI Admin Pro

> **让 AI 理解你的架构，按架构产出预期代码。** 不是代码生成器，是一套 AI 工程化体系——定义规则、约束行为、自动纠错、知识沉淀。

---

## 架构全景

```
                        ┌──────────────────┐
                        │    用户请求        │
                        └────────┬─────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │  AGENTS.md   │    │AGENTS-LITE.md│    │  直接修改     │
   │  强模型入口   │    │  弱模型入口   │    │  迭代修复     │
   └──────┬───────┘    └──────┬───────┘    └──────────────┘
          │                   │
          ▼                   ▼
   ┌──────────────┐    ┌──────────────┐
   │  modes/       │    │ sdesign-gen- │
   │  5 阶段文件   │    │ page Skill   │
   └──────┬───────┘    └──────┬───────┘
          │                   │
          └─────────┬─────────┘
                    │
                    ▼
   ┌─────────────────────────────────────┐
   │          .ai/ 知识供给层              │
   │                                     │
   │  sdesign/components/  ← 组件 API    │
   │  pitfalls/            ← 错题集      │
   │  templates/           ← 页面模板    │
   │  conventions/         ← 开发约定    │
   │  core/                ← 核心规范    │
   │  specs/               ← 需求规格    │
   └────────────────┬────────────────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
      ▼             ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ 蒸馏管道  │ │ 纠错飞轮  │ │ 三级验证  │
│ 知识同步  │ │ 错误沉淀  │ │ 质量保障  │
└──────────┘ └──────────┘ └──────────┘
```

---

## 核心子系统

### 双入口架构

| 入口               | 适用场景                    | 设计理念                           |
| :----------------- | :-------------------------- | :--------------------------------- |
| **AGENTS.md**      | 强模型（Claude 4/GPT-4 等） | 阶段判断 → mode 文件 → 逐步执行    |
| **AGENTS-LITE.md** | 弱模型（公司内部部署模型）  | 路由到 Skill → 填空模板 → 硬停规则 |

### 五阶段生命周期

```
① 画 Demo  →  ② 接口合并  →  ③ 改造适配  →  ④ 接口对接  →  ⑤ 迭代修复
     ↑              ↑              ↑              ↑              │
     └──────────────┴──────────────┴──────────────┴──────────────┘
                          需求变更 → 回到受影响最早阶段
```

### Skill 执行引擎

弱模型入口通过 `sdesign-gen-page` Skill 生成代码，核心设计：

- **路由表**：关键词匹配 → 页面类型 → 无决策直达
- **固定步骤表**：每步明确读什么、产出什么（CRUD 10步、详情 8步、表单 10步）
- **@FILL 填空模板**：降级为「识别占位符 → 文本替换」，消除推理负担
- **输出锁**：仅允许写入指定路径范围
- **自包含 bundle**：模板内联组件 Props、错题集、约束规则

### 管道蒸馏

```
源文件（AGENTS.md / .ai/ 文件）  ──git变更检测──▶  目标文件（AGENTS-LITE.md）
                                distill:check
                                19组追踪矩阵（G01-G19）
```

### 纠错飞轮

```
pnpm verify 失败  →  错误追加 raw.jsonl  →  pitfall:scan 聚合（≥3次）
→  pending/ 草稿  →  人工审批  →  pitfalls/ 规则生效  →  下次生成自动规避
```

---

## 技术栈

| 类别     | 技术                         | 说明                                                       |
| :------- | :--------------------------- | :--------------------------------------------------------- |
| 构建工具 | Rsbuild                      | 基于 Rspack 的高性能构建                                   |
| 框架     | React 18 + TypeScript 5      | 严格类型约束                                               |
| 组件库   | **@dalydb/sdesign** + antd 5 | sdesign 封装常用模式（SSearchTable/SForm/SButton/SDetail） |
| 状态管理 | Zustand + immer              | 轻量零样板代码                                             |
| 路由     | React Router 6               | SPA 路由                                                   |
| HTTP     | 自定义 createRequest         | 统一拦截/鉴权/错误处理                                     |
| Hooks    | ahooks                       | useRequest 等                                              |

---

## 工程原则

| 原则           | 含义                                    |
| :------------- | :-------------------------------------- |
| **弱模型优先** | 在约束最大的环境验证设计，自然向上兼容  |
| **漏斗法则**   | 黄金范例 > 错题速查 > 规则集 > 全量文档 |
| **范例驱动**   | 让模型「抄」而非「理解」                |

---

## 演进方向：宏内核 → 微内核

> 当前处于从「宏内核」向「微内核」的**判断与规划阶段**，尚未开始拆解。

```
当前（宏内核）                          目标（微内核）
─────────────                          ─────────────

sdesign-gen-page Skill                 Skill 集群（按协议组装）
├── 硬约束（内嵌 §3）       ──拆解──▶  coding-standards Skill
├── API 约定（内嵌 §4）     ──拆解──▶  api-conventions Skill
├── 错题集（内嵌 §5）       ──拆解──▶  pitfalls Skill
├── 验证清单（内嵌 §6）     ──拆解──▶  verification Skill
└── 页面生成（内嵌 §1+§2）  ──保留──▶  sdesign-gen-page Skill
                                          @require: 上述 Skill

知识增长：个人沉积                    知识增长：知识复利 Skill
                                      （代码提交 → 识别模式 → 自动生成 Skill）
```

详见 [`architecture-evolution.md`](./architecture-evolution.md) 阶段 G 和 [`docs/ai-architecture-overview.md`](./docs/ai-architecture-overview.md) 第十四节。

---

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 代码验证（tsc + eslint + prettier）
pnpm verify

# 自动修复
pnpm verify:fix

# 蒸馏漂移检测
pnpm distill:check

# 错题聚合扫描
pnpm pitfall:scan
```

---

## 目录结构

```
ai-admin-pro/
├── AGENTS.md                    # 强模型入口（244 行）
├── AGENTS-LITE.md               # 弱模型入口（~120 行）
├── .ai/                         # AI 配置中心（人工维护，唯一可信源）
│   ├── core/                    # 核心规范
│   ├── conventions/             # 开发约定
│   ├── modes/                   # 五阶段文件
│   ├── templates/               # 页面模板
│   ├── pitfalls/                # 错题集（P001-P006+）
│   ├── sdesign/                 # 组件库文档（自动同步）
│   ├── specs/                   # 功能规格书
│   ├── tools/                   # 工具脚本
│   ├── project-brief.md         # 项目认知底座
│   └── distill-tracker.md       # 蒸馏追踪矩阵
├── .qoder/skills/sdesign-gen-page/  # Skill 编译产物（脚本自动生成）
│   ├── SKILL.md                     # 路由表 + 固定步骤表
│   └── references/                  # 自包含 bundle 模板
├── docs/                        # 架构文档
│   ├── ai-architecture-overview.md  # 认知全景（14 节）
│   └── ai-engineering-principles/   # 三原则详解
├── architecture-evolution.md    # 架构演进史（阶段 A→G）
├── src/                         # 源码
│   ├── api/                     # API 层
│   ├── pages/                   # 页面
│   ├── components/              # 组件
│   ├── stores/                  # Zustand 状态
│   ├── router/                  # 路由
│   ├── types/                   # 全局类型
│   └── plugins/                 # 请求封装等
└── package.json
```

---

## 文档索引

| 想了解什么        | 读哪个                                                                               |
| :---------------- | :----------------------------------------------------------------------------------- |
| AI 入口和工作方式 | [`AGENTS.md`](./AGENTS.md)（强模型）/ [`AGENTS-LITE.md`](./AGENTS-LITE.md)（弱模型） |
| 完整演进历史      | [`architecture-evolution.md`](./architecture-evolution.md)                           |
| 全子系统认知地图  | [`docs/ai-architecture-overview.md`](./docs/ai-architecture-overview.md)             |
| 设计哲学          | [`docs/ai-engineering-principles/`](./docs/ai-engineering-principles/)               |
| 如何生成代码      | `.qoder/skills/sdesign-gen-page/SKILL.md`                                            |
| 组件使用文档      | `.ai/sdesign/components/`                                                            |
| 错题集            | `.ai/pitfalls/index.md`                                                              |

---

## 关键数据

| 指标           | 数值                                                         |
| :------------- | :----------------------------------------------------------- |
| 总提交数       | 74 次                                                        |
| 核心提示词修改 | 36 次                                                        |
| 净删除 AI 文档 | ~50,000 行                                                   |
| 废弃完整方案   | 4 套（repowiki / 迁移分析 / V1-V3 生命周期 / JSON scaffold） |
| 当前 AGENTS.md | 244 行（从峰值 305 行收敛）                                  |
| 错题沉淀       | P001-P006                                                    |
| 蒸馏追踪组     | 19 组（G01-G19）                                             |

---

## 许可证

MIT
