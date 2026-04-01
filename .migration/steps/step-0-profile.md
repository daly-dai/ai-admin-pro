# 步骤 0：项目档案填写

> 每个 Vue 项目只需执行一次。填写项目级技术信息，为后续分析提供上下文。

---

## 前置条件

- 无（首次执行的起点）

## 必读文件

- `templates/project-profile.md`（项目档案模板）

---

## 执行指令

### 1. 读取模板

读取 `.migration/templates/project-profile.md`，了解需要填写的各个板块。

### 2. 自动扫描辅助信息

通过以下命令辅助收集项目信息，减轻用户填写负担：

```bash
# 扫描 package.json 获取依赖列表
Read: package.json → dependencies + devDependencies

# 扫描项目结构
Glob: src/**/*.vue    # 了解 Vue 文件分布
Glob: src/api/**/*    # 了解 API 文件组织
Glob: src/stores/**/* # 了解 Store 文件组织
Glob: src/utils/**/*  # 了解工具函数
Glob: src/composables/**/* # 了解自定义 Hook
Glob: src/components/**/*  # 了解组件组织

# 识别 UI 库
Grep: 'element-plus\|ant-design-vue\|vant' → package.json
```

### 3. 引导用户填写

将扫描结果作为预填信息，逐板块与用户确认：

**板块一：技术栈**

- 根据 package.json 自动识别 Vue 版本、UI 库、状态管理等
- 向用户确认 HTTP 请求封装文件的路径
- 向用户确认 CSS 方案

**板块二：第三方库说明**

- 从 package.json 中筛选出非基础设施的依赖
- 向用户逐个确认各库的用途和使用场景
- 重点关注 AI 可能不认识的库

**板块三：项目约定**

- 向用户询问 API 封装模式
- 向用户询问字典数据获取方式
- 向用户询问权限控制方式
- 扫描全局组件注册代码

**板块四：特殊模式说明**

- 向用户询问是否有自定义指令、自定义 Hook 的非标准封装
- 特别关注 AI 容易误判的封装模式

### 4. 生成产出

将确认后的信息按模板格式写入产出文件。

---

## 产出文件

```
output/project-profile.md
```

## 完成标准

- [ ] 技术栈板块：Vue 版本、UI 库、HTTP 封装路径三项必填
- [ ] 第三方库板块：至少列出 3 个非基础设施依赖
- [ ] 项目约定板块：API 封装模式、权限控制方式已描述
- [ ] 特殊模式板块：用户已确认是否有非标准封装需要说明
- [ ] 产出文件已保存到 `output/project-profile.md`

---

## 下一步

→ `steps/step-1-classify.md`（目录扫描与场景分类）
