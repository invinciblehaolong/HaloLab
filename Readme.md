# HaloLab 项目总览

> ⚠️ **重点说明（中文注释）**：本项目由 React 前端与 Node.js/Express 后端组成，默认后端会读取 `config/app` 中配置的笔记目录，请务必根据实际环境调整 `.env.*` 或系统环境变量。

## 项目结构

```
HaloLab/
├─ back-end/        # Express + PostgreSQL 服务（包含抽卡、待办、笔记 API）
├─ react-app/       # React 前端（Vite 构建，集成 Ant Design 等组件）
└─ README.md        # 项目说明文档（当前文件）
```

## 运行前的准备

1. 安装 Node.js (建议 18.x 及以上) 与 pnpm/npm。
2. 若需要使用数据库相关功能，请准备 PostgreSQL 数据库，并在环境变量或 `.env.<env>` 文件中配置以下字段：
   - `PG_HOST`
   - `PG_PORT`
   - `PG_USER`
   - `PG_PASSWORD`
   - `PG_DATABASE`
3. **笔记目录配置（重点）**：
   - 通过 `NOTE_DIR` 环境变量指定要扫描的 Markdown 根目录。
   - `back-end/src/config/index.js` 会自动将 `NOTE_DIR` 以及桌面目录加入白名单。
   - 在 Linux 或 macOS 环境中务必覆盖默认值，避免引用 Windows 专用路径。

## 后端服务（back-end）

```bash
cd back-end
npm install
node src/main.js
```

- 默认端口：`3001`（可通过 `PORT` 环境变量覆盖）。
- 主要 API：
  - `GET /api/frameworks`：获取前端框架统计数据
  - `GET /api/notes`：列出指定目录下的 Markdown 文件
  - `GET /api/notes/content?filePath=<path>`：读取指定 Markdown 内容（已限制白名单目录）
  - `GET /api/todos`：获取 TODO 列表
  - `POST /api/gacha/process-url`：处理原神抽卡链接

## 前端应用（react-app）

```bash
cd react-app
npm install
npm run dev
```

- 默认开发地址：`http://localhost:5173`
- Vite 相关配置位于 `vite.config.js`。

## 开发建议

- **代码风格**：前端使用 ESLint（`npm run lint`），后端暂未配置，可根据需要新增。
- **环境划分**：通过 `NODE_ENV` 切换 `.env.development`、`.env.production` 等环境变量文件。
- **安全提示**：请勿在仓库中提交真实的数据库密码或外部 API 密钥。

## 许可

当前仓库未声明具体 License，如需开源请补充许可证说明。