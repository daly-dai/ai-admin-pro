import {
  forwardRef,
  useImperativeHandle,
  useState,
  type ComponentType,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
} from 'react';

// ─── Types ───────────────────────────────────────────────

/** ref 接口 —— P 是 open() 时传入的参数类型 */
export interface DrawerContainerRef<
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  open: (params: P) => void;
}

/** Content 组件接收的 props */
export interface DrawerChildProps<
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  params: P;
  onClose: () => void;
}

// ─── Factory ─────────────────────────────────────────────

/**
 * 创建一个自动管理生命周期的 Drawer 容器。
 *
 * - 自动管理 open 状态，通过 ref 暴露 `open(params)` 方法
 * - open=false 时 Content 完全卸载，内部所有 useState 等自动销毁
 * - 泛型 P 决定 open() 的参数结构，Content 通过 `params` 接收
 *
 * @example
 * ```tsx
 * const UserDetailDrawer = createDrawer<{ id: string }>(
 *   ({ params, onClose }) => {
 *     const { data } = useRequest(() => getByIdByGet(params.id));
 *     return (
 *       <Drawer open title="详情" onClose={onClose}>
 *         <SDetail dataSource={data} items={items} />
 *       </Drawer>
 *     );
 *   },
 * );
 * ```
 */
export function createDrawer<
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  Content: ComponentType<DrawerChildProps<P>>,
): ForwardRefExoticComponent<
  PropsWithoutRef<Record<string, never>> & RefAttributes<DrawerContainerRef<P>>
> {
  const Wrapper = forwardRef<DrawerContainerRef<P>, Record<string, never>>(
    (_props, ref) => {
      const [open, setOpen] = useState(false);
      const [params, setParams] = useState<P>({} as P);

      useImperativeHandle(ref, () => ({
        open: (p) => {
          setParams(p);
          setOpen(true);
        },
      }));

      return open ? (
        <Content params={params} onClose={() => setOpen(false)} />
      ) : null;
    },
  );

  Wrapper.displayName = Content.displayName || Content.name || 'DrawerWrapper';
  return Wrapper;
}
