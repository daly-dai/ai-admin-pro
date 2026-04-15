# 阶段④：接口对接

> 页面已存在，真实接口地址到位。将占位 URL 替换为真实接口，删除 TODO 注释。

## 步骤

1. **读已有代码**：`src/api/{module}/types.ts` + `index.ts`
2. **解析接口文档**：用户提供的 swagger/接口文档
3. **读错题集**：Read `.ai/pitfalls/index.md` 匹配页面类型
4. **对比差异**：生成变更清单（新增/删除字段、类型变更、URL 替换），告知用户
5. **更新 API 层**：types.ts 替换临时类型 + index.ts 替换占位 URL，删除 `// TODO`
6. **读 sdesign 文档**：修改页面前 读取 对应组件文档
7. **按需更新页面**：检查是否需要同步修改（新增搜索字段、列定义变更等），需确认
8. **验证**：按 `conventions/verification.md` 执行 Level 1 + Level 2，报错先查 `pitfalls/verify-errors.md`

## 约束

- 先对比再改，不是重新生成
- 保留用户手动添加的自定义逻辑
- 新增字段是否加到页面中，需向用户确认

## 输出锁

🔒 仅允许修改 `src/api/{module}/` 下已有文件和用户确认的页面文件，禁止创建新模块。
