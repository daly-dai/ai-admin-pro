import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import { isString } from 'lodash-es';
import type { ReactNode } from 'react';

import styles from './diff.module.css';

// ============================================================
// 全局单例，绝不 new 第二次
// ============================================================
const dmp = new DiffMatchPatch();

// --- LRU 缓存：同一对字符串不重复 diff ---
const cache = new Map<string, DiffDOM>();
const MAX_CACHE_SIZE = 500;

function cacheKey(leftStr: string, rightStr: string): string {
  return `${leftStr}|||${rightStr}`;
}

function normalizeLineBreaks(str: string): string {
  return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

// ============================================================
// DiffDOM
// ============================================================
export interface DiffDOM {
  left: ReactNode;
  right: ReactNode;
  hasDiff: boolean;
}

export const getDiffDOM = (leftText?: string, rightText?: string): DiffDOM => {
  if (typeof leftText !== 'string' || typeof rightText !== 'string') {
    return { left: leftText || '', right: rightText || '', hasDiff: false };
  }

  const left = leftText || '';
  const right = rightText || '';

  // 缓存命中 → 直接返回结构化数据
  const key = cacheKey(left, right);
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const diffs = dmp.diff_main(left, right);
  const hasDiff = diffs.some(([type]) => type !== 0);

  const leftParts: ReactNode[] = [];
  const rightParts: ReactNode[] = [];

  for (const [change, text] of diffs) {
    if (change === 0) {
      leftParts.push(text);
      rightParts.push(text);
    } else if (change === -1) {
      leftParts.push(
        <span className={styles.deletion} key={`del-${leftParts.length}`}>
          {text}
        </span>,
      );
    } else if (change === 1) {
      rightParts.push(
        <span className={styles.addition} key={`add-${rightParts.length}`}>
          {text}
        </span>,
      );
    }
  }

  const result: DiffDOM = { left: leftParts, right: rightParts, hasDiff };

  // LRU 淘汰
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) {
      cache.delete(firstKey);
    }
  }
  cache.set(key, result);

  return result;
};

// ============================================================
// diffCharsElements（接口兼容原调用方）
// ============================================================
export const diffCharsElements = (
  oldStr?: string,
  newStr?: string,
  renderType: 'old' | 'new' = 'old',
): { diffElement: ReactNode | null } => {
  if (!isString(oldStr) || !isString(newStr)) {
    return { diffElement: null };
  }

  const normalizedOld = normalizeLineBreaks(oldStr);
  const normalizedNew = normalizeLineBreaks(newStr);

  if (normalizedOld === normalizedNew) {
    return { diffElement: <div>{newStr ?? ''}</div> };
  }

  const { left, right } = getDiffDOM(normalizedOld, normalizedNew);

  return {
    diffElement:
      renderType === 'old' ? (
        <div className={styles.textAreaContainer}>{left}</div>
      ) : (
        <div className={styles.textAreaContainer}>{right}</div>
      ),
  };
};
