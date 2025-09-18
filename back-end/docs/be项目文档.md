# TOC

[toc]

## 登录页面接口

| 项目       | 说明                                                         |
| ---------- | ------------------------------------------------------------ |
| 请求 URL   | `/api/auth/login`                                            |
| 请求方法   | POST                                                         |
| 请求体     | `{ "username": "admin", "password": "123456" }` 或 `{ "username": "user_halo", "password": "123456" }` |
| 成功响应   | `{ "success": true, "message": "登录成功", "data": { "username": "admin", "role": "admin" } }`（状态码 200） |
| 失败响应 1 | `{ "success": false, "message": "请输入用户名和密码" }`（状态码 400） |
| 失败响应 2 | `{ "success": false, "message": "用户不存在" }`（状态码 401） |
| 失败响应 3 | `{ "success": false, "message": "密码错误" }`（状态码 401）  |

# 专业工程化项目文档规范与后端项目文档整理


## 一、专业工程化文档的核心标准

专业的项目文档需满足以下原则，以实现「可维护性、可扩展性、可读性」：

1. **结构标准化**  
   采用固定目录结构（如项目概述、环境配置、架构设计、接口文档、开发指南），便于团队成员快速定位信息。

2. **内容精准化**  
   接口参数、项目结构、依赖关系等信息需与代码保持一致，避免模糊描述（如明确标注参数类型、必填项、响应格式）。

3. **简洁实用化**  
   剔除冗余信息，聚焦核心内容（如接口文档只保留「路径、方法、参数、响应示例」，无需重复代码实现细节）。

4. **可追溯性**  
   文档版本与代码版本关联（如通过Git标签同步），修改记录可追踪，确保文档时效性。

5. **工具化生成**  
   优先通过工具自动生成核心内容（如接口文档可通过Swagger自动生成），减少手动维护成本。


## 二、后端项目文档整理✅

### 1. 项目概述✅

- **项目名称**：后端API服务  
- **技术栈**：==Node.js + Express + PostgreSQL==  
- **核心功能**：提供TODO管理、本地Markdown笔记访问、前端框架数据统计、抽卡记录分析等接口服务。  
- **环境依赖**：Node.js 18+、PostgreSQL 12+  


### 2. 环境配置

#### 2.1 环境变量配置
- 配置文件：`.env.development`（开发环境）、`.env.production`（生产环境）  
- 核心配置项（参考`src/config/index.js`）：

| 配置项        | 说明                 | 默认值                    |
| ------------- | -------------------- | ------------------------- |
| `NODE_ENV`    | 环境标识             | `development`             |
| `PORT`        | 服务端口             | `3001`                    |
| `NOTE_DIR`    | Markdown笔记存储目录 | 用户`Documents/Notes`目录 |
| `PG_HOST`     | PostgreSQL主机地址   | `localhost`               |
| `PG_PORT`     | PostgreSQL端口       | `5432`                    |
| `PG_USER`     | PostgreSQL用户名     | `postgres`                |
| `PG_PASSWORD` | PostgreSQL密码       | `123456`                  |
| `PG_DATABASE` | 数据库名称           | `todo_db`                 |

#### 2.2 启动步骤
1. 安装依赖：`npm install`  
2. 启动开发环境（热重载）：`npx nodemon src/main.js`  
3. 服务地址：`http://localhost:3001`  


### 3. 项目结构

```sh
back-end/
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── package.json           # 依赖配置
├── src/
│   ├── config/            # 配置模块
│   │   └── index.js       # 统一配置出口（整合环境变量与默认值）
│   ├── controllers/       # 控制器（处理请求逻辑）
│   │   ├── todoController.js    # TODO业务逻辑
│   │   └── fiveStarController.js # 抽卡五星间隔逻辑
│   ├── models/            # 数据模型（数据库交互）
│   │   └── todoModel.js   # TODO表操作
│   ├── routes/            # 路由定义
│   │   ├── todoRoutes.js  # TODO接口路由
│   │   ├── noteRoutes.js  # 笔记接口路由
│   │   └── frameRoutes.js # 框架数据接口路由
│   ├── services/          # 业务服务（复杂逻辑封装）
│   │   └── frameService.js # 框架数据统计服务
│   └── main.js            # 入口文件（启动服务、挂载中间件）
└── tests/                 # 测试脚本
    └── todo_server.js     # TODO服务测试
```


### 4. 接口文档

#### 4.1 TODO管理接口（`/api/todos`）

| 方法   | 路径   | 功能         | 请求参数                                                   | 响应示例                                             |
| ------ | ------ | ------------ | ---------------------------------------------------------- | ---------------------------------------------------- |
| GET    | `/`    | 获取所有TODO | -                                                          | `[{ "id": 1, "title": "学习", "completed": false }]` |
| GET    | `/:id` | 获取单个TODO | `id`（路径参数，数字）                                     | `{ "id": 1, "title": "学习", "completed": false }`   |
| POST   | `/`    | 创建TODO     | `{ "title": "新任务", "completed": false }`（JSON）        | `{ "id": 3, "title": "新任务", "completed": false }` |
| PUT    | `/:id` | 更新TODO     | `id`（路径参数）+ `{ "title": "更新", "completed": true }` | `{ "id": 1, "title": "更新", "completed": true }`    |
| DELETE | `/:id` | 删除TODO     | `id`（路径参数）                                           | `{ "message": "Todo deleted successfully" }`         |


#### 4.2 笔记管理接口（`/api/notes`）

| 方法 | 路径       | 功能                 | 请求参数                            | 响应示例                                                     |
| ---- | ---------- | -------------------- | ----------------------------------- | ------------------------------------------------------------ |
| GET  | `/`        | 获取所有Markdown文件 | -                                   | `[{ "id": "xxx", "filename": "笔记.md", "path": "...", "updatedAt": "2023-10-01" }]` |
| GET  | `/content` | 获取单个笔记内容     | `filePath`（查询参数，URL编码路径） | `{ "content": "# 笔记内容..." }`                             |


#### 4.3 框架数据接口（`/api/frameworks`）

| 方法 | 路径 | 功能             | 请求参数                                | 响应示例                                                     |
| ---- | ---- | ---------------- | --------------------------------------- | ------------------------------------------------------------ |
| GET  | `/`  | 获取框架统计数据 | `forceUpdate`（可选，布尔值，强制更新） | `{ "frameworks": [{ "name": "React", "star": "200k", "npmDownload": "10M" }] }` |


#### 4.4 抽卡记录接口（`/api/gacha`）

| 方法 | 路径                   | 功能             | 请求参数                    | 响应示例                                                     |
| ---- | ---------------------- | ---------------- | --------------------------- | ------------------------------------------------------------ |
| POST | `/process-url`         | 处理抽卡链接     | `{ "url": "抽卡记录链接" }` | `{ "success": true, "message": "处理成功" }`                 |
| GET  | `/records`             | 获取抽卡记录     | -                           | `{ "records": [{ "id": 1, "time": "...", "item": "五星角色" }] }` |
| POST | `/calculate-intervals` | 计算五星间隔     | -                           | `{ "intervals": [90, 80] }`                                  |
| GET  | `/intervals`           | 获取五星间隔记录 | -                           | `{ "intervals": [90, 80] }`                                  |


### 5. 核心组件说明

#### 5.1 配置模块（`src/config/index.js`）
- 功能：整合环境变量与默认配置，统一导出应用配置（如数据库连接信息、服务端口）。
- 特点：根据`NODE_ENV`自动加载对应环境的`.env`文件，优先级：环境变量 > 默认值。

#### 5.2 数据库交互（`src/models/`）
- 以`todoModel.js`为例，封装PostgreSQL数据库操作（CRUD），并自动初始化表结构。
- 核心方法：`getAll()`、`getById()`、`create()`、`update()`、`delete()`。

#### 5.3 路由与控制器
- 路由（`src/routes/`）：定义接口路径与HTTP方法，映射到对应控制器。
- 控制器（`src/controllers/`）：处理请求参数校验、调用模型/服务、返回响应，隔离业务逻辑与路由定义。


### 6. 开发规范

1. **接口命名**：使用小写字母+短横线，如`/api/todos`，符合RESTful风格。
2. **错误处理**：统一通过`next(error)`传递错误，由全局中间件处理（参考`main.js`错误中间件）。
3. **数据库操作**：所有数据库交互需封装在`models`层，避免在控制器中直接写SQL。
4. **环境变量**：敏感信息（如数据库密码）必须通过`.env`文件配置，禁止硬编码。


通过以上文档，团队成员可快速了解项目架构、接口用法及开发规范，同时保持与代码的一致性和可维护性。

