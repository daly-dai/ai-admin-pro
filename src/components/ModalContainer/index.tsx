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
export interface ModalContainerRef<
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  open: (params: P) => void;
}

/** Content 组件接收的 props */
export interface ModalChildProps<
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  params: P;
  onClose: () => void;
  onSuccess: () => void;
}

interface WrapperProps {
  onSuccess?: () => void;
}

// ─── Factory ─────────────────────────────────────────────

/**
 * 创建一个自动管理生命周期的 Modal 容器。
 *
 * - 自动管理 open 状态，通过 ref 暴露 `open(params)` 方法
 * - open=false 时 Content 完全卸载，内部所有 useState / useForm 等自动销毁
 * - 泛型 P 决定 open() 的参数结构，Content 通过 `params` 接收
 *
 * @example
 * ```tsx
 * const UserFormModal = createModal<{ mode: 'create' | 'edit'; id?: string }>(
 *   ({ params, onClose, onSuccess }) => {
 *     const [form] = SForm.useForm();
 *     return (
 *       <Modal open onCancel={onClose} footer={null}>
 *         <SForm form={form} items={items} onFinish={onSuccess} />
 *       </Modal>
 *     );
 *   },
 * );
 * ```
 */
export function createModal<
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  Content: ComponentType<ModalChildProps<P>>,
): ForwardRefExoticComponent<
  PropsWithoutRef<WrapperProps> & RefAttributes<ModalContainerRef<P>>
> {
  const Wrapper = forwardRef<ModalContainerRef<P>, WrapperProps>(
    (props, ref) => {
      const [open, setOpen] = useState(false);
      const [params, setParams] = useState<P>({} as P);

      useImperativeHandle(ref, () => ({
        open: (p) => {
          setParams(p);
          setOpen(true);
        },
      }));

      return open ? (
        <Content
          params={params}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            props.onSuccess?.();
          }}
        />
      ) : null;
    },
  );

  Wrapper.displayName = Content.displayName || Content.name || 'ModalWrapper';
  return Wrapper;
}
