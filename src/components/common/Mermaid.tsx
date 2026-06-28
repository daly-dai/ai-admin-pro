import mermaid from 'mermaid';
import { useEffect, useId, useRef } from 'react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#eef2ff',
    primaryTextColor: '#1e293b',
    primaryBorderColor: '#6366f1',
    lineColor: '#94a3b8',
    secondaryColor: '#ecfeff',
    tertiaryColor: '#f8fafc',
    fontSize: '14px',
    fontFamily:
      "'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  },
});

interface MermaidProps {
  code: string;
  style?: React.CSSProperties;
  /** per-diagram font size override (px), prepends %%{init}%% directive */
  fontSize?: number;
}

const Mermaid: React.FC<MermaidProps> = ({ code, style, fontSize }) => {
  const id = useId().replace(/:/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const renderedCode = useRef('');

  useEffect(() => {
    if (!ref.current || renderedCode.current === code) {
      return;
    }

    const diagramCode =
      fontSize !== null
        ? `%%{init: {'themeVariables': {'fontSize': '${fontSize}px'}}}%%\n${code}`
        : code;

    let cancelled = false;

    void mermaid
      .render(`${id}-svg`, diagramCode)
      .then(({ svg }) => {
        if (cancelled || !ref.current) {
          return;
        }
        ref.current.innerHTML = svg;
        renderedCode.current = code;
      })
      .catch(() => {
        // parse error — silently ignore stale renders
      });

    // consistent-return 假阳性：void 表达式后必然到达此 return
    // eslint-disable-next-line consistent-return
    return () => {
      cancelled = true;
    };
  }, [code, id, fontSize]);

  return (
    <div
      ref={ref}
      className="mermaid"
      style={{
        display: 'flex',
        justifyContent: 'center',
        ...style,
      }}
    />
  );
};

export default Mermaid;
