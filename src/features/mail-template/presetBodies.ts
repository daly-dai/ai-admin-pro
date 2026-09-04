/**
 * 模板预设正文数据（PRD Q3 / 开放问题#1 定稿：一套简洁、一套带引导说明）。
 * 不变式：每套正文恰好包含 1 个 {{table}}（presetBodies.test.ts 兜底，改动后跑测试再提交）。
 * WHY 独立数据文件：文案与页面代码解耦，讲解演示可只改词、不动组件。
 */
export interface PresetBody {
  id: string;
  label: string;
  description: string;
  bodyHtml: string;
}

export const PRESET_BODIES: PresetBody[] = [
  {
    id: 'simple',
    label: '简洁版',
    description: '简短直接，适合日常数据同步',
    bodyHtml: [
      '<p>各位好：</p>',
      '<p>现将本期经营数据整理如下，请查收。</p>',
      '<p>{{table}}</p>',
      '<p>如有疑问，欢迎随时联系。</p>',
    ].join(''),
  },
  {
    id: 'guided',
    label: '引导说明版',
    description: '带收件人引导与注意事项，适合首次交付',
    bodyHtml: [
      '<p>各位同事：</p>',
      '<p>为便于核对，本期数据已整理成表格，插入在下方表格区域（发送或预览时自动带入所选报表）。</p>',
      '<p>{{table}}</p>',
      '<p>注意事项：表格样式与原始 Excel 保持一致，如需源文件请以附件为准。</p>',
      '<p>请查收并反馈，谢谢！</p>',
    ].join(''),
  },
];

/** 新建模板默认预填的预设 id（讲解演示起点 = 数组首项） */
export const DEFAULT_PRESET_ID: string = PRESET_BODIES[0].id;

export function findPresetBody(
  presetId: string | undefined,
): PresetBody | undefined {
  return PRESET_BODIES.find((preset) => preset.id === presetId);
}
