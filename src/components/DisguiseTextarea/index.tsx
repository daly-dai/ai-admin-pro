import type { TextAreaProps, TextAreaRef } from 'antd/lib/input/TextArea';
import { memo, useCallback, useRef, type FC, type ReactNode } from 'react';

import DebounceTextArea from '../DebounceTextArea';
import styles from './index.module.css';

interface DisguiseTextareaProps extends TextAreaProps {
  /** 覆盖在 textarea 上方的视觉内容（diff 高亮等） */
  disguisedValue?: ReactNode;
  /** 是否启用防抖 */
  isDebounce?: boolean;
  /** 防抖等待时间（ms） */
  debounceWait?: number;
}

/**
 * 「伪装」TextArea —— 真正的 textarea 文字透明，
 * 通过绝对定位的 overlay 层展示任意 ReactNode（如 diff 高亮）。
 *
 * 优化要点：
 *  - 不再使用 getComputedStyle（消灭同步重排）
 *  - 不再动态注入 <style> 标签
 *  - overlay 样式通过 CSS 变量与 EleCompareTextArea 对齐
 */
const DisguiseTextarea: FC<DisguiseTextareaProps> = ({
  disguisedValue = '',
  isDebounce = false,
  debounceWait = 300,
  className,
  style,
  ...textAreaProps
}) => {
  const textAreaRef = useRef<TextAreaRef>(null);

  // ---- 仅同步滚动，不碰 computed style ----
  const handleScroll = useCallback(() => {
    const textArea = textAreaRef.current?.resizableTextArea?.textArea;
    const wrapper = textArea?.closest(`.${styles.wrapper}`);
    const overlay = wrapper?.querySelector(
      `.${styles.overlay}`,
    ) as HTMLElement | null;
    if (textArea && overlay) {
      overlay.scrollTop = textArea.scrollTop;
      overlay.scrollLeft = textArea.scrollLeft;
    }
  }, []);

  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(' ')}
      style={style}
    >
      {/* 覆盖层：展示 disguisedValue，点击穿透到 textarea */}
      <div className={styles.overlay} aria-hidden="true">
        {disguisedValue}
      </div>

      {/* 真实 textarea：文字透明，光标可见 */}
      <DebounceTextArea
        ref={textAreaRef}
        isDebounce={isDebounce}
        debounceWait={debounceWait}
        className={styles.transparentTextarea}
        onScroll={handleScroll}
        {...textAreaProps}
      />
    </div>
  );
};

export default memo(DisguiseTextarea);
