# CRUD 页面开发指南

> ⚠️ **前置条件**：在使用本指南生成代码之前，你必须已经完成以下步骤：
>
> 1. 阅读 `AGENTS.md` — 确认硬约束和豁免范围
> 2. 确认目标文件路径**不在**豁免目录中 → 必须使用 sdesign 组件
> 3. 阅读 `.ai/guides/api-module.md` — 确保 API 模块已就绪
> 4. 准备查阅 `.ai/sdesign/components/SSearchTable.md` 和 `.ai/sdesign/components/SButton.md`

## 决策点

- **标准列表** -> `SSearchTable`（一体化方案，首选）
- **需要更多控制** -> `STable` + `SForm.Search` + `useSearchTable`

## 文件结构

```
src/api/{module}/types.ts     — 类型定义（Entity, EntityQuery, EntityFormData）
src/api/{module}/index.ts     — API 实现（导出 {module}Api 对象）
src/pages/{module}/index.tsx  — 列表页
src/pages/{module}/create.tsx — 新增页
src/pages/{module}/edit.tsx   — 编辑页
```

## 必选组件

| 用途 | 组件                             | 来源              |
| ---- | -------------------------------- | ----------------- |
| 列表 | `SSearchTable` 或 `STable`       | `@dalydb/sdesign` |
| 搜索 | `SForm.Search`（配合 STable 时） | `@dalydb/sdesign` |
| 表单 | `SForm`（items 配置式）          | `@dalydb/sdesign` |
| 按钮 | `SButton`（actionType 预设）     | `@dalydb/sdesign` |
| 标题 | `STitle`                         | `@dalydb/sdesign` |

## 关键约定

- API 对象命名：`{module}Api`
- 5 个标准方法：`getList` / `getById` / `create` / `update` / `delete`
- SSearchTable 的 `requestFn` 直接传 `{module}Api.getList`
- `paginationFields` 配置分页字段映射
- 操作列使用 `SButton` + `actionType`（如 `edit`、`delete`）

## 完整 API 参考

使用 sdesign 组件时查阅：`.ai/sdesign/components/` 下对应组件文档

## 页面交互模式选择

> ⚠️ **生成列表页时必须先确定交互模式，不可自行假设。** 优先从 spec.md 中获取，spec.md 未指定时按以下规则判断。

### 三种模式

| 模式       | 适用场景                                  | 实现方式                                             |
| ---------- | ----------------------------------------- | ---------------------------------------------------- |
| **Modal**  | 表单字段 ≤ 8 个，无复杂联动，轻量级增删改 | antd Modal + SForm，在列表页内通过状态控制弹窗显隐   |
| **独立页** | 表单字段 > 8 个，含复杂联动/分步/上传     | 独立路由页 `create.tsx` / `edit.tsx`，通过路由跳转   |
| **Drawer** | 详情展示、侧边编辑，不离开列表上下文      | antd Drawer + SForm 或 SDetail，列表页内状态控制抽屉 |

### 判断流程

1. **spec.md 明确指定** → 直接使用指定模式
2. **spec.md 未指定** → 根据表单复杂度自动判断：
   - 表单字段 ≤ 8 且无文件上传/富文本 → **Modal**
   - 表单字段 > 8 或含复杂控件 → **独立页**
   - 仅查看详情（无编辑） → **Drawer**

### Modal 模式参考

当选择 Modal 模式时，参考 `src/components/business/FormModal.tsx` 封装组件。该组件将 antd Modal + SForm 封装为统一的弹窗表单，避免每个列表页重复实现弹窗逻辑。

```tsx
// 列表页中使用 FormModal 的示例
import FormModal from '@/components/business/FormModal';

const [modalOpen, setModalOpen] = useState(false);
const [editingId, setEditingId] = useState<string>();

<FormModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onSuccess={() => {
    setModalOpen(false);
    actionRef.current?.reload();
  }}
  title={editingId ? '编辑' : '新增'}
  formItems={formItems}
  initialValues={editingRecord}
  onSubmit={(values) =>
    editingId ? api.update(editingId, values) : api.create(values)
  }
/>;
```
