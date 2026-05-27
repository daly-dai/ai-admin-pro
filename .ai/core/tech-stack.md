# 技术栈规范

> AI必须严格遵循的技术栈定义

## 当前技术栈

```yaml
构建工具: RSBuild ^1.7.0
框架: React ^18.3.0 + TypeScript ^5.5.0
UI库: @dalydb/sdesign + Ant Design ^5.29.3
状态管理: Zustand ^5.0.11 + immer ^11.1.4
路由: React Router ^6.26.0
HTTP: Axios ^1.7.0
Hooks: ahooks ^3.8.0
图表: Chart.js ^4.5.1 + react-chartjs-2 ^5.3.1
图标: lucide-react ^0.577.0 + @ant-design/icons ^5.4.0
工具库: dayjs ^1.11.0, lodash-es ^4.17.0
```

## 核心组件库

- **@dalydb/sdesign**: SSearchTable / SForm / SDetail / SButton / STable / STitle
- **Ant Design**: 辅助组件 + 图标库
- 组件文档 → `.ai/sdesign/`

## 禁用技术

```yaml
状态管理: Redux (使用Zustand替代)
表单处理: Formik (使用SForm替代)
表格组件: react-table (使用SSearchTable替代)
HTTP客户端: ky, fetch (使用Axios封装替代)
路由管理: Next.js路由 (使用React Router替代)
```
