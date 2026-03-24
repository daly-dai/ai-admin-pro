# 详情页面开发指南

> ⚠️ **前置条件**：在使用本指南生成代码之前，你必须已经完成以下步骤：
>
> 1. 阅读 `AGENTS.md` — 确认硬约束和豁免范围
> 2. 确认目标文件路径**不在**豁免目录中 → 必须使用 `SDetail` 而非 antd `Descriptions`
> 3. 准备查阅 `.ai/sdesign/components/SDetail.md` 和 `.ai/sdesign/components/SButton.md`

## 核心组件

- **SDetail**：配置式详情展示，通过 `items` 数组定义字段
- **SDetail.Group**：分组详情

## SDetailItem 类型

| type 值         | 用途                                    |
| --------------- | --------------------------------------- |
| `'text'`        | 默认文本展示                            |
| `'dict'`        | 字典映射（配合 `dictKey` 或 `dictMap`） |
| `'file'`        | 文件列表展示                            |
| `'img'`         | 图片展示                                |
| `'rangeTime'`   | 时间范围                                |
| `'checkbox'`    | 复选展示                                |
| `'empty'`       | 占位空格                                |
| `'placeholder'` | 占位符                                  |

## SDetailItem 关键配置

| 属性      | 说明                                          |
| --------- | --------------------------------------------- |
| `label`   | 字段标签                                      |
| `name`    | 字段名（对应 dataSource 的 key）              |
| `type`    | 展示类型（见上表）                            |
| `dictKey` | 字典 key（需配合 SConfigProvider）            |
| `dictMap` | 直接提供字典 `{ value: label }`               |
| `render`  | 自定义渲染函数 `(value, record) => ReactNode` |

## 决策点

- **基础详情**：`<SDetail title="xxx" dataSource={data} items={items} column={2} />`
- **分组详情**：`<SDetail.Group groupItems={[{ groupTitle, items }]} />`
- **操作按钮**：使用 `SButton.Group` + `actionType`（如 `edit`、`delete`、`back`）
- **数据加载**：调用 `{module}Api.getById` 获取详情

## 布局

- `column` 属性控制每行列数（常用 2 / 3）

## 完整 API 参考

使用 SDetail 时查阅：`.ai/sdesign/components/SDetail.md`

## 交互模式

详情展示不一定是独立页面。当需要在列表页快速预览详情时，优先使用 Drawer 模式承载。

### Drawer 嵌套详情

当详情以 Drawer 形式呈现时，应创建 `{Entity}DetailDrawer` 容器组件，将 Drawer 的 open/close 状态封装在容器组件内部管理，不由列表页控制。列表页通过 ref 调用 `open(id)` 方法触发抽屉。

> 详见 `crud-page.md`「弹层封装原则」章节。
