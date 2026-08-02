import React from 'react';

/** 马卡龙色板 — 8 色，value 哈希后确定映射 */
const palette = [
  { bg: '#E8F8F0', text: '#3CB371' }, // 0 薄荷绿
  { bg: '#FDE8EC', text: '#E07B8C' }, // 1 玫瑰粉
  { bg: '#FFF1E6', text: '#E8944A' }, // 2 蜜桃橙
  { bg: '#E6F0FA', text: '#5B8DEF' }, // 3 天空蓝
  { bg: '#F4ECFA', text: '#9B7EC4' }, // 4 薰衣草紫
  { bg: '#FFF9C4', text: '#C0A030' }, // 5 奶油黄
  { bg: '#FFE0E0', text: '#D4747C' }, // 6 珊瑚红
  { bg: '#E0F0F0', text: '#5A9E9E' }, // 7 青瓷绿
] as const;

const presetIndex: Record<string, number> = {
  success: 0,
  error: 1,
  warning: 2,
  info: 3,
  default: 4,
};

type PresetType = keyof typeof presetIndex;

interface DictOption {
  label: string;
  value: string;
}

export interface MacaronTagProps {
  /** 预设类型（手动模式） */
  type?: PresetType;
  /** 自定义色值（手动模式，color 同时设 bg，text 自动白色） */
  color?: string;
  bgColor?: string;
  textColor?: string;
  /** 字典 Map：{ value: label } */
  dictMap?: Record<string, string>;
  /** 字典 Options 列表 */
  dictOptions?: DictOption[];
  /** 当前字典值（配合 dictMap / dictOptions 使用） */
  value?: string;
  /** 手动内容（无字典时使用） */
  children?: React.ReactNode;
}

/** 确定性哈希：同一个字符串永远映射到同一颜色 */
function hashIndex(str: string): number {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum = (sum * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(sum) % palette.length;
}

/** 从 dictOptions 转为 Record */
function optionsToMap(options: DictOption[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const { label, value } of options) {
    map[value] = label;
  }
  return map;
}

const MacaronTag: React.FC<MacaronTagProps> = ({
  type,
  color,
  bgColor,
  textColor,
  dictMap,
  dictOptions,
  value: dictValue,
  children,
}) => {
  // ----- 字典模式：dictMap/dictOptions + value -----
  const effectiveMap =
    dictMap || (dictOptions ? optionsToMap(dictOptions) : undefined);

  if (effectiveMap && dictValue !== undefined) {
    const label = effectiveMap[dictValue] ?? dictValue;
    const idx = hashIndex(dictValue);
    const { bg, text } = palette[idx];

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 10px',
          fontSize: 12,
          fontWeight: 500,
          lineHeight: '20px',
          borderRadius: 10,
          background: bg,
          color: text,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    );
  }

  // ----- 手动模式：type / color / children -----
  const idx = type ? (presetIndex[type] ?? 4) : 4;
  const paletteItem = palette[idx];

  const bg = bgColor || color || paletteItem.bg;
  const text = textColor || (color ? '#fff' : paletteItem.text);

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '20px',
        borderRadius: 10,
        background: bg,
        color: text,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
};

export default MacaronTag;
