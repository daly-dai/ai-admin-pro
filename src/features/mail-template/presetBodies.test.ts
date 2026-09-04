/**
 * 预设正文数据不变式（PRD Q3 / 开放问题#1：2 套，均恰好 1 个 {{table}}）。
 * WHY: 预设是纯数据文件，靠人审可能漏——锁「恰好 1 个占位符」口径，
 * 防止以后新增/修改预设时手滑多写一个 {{table}} 而保存校验放行失败。
 */
import { describe, expect, it } from 'vitest';

import { PRESET_BODIES } from './presetBodies';
import { countBodyPlaceholders } from './service/templateRules';

describe('presetBodies 预设正文数据', () => {
  it('每套正文恰好包含 1 个 {{table}} 占位符', () => {
    for (const preset of PRESET_BODIES) {
      expect(countBodyPlaceholders(preset.bodyHtml), preset.id).toBe(1);
    }
  });

  it('id 唯一，label / description / bodyHtml 均非空', () => {
    const ids = PRESET_BODIES.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const preset of PRESET_BODIES) {
      expect(preset.label.length).toBeGreaterThan(0);
      expect(preset.description.length).toBeGreaterThan(0);
      expect(preset.bodyHtml.length).toBeGreaterThan(0);
    }
  });
});
