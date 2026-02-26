#技术栈规范

> 项目使用的技术栈定义，AI必须严格遵循

## 当前技术栈

```yaml
构建工具: RSBuild ^1.7.0
框架: React ^18.3.0 + TypeScript ^5.5.0
UI库: @dalydb/sdesign + Ant Design ^5.20.0
状态管理: Zustand ^5.0.11 + immer ^10.1.0
路由: React Router ^6.26.0
HTTP: Axios ^1.7.0
Hooks: ahooks ^3.8.0
图表: Chart.js ^4.4.0 + react-chartjs-2 ^5.2.0
图标: lucide-react ^0.400.0 + @ant-design/icons ^5.4.0
工具库: dayjs ^1.11.0, lodash-es ^4.17.0
```

##核心组件库

### @dalydb/sdesign (主要组件库)
- **SSearchTable**:搜索表格一体化组件
- **SForm**:配置式表单组件  
- **SDetail**: 分组详情展示组件
- **SButton**:按钮组件

### Ant Design (辅助组件库)
-基础UI组件补充
- 图标库支持
-样式系统

## 项目依赖关系

```
@dalydb/sdesign (核心) 
    ↓ 依赖
Ant Design (基础)
    ↓ 依赖  
React生态系统
```

##版本兼容性要求

-所有组件必须与 React 18兼容
- TypeScript 严格模式必须启用
- 不允许使用已废弃的API
-必支持现代浏览器（Chrome 80+, Firefox 75+, Safari 14+）

##禁用技术

以下技术禁止在项目中使用：

```yaml
状态管理: Redux (使用Zustand替代)
表单处理: Formik (使用SForm替代)  
表格组件: react-table (使用SSearchTable替代)
HTTP客户端: ky, fetch (使用Axios封装替代)
路由管理: Next.js路由 (使用React Router替代)
```

##性能要求

- Bundle size:单个页面不超过 500KB
-首屏加载时间: 不超过 2秒
- 交互响应时间: 不超过 100ms
-内使用:持使用不超过 100MB

## 开发环境要求

- Node.js: >= 18.0.0
- pnpm: >= 8.0.0
- IDE: VS Code with recommended extensions
- Browser: Chrome DevTools for debugging

## 更新策略

技术栈更新遵循以下原则：

1. **主版本更新**:需要充分测试和团队评审
2. **次版本更新**:可以自动更新，但需要回归测试
3. **补丁更新**:可以安全自动更新
4. **依赖移除**:需要评估影响和替代方案