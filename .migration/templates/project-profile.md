# 项目档案

> 每个 Vue 项目填写一次，后续所有分析会话都先读取本文件。
> 填写完成后保存到 `output/project-profile.md`。

---

## 技术栈

| 项目          | 值                                                            |
| ------------- | ------------------------------------------------------------- |
| Vue 版本      | <!-- 例: Vue 3.x + <script setup> -->                         |
| UI 库         | <!-- 例: Element Plus 2.x / Ant Design Vue 4.x / Vant 4.x --> |
| 状态管理      | <!-- 例: Pinia / Vuex 4.x -->                                 |
| 路由          | <!-- 例: Vue Router 4.x -->                                   |
| HTTP 请求封装 | <!-- 例: Axios，封装在 src/utils/request.ts -->               |
| CSS 方案      | <!-- 例: SCSS / Tailwind CSS / UnoCSS / CSS Modules -->       |
| 构建工具      | <!-- 例: Vite 5.x / Webpack 5.x -->                           |

---

## 第三方库说明

> 列出项目中使用的**非基础设施**第三方库，尤其是 AI 可能不认识的库。
> 可通过 `package.json` 的 dependencies 辅助填写。

| 库名                               | 用途                    | 使用场景                  |
| ---------------------------------- | ----------------------- | ------------------------- |
| <!-- 例: vue-json-excel -->        | <!-- 前端导出 Excel --> | <!-- 列表页导出按钮 -->   |
| <!-- 例: wangeditor -->            | <!-- 富文本编辑器 -->   | <!-- 表单页富文本字段 --> |
| <!-- 例: vue-draggable-plus -->    | <!-- 拖拽排序 -->       | <!-- 列表页行拖拽 -->     |
| <!-- 例: echarts / vue-echarts --> | <!-- 图表库 -->         | <!-- 数据看板 -->         |
|                                    |                         |                           |
|                                    |                         |                           |

---

## 项目约定

### API 封装模式

<!-- 描述 API 的组织方式，例如：
- src/api/ 下按模块分文件，每个模块导出增删改查函数
- 统一使用 src/utils/request.ts 封装的 axios 实例
- 请求/响应拦截器处理 token 和错误提示
-->

### 字典数据获取方式

<!-- 描述下拉框选项等字典数据怎么获取，例如：
- 统一通过 useDictStore / useDictHook 获取
- 调用 GET /api/dict/{dictType} 接口
- 全局 store 预加载
-->

### 权限控制方式

<!-- 描述按钮/菜单权限怎么控制，例如：
- 使用 v-permission="['order:add']" 自定义指令
- 使用 v-if="hasPermission('order:add')" 方法判断
- 权限数据来源于 useUserStore 的 permissions
-->

### 全局组件注册

<!-- 描述哪些组件是全局注册的，例如：
- src/components/global/ 下的组件自动全局注册
- 使用 app.component() 手动注册的组件列表
-->

---

## 特殊模式说明

> 列出项目中**非标准**的封装模式，这些是 AI 最容易误判的地方。

<!-- 示例：
- 所有弹窗表单使用 useFormModal 自定义 hook 封装，调用方式为 const { open, close } = useFormModal(FormComponent)
- 列表页刷新统一用 eventBus.emit('refresh:orderList')，不是 props/emit 传递
- 表格操作列的权限控制使用 v-auth 而非 v-permission
- 路由 meta 中的 activeMenu 字段用于控制侧边栏高亮
- 所有文件上传统一使用 useUpload hook，返回 { fileList, beforeUpload, customRequest }
-->
