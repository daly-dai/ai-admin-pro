import { useMemo, useState } from 'react';

import type { EChartsOption } from 'echarts';
import EChartsBase from 'src/components/EChartsBase';
import { PIE_COLORS } from 'src/pages/dashboard/constants';
import type { PieNode, Unit } from 'src/pages/dashboard/store';
import { convertUnit } from 'src/pages/dashboard/utils';

interface DonutChartProps {
  data: PieNode[];
  unit: Unit;
  /** 是否支持上下级联动 */
  linked?: boolean;
}

/**
 * 环形图 — 基于 EChartsBase。
 *
 * 支持一级→二级下钻（linked=true 时）。
 * 点击有 children 的一级分类进入二级，支持返回上级。
 */
const DonutChart: React.FC<DonutChartProps> = ({
  data,
  unit,
  linked = false,
}) => {
  const [selectedParent, setSelectedParent] = useState<PieNode | null>(null);

  const viewData = useMemo(() => {
    if (linked && selectedParent?.children?.length) {
      return selectedParent.children;
    }
    return data;
  }, [data, linked, selectedParent]);

  const viewLabel = useMemo(() => {
    if (linked && selectedParent) {
      return `${selectedParent.name} / 二级分类`;
    }
    return '一级分类';
  }, [linked, selectedParent]);

  const handleBack = () => {
    setSelectedParent(null);
  };

  const option = useMemo<EChartsOption | null>(() => {
    if (viewData.length === 0) {
      return null;
    }

    const pieData = viewData.map((node) => ({
      name: node.name,
      value: convertUnit(node.value, unit),
    }));

    return {
      tooltip: {
        trigger: 'item',
        valueFormatter: (value: unknown) =>
          `${(value as number).toLocaleString('zh-CN', { maximumFractionDigits: 2 })} ${unit}`,
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 0,
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 11 },
        formatter: (name: string) =>
          name.length > 12 ? `${name.slice(0, 12)}…` : name,
      },
      series: [
        {
          type: 'pie',
          radius: ['48%', '74%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 2,
            borderColor: '#fff',
            borderWidth: 1,
          },
          label: { show: false },
          emphasis: {
            scaleSize: 6,
            label: { show: true, fontSize: 13, fontWeight: 'bold' },
          },
          data: pieData.map((item, index) => ({
            ...item,
            itemStyle: { color: PIE_COLORS[index % PIE_COLORS.length] },
          })),
        },
      ],
    };
  }, [viewData, unit]);

  const handleChartClick = (params: unknown) => {
    if (!linked) {
      return;
    }
    const clickedName = (params as { name?: string }).name;
    const parent = data.find((node) => node.name === clickedName);
    if (parent?.children?.length) {
      setSelectedParent(parent);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 12, color: '#666' }}>{viewLabel}</span>
        {linked && selectedParent ? (
          <button
            type="button"
            onClick={handleBack}
            style={{
              fontSize: 12,
              color: '#4B9CD3',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ← 返回上级
          </button>
        ) : null}
      </div>

      <EChartsBase
        option={option}
        height={240}
        empty={viewData.length === 0}
        emptyText="暂无数据"
        events={{ click: handleChartClick }}
      />
    </div>
  );
};

export default DonutChart;
