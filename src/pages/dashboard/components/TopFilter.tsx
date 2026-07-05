import { DatePicker, Radio, Space } from 'antd';
import dayjs from 'dayjs';

import type { Dimension, Unit } from 'src/pages/dashboard/store';
import { useDashboardStore } from 'src/pages/dashboard/store';

const UNITS: Unit[] = ['亿元', '万元'];
const DIMENSIONS: Dimension[] = ['业务维度', '财务维度'];

const TopFilter: React.FC = () => {
  const filter = useDashboardStore((state) => state.filter);
  const setFilter = useDashboardStore((state) => state.setFilter);

  return (
    <Space size="middle" wrap>
      <Space>
        <span style={{ fontSize: 13, color: '#666' }}>结束日期</span>
        <DatePicker
          value={dayjs(filter.endDate)}
          onChange={(date) => {
            if (date) {
              setFilter({ endDate: date.format('YYYY-MM-DD') });
            }
          }}
          allowClear={false}
          style={{ width: 140 }}
        />
      </Space>

      <Space>
        <span style={{ fontSize: 13, color: '#666' }}>单位</span>
        <Radio.Group
          value={filter.unit}
          onChange={(event) => setFilter({ unit: event.target.value })}
          optionType="button"
          size="small"
        >
          {UNITS.map((unit) => (
            <Radio.Button key={unit} value={unit}>
              {unit}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Space>

      <Space>
        <span style={{ fontSize: 13, color: '#666' }}>维度</span>
        <Radio.Group
          value={filter.dimension}
          onChange={(event) => setFilter({ dimension: event.target.value })}
          optionType="button"
          size="small"
        >
          {DIMENSIONS.map((dimension) => (
            <Radio.Button key={dimension} value={dimension}>
              {dimension}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Space>
    </Space>
  );
};

export default TopFilter;
