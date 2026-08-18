import type { TextAreaProps } from 'antd/es/input';
import { memo, useCallback, useMemo, useState, type FC } from 'react';

import { diffCharsElements } from 'src/utils/diff';

import DisguiseTextarea from '../DisguiseTextarea';
import styles from './index.module.css';

export interface HistoryTextareaProps extends Omit<TextAreaProps, 'value'> {
  /** 历史数据（原始值，用于 diff 对比） */
  defaultData: string;
  /** true 表示展示旧值视角的 diff */
  isOld?: boolean;
  /** 是否防抖 */
  isDebounce?: boolean;
  /** 防抖等待时间（ms） */
  debounceWait?: number;
  /** 当前值 */
  value?: string;
}

/**
 * 差异化编辑 TextArea —— 表格中对比历史数据与当前值的输入组件。
 *
 * 核心优化（懒激活）：
 *  - 默认渲染轻量 diff 视图（纯 div，不挂载 antd TextArea）
 *  - 点击后才激活编辑态（挂载 DisguiseTextarea + antd TextArea）
 *  - 200 行表格中，仅 1 个激活，其余 199 个是纯 div
 *
 * 编辑态 / 非编辑态通过共享 CSS 变量 (:root) 保证视觉对齐。
 */
const EleCompareTextArea: FC<HistoryTextareaProps> = ({
  value = '',
  defaultData,
  isDebounce = false,
  isOld = false,
  debounceWait = 300,
  onChange,
  ...resetprops
}) => {
  const [editing, setEditing] = useState(false);

  // ---- diff 计算（编辑态和非编辑态共用） ----
  const { diffElement } = useMemo(() => {
    if (isOld) {
      return diffCharsElements(value ?? '', defaultData ?? '', 'old');
    }
    return diffCharsElements(defaultData ?? '', value ?? '', 'new');
  }, [defaultData, value, isOld]);

  // ---- 进入编辑 ----
  const handleEnterEdit = useCallback(() => {
    setEditing(true);
  }, []);

  // ---- 退出编辑 ----
  const handleExitEdit = useCallback(() => {
    setEditing(false);
  }, []);

  // ==================== 非编辑态：轻量 diff view ====================
  if (!editing) {
    return (
      <div
        className={styles.diffView}
        onClick={handleEnterEdit}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            handleEnterEdit();
          }
        }}
      >
        {diffElement}
      </div>
    );
  }

  // ==================== 编辑态：完整 DisguiseTextarea ====================
  return (
    <DisguiseTextarea
      debounceWait={debounceWait}
      isDebounce={isDebounce}
      disguisedValue={diffElement}
      value={value}
      onChange={onChange}
      onBlur={handleExitEdit}
      autoFocus
      {...resetprops}
    />
  );
};

export default memo(EleCompareTextArea);
