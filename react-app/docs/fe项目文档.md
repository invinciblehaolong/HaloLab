# 专业工程化的项目文档规范

## 专业文档的核心要素

1. **结构化与一致性**：采用统一的目录结构和描述格式，确保信息层级清晰
2. **准确性与时效性**：文档需与代码实现保持一致，跟随代码变更同步更新
3. **简洁性与实用性**：只保留必要信息，突出关键内容，便于快速查阅
4. **可维护性**：采用模块化组织，支持部分更新而不影响整体结构
5. **工程化特性**：包含版本控制、变更记录、依赖说明等工程化要素

## 前端项目文档整理

### 1. 项目概述

#### 1.1 基本信息
- 项目名称：react-app
- 技术栈：==React 19 + Vite 7 + React Router 7 + Axios==
- 主要功能：任务管理(TODO)、Markdown文件查看、框架数据统计、抽卡分析
- 构建工具：Vite
- 样式解决方案：CSS Modules(约定式)

#### 1.2 环境配置
```bash
# 开发环境
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

#### 1.3 环境变量
- 核心变量：`VITE_API_BASE_URL` - 后端API基础地址

### 2. 项目结构

```sh
react-app/
├── .env                  # 环境变量配置
├── index.html            # 入口HTML
├── package.json          # 项目依赖配置
├── vite.config.js        # Vite配置
├── src/
│   ├── main.jsx          # 应用入口
│   ├── App.jsx           # 根组件及路由配置
│   ├── assets/           # 静态资源
│   │   ├── styles/       # 全局样式
│   │   └── images/       # 图片资源
│   ├── components/       # 可复用组件
│   │   ├── GenshinF/     # 抽卡分析相关组件
│   │   └── TODO/         # 任务管理相关组件
│   ├── layout/           # 布局组件
│   ├── pages/            # 页面组件
│   └── services/         # API服务
└── docs/                 # 项目文档
```

### 3. 核心组件说明

#### 3.1 公共组件
- `MarkdownFileList`：Markdown文件管理组件
  - 功能：本地文件上传、远程文件加载、文件内容预览
  - 状态：文件列表、当前激活文件、加载状态
  - 核心方法：`handleFileUpload`、`fetchRemoteNotes`、`viewFile`

#### 3.2 TODO组件系列
- `TodoHeader`：任务清单标题组件
- `TodoInput`：任务输入组件
- `TodoItem`：单个任务项组件
- `TodoList`：任务列表组件
  - 功能：任务筛选、空状态展示、加载状态管理
  - 属性：`filter`(筛选条件)、`todos`(任务列表)、`onTaskUpdated`(更新回调)
- `TodoFooter`：任务统计与操作组件

#### 3.3 数据可视化组件
- `FrameChart`：框架数据统计图表组件
  - 功能：展示框架数据统计结果
  - 属性：`data`(图表数据源)

### 4. 页面路由配置

| 路由路径                      | 对应组件             | 功能描述             |
| ----------------------------- | -------------------- | -------------------- |
| `/`                           | `Home-todo`          | 任务管理首页         |
| `/new-page`                   | `NewPage`            | 新页面               |
| `/frame-stats`                | `FrameStats`         | 框架数据统计页面     |
| `/markdown-viewer`            | `MarkdownViewerPage` | Markdown文件查看器   |
| `/markdown-viewer/fullscreen` | `MarkdownViewerPage` | Markdown全屏查看模式 |
| `/genshinT-gacha`             | `GachaAnalysis`      | 抽卡分析页面         |

### 5. API服务接口

#### 5.1 框架数据接口 (`frontendFrameAPI.js`)
```javascript
// 获取框架数据
fetchFrameData(forceUpdate: boolean): Promise<Object>
// 参数：forceUpdate - 是否强制从GitHub更新数据
// 返回：框架统计数据对象
```

#### 5.2 笔记接口 (`noteApi.js`)
```javascript
// 获取所有Markdown文件列表
getAllNotes(): Promise<Array>

// 获取单个Markdown文件内容
getNoteContent(filePath: string): Promise<object>
// 参数：filePath - 文件路径
// 返回：包含文件内容的对象
```

#### 5.3 任务接口 (`todoApi.js`)
```javascript
// 获取所有任务
getAll(): Promise<Array>

// 其他隐含接口（根据调用推测）
// 添加任务
add(todo: Object): Promise<Object>

// 更新任务状态
update(id: string, data: Object): Promise<Object>

// 删除任务
delete(id: string): Promise<void>

// 清除已完成任务
clearCompleted(): Promise<void>
```

### 6. 关键依赖说明

| 依赖             | 版本    | 用途          |
| ---------------- | ------- | ------------- |
| react            | ^19.1.1 | 核心React库   |
| react-dom        | ^19.1.1 | React DOM渲染 |
| react-router-dom | ^7.8.2  | 路由管理      |
| axios            | ^1.11.0 | HTTP请求      |
| antd             | ^5.27.3 | UI组件库      |
| react-markdown   | ^10.1.0 | Markdown渲染  |
| recharts         | ^3.1.2  | 数据可视化    |
| vite             | ^7.1.2  | 构建工具      |

### 7. 开发规范

1. **组件命名**：PascalCase（如`TodoItem.jsx`）
2. **样式文件**：与组件同名或按功能模块组织
3. **API服务**：按业务域划分服务文件（如`noteApi.js`）
4. **状态管理**：组件内状态使用`useState`，跨组件状态通过props传递
5. **路由管理**：集中在`App.jsx`配置，使用React Router v7

---

文档遵循工程化规范，突出核心信息，便于团队成员快速理解项目结构和开发规范，支持后续维护与扩展。

