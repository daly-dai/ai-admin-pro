# 模式 A：api-gen（接口生成）

> 用户提供了 swagger / 接口文档 / YAML，只需要生成前端接口定义。

**步骤**：

1. **读模板**：Read `.ai/templates/api-module.md`
2. **解析接口文档**：从用户提供的文档中提取实体字段、方法、URL、参数
3. **生成代码**：
   - `src/api/{module}/types.ts` — 实体类型、查询参数、表单数据
   - `src/api/{module}/index.ts` — API 对象（{module}Api），真实 URL 和方法
4. **验证**：`pnpm verify`，最多 3 轮修复

**约束**：

- 只生成 API 层，不生成页面（除非用户明确要求）
- 字段类型从接口文档映射，不猜测
- API 对象命名：`{module}Api`，方法命名规则 → `api-conventions.md`「方法命名规则」表（方法名必须添加 HTTP 方法后缀）

> 🔒 **输出锁**：本模式仅允许创建/修改 `src/api/{module}/types.ts` 和 `src/api/{module}/index.ts`，禁止创建其他文件。
