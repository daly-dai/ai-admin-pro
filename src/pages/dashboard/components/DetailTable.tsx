// eslint-disable-next-line no-restricted-imports
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';

import type { TableRow, Unit } from 'src/pages/dashboard/store';
import {
  formatNumber,
  formatPercent,
  formatSigned,
  formatSignedPercent,
} from 'src/pages/dashboard/utils';

interface DetailTableProps {
  rows: TableRow[];
  unit: Unit;
  tableType:
    | 'eva'
    | 'selfEva'
    | 'clientEva'
    | 'netIncome'
    | 'bookNonInterest'
    | 'oci';
}

const DELTA_STYLE: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };

/** 差值着色单元格 */
const DeltaCell: React.FC<{
  value: number;
  unit?: Unit;
  isPercent?: boolean;
}> = ({ value, unit, isPercent }) => {
  const text = isPercent
    ? formatSignedPercent(value)
    : formatSigned(value, unit ?? '亿元');
  return (
    <span
      style={{
        ...DELTA_STYLE,
        color: value >= 0 ? '#F5222D' : '#52C41A',
      }}
    >
      {text}
    </span>
  );
};

const DetailTable: React.FC<DetailTableProps> = ({ rows, unit, tableType }) => {
  const hasInterest =
    tableType === 'eva' ||
    tableType === 'selfEva' ||
    tableType === 'clientEva' ||
    tableType === 'netIncome';
  const hasBudget = tableType !== 'bookNonInterest' && tableType !== 'oci';
  const hasL3 = tableType === 'bookNonInterest';

  // 总计行
  const total = useMemo(() => {
    return rows.reduce(
      (accum, row) => ({
        actual: accum.actual + row.actual,
        netInterest: accum.netInterest + (row.netInterest ?? 0),
        nonInterest: accum.nonInterest + (row.nonInterest ?? 0),
        budget: accum.budget + (row.budget ?? 0),
        vsYesterday: accum.vsYesterday + row.vsYesterday,
        vsLastMonth: accum.vsLastMonth + row.vsLastMonth,
        vsLastYear: accum.vsLastYear + row.vsLastYear,
      }),
      {
        actual: 0,
        netInterest: 0,
        nonInterest: 0,
        budget: 0,
        vsYesterday: 0,
        vsLastMonth: 0,
        vsLastYear: 0,
      },
    );
  }, [rows]);

  const columns = useMemo<ColumnsType<TableRow>>(() => {
    const baseColumns: ColumnsType<TableRow> = [
      {
        title: '指标一级分类',
        dataIndex: 'l1',
        key: 'l1',
        width: 140,
        ellipsis: true,
      },
      {
        title: '指标二级分类',
        dataIndex: 'l2',
        key: 'l2',
        width: 140,
        ellipsis: true,
      },
    ];

    if (hasL3) {
      baseColumns.push({
        title: '指标三级分类',
        dataIndex: 'l3',
        key: 'l3',
        width: 140,
        ellipsis: true,
        render: (value: string | undefined) => value ?? '-',
      });
    }

    if (hasInterest) {
      baseColumns.push(
        {
          title: '净息',
          dataIndex: 'netInterest',
          key: 'netInterest',
          width: 100,
          align: 'right',
          render: (value: number) => formatNumber(value, unit),
        },
        {
          title: '非息',
          dataIndex: 'nonInterest',
          key: 'nonInterest',
          width: 100,
          align: 'right',
          render: (value: number) => formatNumber(value, unit),
        },
      );
    }

    baseColumns.push({
      title: '实际值',
      dataIndex: 'actual',
      key: 'actual',
      width: 110,
      align: 'right',
      render: (value: number) => (
        <span style={{ fontWeight: 500, ...DELTA_STYLE }}>
          {formatNumber(value, unit)}
        </span>
      ),
    });

    if (hasBudget) {
      baseColumns.push(
        {
          title: '预算目标',
          dataIndex: 'budget',
          key: 'budget',
          width: 110,
          align: 'right',
          render: (value: number) => formatNumber(value, unit),
        },
        {
          title: '完成率',
          dataIndex: 'completionRate',
          key: 'completionRate',
          width: 90,
          align: 'right',
          render: (value: number) => formatPercent(value),
        },
      );
    }

    baseColumns.push(
      {
        title: '比上日',
        dataIndex: 'vsYesterday',
        key: 'vsYesterday',
        width: 100,
        align: 'right',
        render: (value: number) => <DeltaCell value={value} unit={unit} />,
      },
      {
        title: '比上月',
        dataIndex: 'vsLastMonth',
        key: 'vsLastMonth',
        width: 100,
        align: 'right',
        render: (value: number) => <DeltaCell value={value} unit={unit} />,
      },
      {
        title: '比上年',
        dataIndex: 'vsLastYear',
        key: 'vsLastYear',
        width: 100,
        align: 'right',
        render: (value: number) => <DeltaCell value={value} unit={unit} />,
      },
      {
        title: '环比增幅',
        dataIndex: 'momGrowth',
        key: 'momGrowth',
        width: 90,
        align: 'right',
        render: (value: number) => <DeltaCell value={value} isPercent />,
      },
      {
        title: '同比增幅',
        dataIndex: 'yoyGrowth',
        key: 'yoyGrowth',
        width: 90,
        align: 'right',
        render: (value: number) => <DeltaCell value={value} isPercent />,
      },
    );

    return baseColumns;
  }, [hasBudget, hasInterest, hasL3, unit]);

  // 总计行数据
  const totalRow: TableRow = {
    l1: '总计',
    l2: '',
    l3: hasL3 ? '' : undefined,
    netInterest: hasInterest ? total.netInterest : undefined,
    nonInterest: hasInterest ? total.nonInterest : undefined,
    actual: total.actual,
    budget: hasBudget ? total.budget : undefined,
    completionRate:
      hasBudget && total.budget > 0 ? total.actual / total.budget : undefined,
    vsYesterday: total.vsYesterday,
    vsLastMonth: total.vsLastMonth,
    vsLastYear: total.vsLastYear,
    momGrowth: 0,
    yoyGrowth: 0,
  };

  return (
    <Table
      columns={columns}
      dataSource={rows}
      rowKey={(record, index) => `${record.l1}-${record.l2}-${index}`}
      size="small"
      bordered
      pagination={false}
      // eslint-disable-next-line id-length -- antd Table scroll.x 是 API 约定的属性名
      scroll={{ x: 'max-content' }}
      summary={() => (
        <Table.Summary.Row style={{ fontWeight: 600, background: '#fafafa' }}>
          {columns.map((column, index) => {
            const key = (column as { key?: string }).key;
            // 合并分类列
            if (index === 0) {
              return (
                <Table.Summary.Cell key={key} index={index}>
                  总计
                </Table.Summary.Cell>
              );
            }
            if (index === 1) {
              return <Table.Summary.Cell key={key} index={index} />;
            }
            // l3 空
            if (key === 'l3') {
              return <Table.Summary.Cell key={key} index={index} />;
            }
            // 净息
            if (key === 'netInterest') {
              return (
                <Table.Summary.Cell key={key} index={index} align="right">
                  <span style={DELTA_STYLE}>
                    {formatNumber(total.netInterest, unit)}
                  </span>
                </Table.Summary.Cell>
              );
            }
            // 非息
            if (key === 'nonInterest') {
              return (
                <Table.Summary.Cell key={key} index={index} align="right">
                  <span style={DELTA_STYLE}>
                    {formatNumber(total.nonInterest, unit)}
                  </span>
                </Table.Summary.Cell>
              );
            }
            // 实际值
            if (key === 'actual') {
              return (
                <Table.Summary.Cell key={key} index={index} align="right">
                  <span style={DELTA_STYLE}>
                    {formatNumber(total.actual, unit)}
                  </span>
                </Table.Summary.Cell>
              );
            }
            // 预算
            if (key === 'budget') {
              return (
                <Table.Summary.Cell key={key} index={index} align="right">
                  <span style={DELTA_STYLE}>
                    {formatNumber(total.budget, unit)}
                  </span>
                </Table.Summary.Cell>
              );
            }
            // 完成率
            if (key === 'completionRate') {
              return (
                <Table.Summary.Cell key={key} index={index} align="right">
                  <span style={DELTA_STYLE}>
                    {totalRow.completionRate !== undefined
                      ? formatPercent(totalRow.completionRate)
                      : '-'}
                  </span>
                </Table.Summary.Cell>
              );
            }
            // 比上日/比上月/比上年
            if (key === 'vsYesterday') {
              return (
                <Table.Summary.Cell key={key} index={index} align="right">
                  <DeltaCell value={total.vsYesterday} unit={unit} />
                </Table.Summary.Cell>
              );
            }
            if (key === 'vsLastMonth') {
              return (
                <Table.Summary.Cell key={key} index={index} align="right">
                  <DeltaCell value={total.vsLastMonth} unit={unit} />
                </Table.Summary.Cell>
              );
            }
            if (key === 'vsLastYear') {
              return (
                <Table.Summary.Cell key={key} index={index} align="right">
                  <DeltaCell value={total.vsLastYear} unit={unit} />
                </Table.Summary.Cell>
              );
            }
            // 环比/同比增幅不汇总
            if (key === 'momGrowth' || key === 'yoyGrowth') {
              return (
                <Table.Summary.Cell key={key} index={index} align="right">
                  -
                </Table.Summary.Cell>
              );
            }
            return <Table.Summary.Cell key={key} index={index} />;
          })}
        </Table.Summary.Row>
      )}
    />
  );
};

export default DetailTable;
