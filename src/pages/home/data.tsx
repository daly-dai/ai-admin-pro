import {
  CodeOutlined,
  ExperimentOutlined,
  RocketOutlined,
  SafetyOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import React from 'react';

// ---- architecture diagrams (DSL) ----

export const pipelineDiagram = `
flowchart LR
  S0["<b>⓪ PRD→Spec</b><br/>前端范围提取"]:::stage0
  S1["<b>① 画 Demo</b><br/>页面代码生成"]:::stage1
  S2["<b>② 接口合并</b><br/>API 层对接"]:::stage2
  S3["<b>③ 改造适配</b><br/>sdesign 替换"]:::stage3
  S4["<b>④ 接口对接</b><br/>联调替换 mock"]:::stage4
  S5["<b>⑤ 迭代修复</b><br/>增量修改"]:::stage5
  S0 --> S1 --> S2 --> S3 --> S4 --> S5
  classDef stage0 fill:#ecfeff,stroke:#06b6d4,color:#0891b2,stroke-width:2px
  classDef stage1 fill:#eef2ff,stroke:#6366f1,color:#4f46e5,stroke-width:2px
  classDef stage2 fill:#ecfdf5,stroke:#10b981,color:#059669,stroke-width:2px
  classDef stage3 fill:#faf5ff,stroke:#8b5cf6,color:#7c3aed,stroke-width:2px
  classDef stage4 fill:#fffbeb,stroke:#f59e0b,color:#d97706,stroke-width:2px
  classDef stage5 fill:#f8fafc,stroke:#64748b,color:#475569,stroke-width:2px
`;

export const defenseLayersDiagram = `
flowchart TD
  subgraph auto["⚡ 自动化层 —— 0 token"]
    L0["<b>L0</b><br/>verify 错误速查<br/>报错时优先查表"]:::l0
    L1["<b>L1</b><br/>ESLint 机械拦截<br/>100% 可靠"]:::l1
  end
  subgraph assisted["🔍 辅助层 —— 按需加载"]
    L2["<b>L2</b><br/>硬约束 + 自检清单<br/>常驻上下文 · 9 项检查"]:::l2
    L3["<b>L3</b><br/>场景触发<br/>文件模式自动加载"]:::l3
  end
  subgraph fallback["🛡️ 兜底层 —— 深度检索"]
    L4["<b>L4</b><br/>错题索引<br/>P001-P015 按需检索"]:::l4
  end
  L0 --> L1 --> L2 --> L3 --> L4
  classDef l0 fill:#ecfdf5,stroke:#10b981,color:#059669,stroke-width:2px
  classDef l1 fill:#fffbeb,stroke:#f59e0b,color:#d97706,stroke-width:2px
  classDef l2 fill:#ecfeff,stroke:#06b6d4,color:#0891b2,stroke-width:2px
  classDef l3 fill:#eef2ff,stroke:#6366f1,color:#4f46e5,stroke-width:2px
  classDef l4 fill:#fef2f2,stroke:#f43f5e,color:#e11d48,stroke-width:2px
`;

export const correctionWorkflowDiagram = `
flowchart TD
  START["<b>用户纠正</b>"]:::start --> Q1{"pnpm verify<br/>报错 ?"}:::decision
  Q1 -->|是| Q2{"L0 速查表<br/>匹配 ?"}:::decision
  Q2 -->|匹配| D1["查表直接修复"]:::done
  Q2 -->|未匹配| Q3{"能否 ESLint<br/>检测 ?"}:::decision
  Q1 -->|否| Q3
  Q3 -->|能| Q4{"高频<br/>错误 ?"}:::decision
  Q4 -->|是| D2["L1 + L2<br/>规则 + 清单"]:::dual
  Q4 -->|否| Q5{"模式<br/>绑定 ?"}:::decision
  Q5 -->|是| D3["L1 + L3<br/>规则 + 场景文件"]:::dual
  Q5 -->|否| D4["仅 L1<br/>ESLint 规则"]:::l1only
  Q3 -->|不能| Q6{"高频<br/>错误 ?"}:::decision
  Q6 -->|是| D5["L2<br/>自检清单"]:::l2only
  Q6 -->|否| Q7{"模式<br/>绑定 ?"}:::decision
  Q7 -->|是| D6["L3<br/>场景文件"]:::l3only
  Q7 -->|否| D7["L4<br/>错题集"]:::l4only
  classDef start fill:#eef2ff,stroke:#6366f1,color:#4f46e5,stroke-width:2px
  classDef decision fill:#fffbeb,stroke:#f59e0b,color:#92400e,stroke-width:1px
  classDef done fill:#ecfdf5,stroke:#10b981,color:#059669,stroke-width:2px
  classDef dual fill:#ecfeff,stroke:#06b6d4,color:#0891b2,stroke-width:2px
  classDef l1only fill:#fefce8,stroke:#eab308,color:#a16207,stroke-width:1px
  classDef l2only fill:#f8fafc,stroke:#64748b,color:#475569,stroke-width:1px
  classDef l3only fill:#faf5ff,stroke:#8b5cf6,color:#7c3aed,stroke-width:1px
  classDef l4only fill:#fef2f2,stroke:#f43f5e,color:#e11d48,stroke-width:1px
`;

export const flywheelDiagram = `
flowchart LR
  V["<b>pnpm verify</b><br/>捕捉错误 + 记录日志"]:::vf --> L["<b>.ai/error-log/raw.jsonl</b><br/>错误自动追加 · 零成本副作用"]:::log
  L --> S["<b>pnpm pitfall:scan</b><br/>高频聚合 · 阈值 ≥3 次"]:::scan
  S --> D["<b>pending/ 草稿</b><br/>自动生成候选规则"]:::draft
  D --> R["<b>人工审查</b><br/>确认 → 晋升到索引"]:::review
  R --> P["<b>.ai/pitfalls/index.md</b><br/>错题入库 · 下次生效"]:::pit
  P -.->|"循环强化"| V
  classDef vf fill:#eef2ff,stroke:#6366f1,color:#4f46e5,stroke-width:2px
  classDef log fill:#f8fafc,stroke:#64748b,color:#475569,stroke-width:2px
  classDef scan fill:#fffbeb,stroke:#f59e0b,color:#d97706,stroke-width:2px
  classDef draft fill:#faf5ff,stroke:#8b5cf6,color:#7c3aed,stroke-width:2px
  classDef review fill:#ecfeff,stroke:#06b6d4,color:#0891b2,stroke-width:2px
  classDef pit fill:#ecfdf5,stroke:#10b981,color:#059669,stroke-width:2px
`;

export const dualModelDiagram = `
flowchart TD
  REQ["<b>开发需求</b>"]:::req --> MODEL{"<b>AI 模型能力 ?</b>"}:::decision
  MODEL -->|"Claude 等强模型"| AGENTS["<b>AGENTS.md</b><br/>全量上下文<br/>完整防线 L0-L4 + 6 阶段"]:::strong
  MODEL -->|"弱模型"| LITE["<b>AGENTS-LITE.md</b><br/>蒸馏精简<br/>仅 P0 规则 + Skill 驱动"]:::weak
  AGENTS --> VFY["<b>pnpm verify</b><br/>tsc + eslint + prettier"]:::vfy
  LITE --> DISTILL["<b>pnpm distill:check</b><br/>漂移检测 · 追踪表对比<br/>防 AGENTS 更新后 LITE 过期"]:::distill
  DISTILL --> VFY
  classDef req fill:#eef2ff,stroke:#6366f1,color:#4f46e5,stroke-width:2px
  classDef decision fill:#fffbeb,stroke:#f59e0b,color:#92400e,stroke-width:1px
  classDef strong fill:#ecfeff,stroke:#06b6d4,color:#0891b2,stroke-width:2px
  classDef weak fill:#faf5ff,stroke:#8b5cf6,color:#7c3aed,stroke-width:2px
  classDef vfy fill:#ecfdf5,stroke:#10b981,color:#059669,stroke-width:2px
  classDef distill fill:#fefce8,stroke:#eab308,color:#a16207,stroke-width:1px
`;

export const liteWorkflowDiagram = `
flowchart TD
  REQ["<b>收到需求</b>"]:::start --> MODE{"<b>工作模式选择</b>"}:::decision

  MODE -->|"新建/加功能"| SKILL["<b>sdesign-gen-page</b><br/>Skill 填空模板<br/>内嵌组件 API 约束"]:::skill
  MODE -->|"小修改"| MODIFY["<b>修改路径 §1</b><br/>读文件 → 匹配 T1-T8<br/>按模板插入内容"]:::modify
  MODE -->|"非标场景"| TEMPLATE["<b>模板参考</b><br/>查 .ai/templates/<br/>仿造 or 问用户"]:::tpl

  SKILL --> GUARD{"<b>R1-R5 防循环?</b>"}:::decision
  MODIFY --> GUARD
  TEMPLATE --> GUARD

  GUARD -->|"违反"| STOP1["<b>硬停</b><br/>报告违反的规则"]:::stop
  GUARD -->|"通过"| LOCK{"<b>输出锁检查</b>"}:::decision

  LOCK -->|"范围外"| SKIP["<b>跳过</b><br/>不修不提"]:::skip
  LOCK -->|"范围内"| EXEC["<b>执行写入</b>"]:::exec

  EXEC --> VERIFY["<b>pnpm verify</b><br/>tsc + eslint + prettier"]:::vfy

  VERIFY -->|"通过"| DONE["<b>完成</b>"]:::done
  VERIFY -->|"报错"| ERRTABLE{"<b>查错表 §3</b>"}:::decision

  ERRTABLE -->|"匹配"| FIX["<b>按表修复</b><br/>1 轮内解决"]:::fix
  ERRTABLE -->|"未匹配"| STOPCHK{"<b>≥5 轮 or<br/>2 轮无进展?</b>"}:::decision

  STOPCHK -->|"是"| STOP2["<b>硬停 §4</b><br/>已修复清单 + 剩余错误 + 根因"]:::stop
  STOPCHK -->|"否"| FIX
  FIX --> VERIFY

  classDef start fill:#faf5ff,stroke:#8b5cf6,color:#7c3aed,stroke-width:2px
  classDef decision fill:#fffbeb,stroke:#f59e0b,color:#92400e,stroke-width:1px
  classDef skill fill:#ecfeff,stroke:#06b6d4,color:#0891b2,stroke-width:2px
  classDef modify fill:#ecfdf5,stroke:#10b981,color:#059669,stroke-width:2px
  classDef tpl fill:#eef2ff,stroke:#6366f1,color:#4f46e5,stroke-width:2px
  classDef stop fill:#fef2f2,stroke:#f43f5e,color:#e11d48,stroke-width:2px
  classDef skip fill:#f8fafc,stroke:#94a3b8,color:#64748b,stroke-width:1px
  classDef exec fill:#faf5ff,stroke:#8b5cf6,color:#7c3aed,stroke-width:2px
  classDef vfy fill:#ecfdf5,stroke:#10b981,color:#059669,stroke-width:2px
  classDef done fill:#ecfdf5,stroke:#10b981,color:#059669,stroke-width:2px
  classDef fix fill:#fffbeb,stroke:#eab308,color:#a16207,stroke-width:2px
`;

// ---- section config ----

export interface SectionDef {
  id: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
  diagram: string;
  accentColor: string;
  accentBg: string;
  minHeight: number;
  /** per-diagram font size override (px); omit to use 14px default */
  fontSize?: number;
}

export const sections: SectionDef[] = [
  {
    id: 'pipeline',
    icon: <RocketOutlined />,
    label: '开发流水线',
    sub: '⓪ 需求 → ⑤ 上线，6 阶段线性推进',
    diagram: pipelineDiagram,
    accentColor: '#06b6d4',
    accentBg: '#ecfeff',
    minHeight: 100,
  },
  {
    id: 'defense',
    icon: <SafetyOutlined />,
    label: '五层防御体系',
    sub: 'L0 速查 → L1 机械 → L2 约束 → L3 场景 → L4 索引',
    diagram: defenseLayersDiagram,
    accentColor: '#f59e0b',
    accentBg: '#fffbeb',
    minHeight: 110,
    fontSize: 9,
  },
  {
    id: 'correction',
    icon: <CodeOutlined />,
    label: '纠错决策树',
    sub: '收到纠正 → 命中层级 → 写入文件',
    diagram: correctionWorkflowDiagram,
    accentColor: '#6366f1',
    accentBg: '#eef2ff',
    minHeight: 140,
    fontSize: 8,
  },
  {
    id: 'flywheel',
    icon: <SyncOutlined />,
    label: '错误沉淀飞轮',
    sub: '捕捉 → 聚合 → 入库 → 循环强化 · O2 层',
    diagram: flywheelDiagram,
    accentColor: '#8b5cf6',
    accentBg: '#faf5ff',
    minHeight: 120,
  },
  {
    id: 'dual',
    icon: <ExperimentOutlined />,
    label: '强/弱模型双路径',
    sub: 'AGENTS.md（全量） vs AGENTS-LITE.md（蒸馏）+ distill:check',
    diagram: dualModelDiagram,
    accentColor: '#10b981',
    accentBg: '#ecfdf5',
    minHeight: 120,
    fontSize: 9,
  },
  {
    id: 'lite-workflow',
    icon: <ThunderboltOutlined />,
    label: '弱模型全流程 (AGENTS-LITE.md)',
    sub: '模式选择 → 防循环 R1-R5 → 输出锁 → 验证修正 → 硬停兜底',
    diagram: liteWorkflowDiagram,
    accentColor: '#8b5cf6',
    accentBg: '#faf5ff',
    minHeight: 200,
    fontSize: 8,
  },
];

// ---- stat config ----

export interface StatDef {
  color: string;
  bg: string;
  label: string;
  value: string;
  sub: string;
}

export const stats: StatDef[] = [
  {
    color: '#06b6d4',
    bg: '#ecfeff',
    label: '开发阶段',
    value: '⓪ → ⑤',
    sub: '6 阶段全流程',
  },
  {
    color: '#f59e0b',
    bg: '#fffbeb',
    label: '防御层级',
    value: 'L0 → L4',
    sub: '5 层递进防线',
  },
  {
    color: '#6366f1',
    bg: '#eef2ff',
    label: '错题规则',
    value: 'P001 → P015',
    sub: '15 条自动拦截',
  },
  {
    color: '#10b981',
    bg: '#ecfdf5',
    label: '三级验证',
    value: 'L1 + L2 + L3',
    sub: '自动 → 自检 → 人工',
  },
];

// ---- helpers ----

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) {
    return '夜深了';
  }
  if (hour < 9) {
    return '早上好';
  }
  if (hour < 12) {
    return '上午好';
  }
  if (hour < 14) {
    return '中午好';
  }
  if (hour < 18) {
    return '下午好';
  }
  return '晚上好';
};
