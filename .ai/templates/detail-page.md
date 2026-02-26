# Prompt: 生成详情页 (基于 @dalydb/sdesign)

## 使用方式

提供详情页接口定义，AI 会生成基于 @dalydb/sdesign 的完整详情页面。

##模板

```markdown
请根据以下需求，生成基于 @dalydb/sdesign 的详情页面代码。

## 项目信息

-技术栈: RSBuild + React 18 + TypeScript + @dalydb/sdesign + Ant Design 5
- 详情组件: 使用 @dalydb/sdesign 的 SDetail组件
-引用: 使用相对路径 (src/)



## 页面信息

页面名称: [PAGE_NAME]
页面路由: [PAGE_ROUTE]/:id
页面描述: [PAGE_DESCRIPTION]

##接口定义

### 接口列表

1. 获取详情
   - 方法: GET
   -路径: [DETAIL_PATH]/:id
   - 参数: id (URL参数)
   -响应: DetailType

2. 删除（如需要）
   - 方法: DELETE
   -路: [: [DELETE_PATH]/:id
   - 参数: id (URL参数)

3.其他操作（如需要）
   - ...

### 类型定义

[数据类型定义]

## 页面布局

-布局方式: [card | tabs | steps]
- 是否需要编辑按钮: [true | false]
- 是否需要删除按钮: [true | false]
- 是否需要返回列表按钮: [true | false]

##展示内容

[描述需要展示哪些字段，如何分组展示]

## 生成要求

1. 创建文件:
   - `pages/[page-name]/detail.tsx` 或 `pages/[page-name]/[id]/index.tsx` (使用 SDetail)

2. 代码规范:
   - 使用 TypeScript 严格模式
   - 使用相对路径导入 (src/)
   - 使用 @dalydb/sdesign 的 SDetail组件
   - 使用 JSON配置模式实现分组展示
   - 类型定义完整，不使用 any
```

## 示例

```markdown
请根据以下需求，生成基于 @dalydb/sdesign 的详情页面代码。

## 项目信息

-技术栈: RSBuild + React 18 + TypeScript + @dalydb/sdesign + Ant Design 5
- 详情组件: 使用 @dalydb/sdesign 的 SDetail组件
-引用: 使用相对路径 (src/)

## 页面信息

页面名称:订单详情
页面路由: /orders/:id
页面描述:展示订单的详细信息

##接口定义

### 接口列表

1. 获取订单详情
   - 方法: GET
   -路: /api/orders/:id
   - 参数: id (URL参数)
   - 响应: OrderDetail

2. 删除订单
   - 方法: DELETE
   -路径: /api/orders/:id
   - 参数: id (URL参数)

### 类型定义

OrderDetail {
id: string
orderNo: string
status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
totalAmount: number
payAmount: number
discountAmount: number
user: {
id: string
name: string
phone: string
}
address: {
name: string
phone: string
province: string
city: string
district: string
detail: string
}
items: OrderItem[]
createTime: string
payTime?: string
shipTime?: string
completeTime?: string
}

OrderItem {
id: string
productId: string
productName: string
productImage: string
price: number
quantity: number
subtotal: number
}

## 页面布局

- 布局方式: card + tabs
- 是否需要编辑按钮: true
- 是否需要删除按钮: true
- 是否需要返回列表按钮: true

##展示内容

1.基本信息：订单号、状态、创建时间
2. 金额信息：订单总额、实付金额、优惠金额
3. 用户信息：姓名、手机号
4.收货地址：完整地址
5. 商品列表：商品名称、图片、价格、数量、小计
6. 时间线：创建、支付、发货、完成时间
```

## AI输出示例

AI会生成以下文件：

1. `pages/orders/[id]/index.tsx` -订单详情页面 (使用 SDetail)
2. `pages/orders/components/OrderDetailContent.tsx` - 详情内容组件 (使用 SDetail)

所有代码都基于 @dalydb/sdesign组件库，使用配置式开发模式，可以直接使用。