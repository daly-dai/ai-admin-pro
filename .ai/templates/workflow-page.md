# Prompt: 生成工作流/审批页面

## 使用方式

提供工作流配置，AI 会生成审批流程页面。

## 模板

```markdown
请根据以下需求，生成工作流/审批页面代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + Ant Design 5 + ahooks + Zustand

## 页面信息

页面名称: [PAGE_NAME]
页面路由: [PAGE_ROUTE]
工作流类型: [approval | audit | review]

## 接口定义

### 接口列表

1. 获取审批列表
   - 方法: GET
   - 路径: [LIST_PATH]
   - 参数: page, pageSize, status, keyword
   - 响应: PageData<ApprovalItem>

2. 获取审批详情
   - 方法: GET
   - 路径: [DETAIL_PATH]/:id
   - 参数: id
   - 响应: ApprovalDetail

3. 提交审批
   - 方法: POST
   - 路径: [SUBMIT_PATH]
   - 参数: data
   - 响应: ApprovalResult

4. 通过审批
   - 方法: POST
   - 路径: [APPROVE_PATH]/:id
   - 参数: id, comment
   - 响应: ApprovalResult

5. 拒绝审批
   - 方法: POST
   - 路径: [REJECT_PATH]/:id
   - 参数: id, comment
   - 响应: ApprovalResult

### 类型定义

ApprovalItem {
id: string
title: string
type: string
status: 'pending' | 'approved' | 'rejected'
applicant: string
applyTime: string
currentNode: string
}

ApprovalDetail {
id: string
title: string
type: string
status: 'pending' | 'approved' | 'rejected'
applicant: {
id: string
name: string
department: string
}
applyTime: string
formData: Record<string, any>
processHistory: ProcessNode[]
}

ProcessNode {
id: string
nodeName: string
approver: string
status: 'pending' | 'approved' | 'rejected'
comment?: string
operateTime?: string
}

## 页面功能

### 列表页功能

1. 审批列表展示
2. 状态筛选（待审批、已通过、已拒绝）
3. 搜索功能
4. 分页
5. 查看详情

### 详情页功能

1. 审批基本信息展示
2. 表单数据展示
3. 审批流程时间线
4. 审批操作（通过、拒绝）
5. 审批意见输入

## 生成要求

1. 创建文件:
   - `pages/[page-name]/index.tsx` - 列表页
   - `pages/[page-name]/detail.tsx` - 详情页
   - `pages/[page-name]/components/ApprovalTimeline.tsx` - 审批时间线组件

2. 代码规范:
   - 使用 TypeScript 严格模式
   - 使用路径别名导入
   - 使用 ahooks 的 useRequest
   - 使用 Ant Design 的 Timeline、Steps 等组件
   - 类型定义完整，不使用 any
```

## 示例

```markdown
请根据以下需求，生成工作流/审批页面代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + Ant Design 5 + ahooks + Zustand
-路径引用: 使用相对路径 (src/)

## 页面信息

页面名称: 请假审批
页面路由: /approvals/leave
工作流类型: approval

## 接口定义

### 接口列表

1. 获取请假审批列表
   - 方法: GET
   - 路径: /api/approvals/leave
   - 参数: page, pageSize, status, keyword
   - 响应: PageData<LeaveApprovalItem>

2. 获取审批详情
   - 方法: GET
   - 路径: /api/approvals/leave/:id
   - 参数: id
   - 响应: LeaveApprovalDetail

3. 提交请假申请
   - 方法: POST
   - 路径: /api/approvals/leave
   - 参数: LeaveFormData
   - 响应: LeaveApprovalDetail

4. 通过审批
   - 方法: POST
   - 路径: /api/approvals/leave/:id/approve
   - 参数: id, comment
   - 响应: ApprovalResult

5. 拒绝审批
   - 方法: POST
   - 路径: /api/approvals/leave/:id/reject
   - 参数: id, comment
   - 响应: ApprovalResult

### 类型定义

LeaveApprovalItem {
id: string
title: string
type: 'leave'
status: 'pending' | 'approved' | 'rejected'
applicant: string
applyTime: string
currentNode: string
leaveType: string
startDate: string
endDate: string
days: number
}

LeaveApprovalDetail {
id: string
title: string
type: 'leave'
status: 'pending' | 'approved' | 'rejected'
applicant: {
id: string
name: string
department: string
}
applyTime: string
leaveType: string
startDate: string
endDate: string
days: number
reason: string
processHistory: ProcessNode[]
}

LeaveFormData {
leaveType: string
startDate: string
endDate: string
reason: string
}

ProcessNode {
id: string
nodeName: string
approver: string
status: 'pending' | 'approved' | 'rejected'
comment?: string
operateTime?: string
}

## 页面功能

### 列表页功能

1. 请假审批列表展示
2. 状态筛选（待审批、已通过、已拒绝）
3. 搜索功能（按申请人搜索）
4. 分页
5. 查看详情
6. 新增请假申请

### 详情页功能

1. 请假基本信息展示
2. 请假表单数据展示（请假类型、起止日期、天数、原因）
3. 审批流程时间线
4. 审批操作（通过、拒绝）
5. 审批意见输入
```
