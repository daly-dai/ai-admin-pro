# Prompt: 生成数据可视化页面

## 使用方式

提供数据接口定义和图表配置，AI 生成数据可视化页面。

## 页面定义模板

页面名称: `[PAGE_NAME]`
页面路由: `[PAGE_ROUTE]`

### 接口定义
```yaml
interfaces:
  - name: [method_name]
    method: GET
    path: /api/[path]
    params: [startDate, endDate, ...]
    response: [DataItem][]

types:
  [DataItem]:
    - name: [field_name]
      type: [field_type]
```

### 图表配置
```yaml
charts:
  - type: [line|bar|pie|doughnut]
    title: [图表标题]
    xAxis: [x轴字段]
    yAxis: [y轴字段]
    dataSource: [api_method]
```

### 布局配置
- 布局方式: [grid|row-col]
- 响应式: [true|false]
- 网格列数: [2|3|4]

## 生成规范

### 文件结构
- `pages/[page]/index.tsx` - 主页面
- `pages/[page]/components/[ChartName].tsx` - 图表组件（可选）

### 技术栈
- 图表: Chart.js + react-chartjs-2
- 状态: ahooks useRequest
- 布局: Ant Design Card/Row/Col

## 快速示例

```typescript
// 主页面结构
const [PageName]: React.FC = () => {
  const { data: trendData } = useRequest(api.getTrend);
  const { data: distributionData } = useRequest(api.getDistribution);

  return (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card title="[趋势标题]">
          <LineChart data={trendData} />
        </Card>
      </Col>
      <Col span={12}>
        <Card title="[分布标题]">
          <PieChart data={distributionData} />
        </Card>
      </Col>
    </Row>
  );
};
```
