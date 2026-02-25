import React from 'react';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Card, Col, List, Progress, Row, Statistic, Tag } from 'antd';

const DashboardPage: React.FC = () => {
  // 统计数据
  const statistics = [
    {
      title: '总用户数',
      value: 1234,
      prefix: <UserOutlined />,
      change: 12.5,
      color: '#1677ff',
    },
    {
      title: '总订单数',
      value: 5678,
      prefix: <FileTextOutlined />,
      change: 8.2,
      color: '#52c41a',
    },
    {
      title: '完成任务',
      value: 890,
      prefix: <CheckCircleOutlined />,
      change: -3.1,
      color: '#722ed1',
    },
    {
      title: '待处理',
      value: 23,
      prefix: <WarningOutlined />,
      change: 5.4,
      color: '#fa8c16',
    },
  ];

  // 最近活动
  const activities = [
    {
      title: '新用户注册',
      description: '用户张三刚刚完成了注册',
      time: '2分钟前',
      color: 'blue',
    },
    {
      title: '订单创建',
      description: '新订单 #12345 已创建',
      time: '15分钟前',
      color: 'green',
    },
    {
      title: '系统警告',
      description: '服务器CPU使用率超过80%',
      time: '1小时前',
      color: 'orange',
    },
    {
      title: '任务完成',
      description: '数据备份任务已完成',
      time: '2小时前',
      color: 'purple',
    },
  ];

  // 项目进度
  const projects = [
    { name: '前端架构升级', progress: 85 },
    { name: 'API接口优化', progress: 60 },
    { name: 'UI组件库开发', progress: 90 },
    { name: '文档编写', progress: 45 },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card hoverable>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                valueStyle={{ color: stat.color }}
              />
              <div style={{ marginTop: 8, fontSize: 14 }}>
                {stat.change > 0 ? (
                  <>
                    <ArrowUpOutlined style={{ color: '#52c41a' }} />
                    <span style={{ color: '#52c41a' }}>{stat.change}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownOutlined style={{ color: '#f5222d' }} />
                    <span style={{ color: '#f5222d' }}>
                      {Math.abs(stat.change)}%
                    </span>
                  </>
                )}
                <span style={{ color: '#999', marginLeft: 8 }}>较上月</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 下方内容 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="最近活动" style={{ minHeight: 320 }}>
            <List
              dataSource={activities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Tag color={item.color}>●</Tag>}
                    title={item.title}
                    description={item.description}
                  />
                  <div style={{ color: '#999', fontSize: 12 }}>{item.time}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="项目进度" style={{ minHeight: 320 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {projects.map((project, index) => (
                <div key={index}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 14, color: '#333' }}>
                      {project.name}
                    </span>
                    <span style={{ fontSize: 14, color: '#666' }}>
                      {project.progress}%
                    </span>
                  </div>
                  <Progress
                    percent={project.progress}
                    size="small"
                    status={project.progress === 100 ? 'success' : 'active'}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
