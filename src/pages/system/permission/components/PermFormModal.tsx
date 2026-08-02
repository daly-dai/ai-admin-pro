import type { ModalChildProps } from '@dalydb/sdesign';
import { createModal, SForm } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal, Spin } from 'antd';
import { useMemo } from 'react';

import {
  createPermByPost,
  getPermByIdByGet,
  getPermListByPost,
  updatePermByPost,
} from 'src/api/permission';
import type { Permission, PermissionFormData } from 'src/api/permission/types';

interface TreeSelectNode {
  value: number;
  title: string;
  children: TreeSelectNode[];
}

type Params = { mode: 'create' | 'edit'; id?: number };

/** 将权限列表转为 TreeSelect 的 treeData */
const toTreeSelectData = (perms: Permission[]): TreeSelectNode[] => {
  const map = new Map<number, TreeSelectNode>();
  const roots: TreeSelectNode[] = [];

  for (const perm of perms) {
    map.set(perm.id, {
      value: perm.id,
      title: `${perm.name} (${perm.code})`,
      children: [],
    });
  }

  for (const perm of perms) {
    const node = map.get(perm.id);
    if (!node) {
      continue;
    }
    if (perm.parentId && map.has(perm.parentId)) {
      map.get(perm.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

const PermFormContent = ({
  params,
  onClose,
  onSuccess,
}: ModalChildProps<Params>) => {
  const [form] = SForm.useForm();
  const isEdit = params.mode === 'edit';

  const { data: allPerms = [] } = useRequest(async () => {
    const res = await getPermListByPost();
    return res.list;
  });

  const treeSelectData = useMemo(() => toTreeSelectData(allPerms), [allPerms]);

  const { loading: detailLoading } = useRequest(
    () => getPermByIdByGet(params.id!),
    {
      ready: isEdit && !!params.id,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  const { run, loading } = useRequest(
    (values: PermissionFormData) => {
      if (isEdit) {
        return updatePermByPost({ ...values, id: params.id! });
      }
      return createPermByPost(values);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(isEdit ? '更新成功' : '创建成功');
        onSuccess?.();
      },
    },
  );

  const formItems = [
    {
      label: '权限编码',
      name: 'code',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入权限编码' }],
    },
    {
      label: '权限名称',
      name: 'name',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入权限名称' }],
    },
    {
      label: '类型',
      name: 'type',
      type: 'select' as const,
      rules: [{ required: true, message: '请选择权限类型' }],
      fieldProps: {
        options: [
          { label: '菜单 (menu)', value: 'menu' },
          { label: '按钮 (button)', value: 'button' },
          { label: '接口 (api)', value: 'api' },
        ],
      },
    },
    {
      label: '父权限',
      name: 'parentId',
      type: 'treeSelect' as const,
      fieldProps: {
        treeData: treeSelectData,
        allowClear: true,
        placeholder: '不选则为顶级权限',
      },
    },
    {
      label: '排序',
      name: 'sort',
      type: 'inputNumber' as const,
    },
    {
      label: '状态',
      name: 'status',
      type: 'select' as const,
      fieldProps: { dictKey: 'user_status' },
    },
    {
      label: '描述',
      name: 'description',
      type: 'textarea' as const,
    },
  ];

  return (
    <Modal
      open
      title={isEdit ? '编辑权限' : '新增权限'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={520}
    >
      <Spin spinning={detailLoading}>
        <SForm
          form={form}
          items={formItems}
          columns={1}
          onFinish={(values) => run(values)}
        />
      </Spin>
    </Modal>
  );
};

export default createModal<Params>(PermFormContent);
