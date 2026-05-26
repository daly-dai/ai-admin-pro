import type { DrawerChildProps, SDetailItem } from '@dalydb/sdesign';
import { createDrawer, SDetail } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { Drawer, Spin } from 'antd';
import { getUserByIdByGet } from 'src/api/user';

type DetailParams = { id: string };

const DetailContent = ({ params, onClose }: DrawerChildProps<DetailParams>) => {
  const { data: detail, loading } = useRequest(() =>
    getUserByIdByGet(params.id),
  );

  const detailItems: SDetailItem[] = [
    { label: '用户名', name: 'username' },
    { label: '昵称', name: 'nickname' },
    { label: '邮箱', name: 'email' },
    { label: '手机号', name: 'phone' },
    {
      label: '角色',
      name: 'roleIds',
      render: (roleIds: string[]) =>
        roleIds?.length ? roleIds.join(', ') : '未分配',
    },
    { label: '状态', name: 'status', type: 'dict', dictKey: 'userStatus' },
    { label: '备注', name: 'remark' },
    { label: '创建时间', name: 'createTime' },
    { label: '更新时间', name: 'updateTime' },
  ];

  return (
    <Drawer open title="用户详情" width={480} onClose={onClose}>
      <Spin spinning={loading}>
        <SDetail dataSource={detail} items={detailItems} column={1} />
      </Spin>
    </Drawer>
  );
};

export default createDrawer<DetailParams>(DetailContent);
