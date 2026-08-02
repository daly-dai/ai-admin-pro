import type { ModalChildProps } from '@dalydb/sdesign';
import { createDrawer, SButton } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { Drawer, message, Space, Spin, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useMemo, useState } from 'react';

import { getPermListByPost as getPermsByPost } from 'src/api/permission';
import type { Permission } from 'src/api/permission/types';
import {
  assignRolePermissionsByPost,
  getRolePermissionsByGet,
} from 'src/api/role';

type Params = { roleId: number; roleName: string };

/** 将扁平权限列表转为 antd Tree 的 treeData */
const buildPermTree = (perms: Permission[]): DataNode[] => {
  const map = new Map<number, DataNode>();
  const roots: DataNode[] = [];

  for (const perm of perms) {
    map.set(perm.id, {
      key: perm.id,
      title: `${perm.name} (${perm.code})`,
    });
  }

  for (const perm of perms) {
    const node = map.get(perm.id);
    if (!node) {
      continue;
    }

    if (perm.parentId && map.has(perm.parentId)) {
      const parent = map.get(perm.parentId)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

const PermAssignContent = ({
  params,
  open,
  onClose,
}: ModalChildProps<Params>) => {
  const [checkedKeys, setCheckedKeys] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: allPerms = [], loading: permsLoading } = useRequest(
    async () => {
      const res = await getPermsByPost();
      return res.list;
    },
  );

  const { loading: rolePermsLoading } = useRequest(
    () => getRolePermissionsByGet(params.roleId),
    {
      ready: !!params.roleId,
      onSuccess: (data) => {
        setCheckedKeys(data ?? []);
      },
    },
  );

  const loading = permsLoading || rolePermsLoading;
  const treeData = useMemo(() => buildPermTree(allPerms), [allPerms]);

  // 第一层默认展开
  const rootKeys = useMemo(
    () => treeData.map((node) => node.key as number),
    [treeData],
  );

  const handleOk = async () => {
    setSaving(true);
    try {
      await assignRolePermissionsByPost(params.roleId, checkedKeys);
      message.success('权限分配成功');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      title={`分配权限 — ${params.roleName}`}
      onClose={onClose}
      width={420}
      footer={
        <Space style={{ float: 'right' }}>
          <SButton onClick={onClose}>取消</SButton>
          <SButton type="primary" loading={saving} onClick={handleOk}>
            保存
          </SButton>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Tree
          checkable
          defaultExpandedKeys={rootKeys}
          checkedKeys={checkedKeys}
          onCheck={(keys) => setCheckedKeys(keys as number[])}
          treeData={treeData}
        />
      </Spin>
    </Drawer>
  );
};

export default createDrawer<Params>(PermAssignContent);
