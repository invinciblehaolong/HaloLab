-   [x] 250917

```sh
PS C:\Users\haolong\Desktop\HaloLab\React-halolab\back-end> tree /F
卷 Windows 的文件夹 PATH 列表
卷序列号为 524E-6DE1
C:.
│  .env.development  # 环境变量
│  .env.example
│  .env.production
│  .gitignore        # git上传忽略文件
│  package-lock.json
│  package.json      # 依赖配置
├─docs
├─node_modules       # 依赖
├─src
│  │ main.js         # 入口文件
│  ├─config
│  │      database.js
│  │      index.js    # 统一配置出口
│  ├─controllers      # 控制器「处理请求」
│  │      fiveStarController.js
│  │      gachaController.js
│  │      todoController.js
│  ├─middleware
│  ├─models           # 模型「数据库交互」
│  │      fiveStarIntervalModel.js
│  │      gachaModel.js
│  │      todoModel.js
│  ├─routes           # 路由「路由分发，将Url请求映射到控制器」
│  │      frameRoutes.js
│  │      gachaRoutes.js
│  │      noteRoutes.js
│  │      todoRoutes.js
│  ├─services          # 封装业务服务「为控制器提供业务支持」
│  │      apiFetcher.js
│  │      fiveStarService.js
│  │      frameService.js
│  │      gachaService.js
│  ├─types
│  └─utils
└─tests
        frame_app.js     # 与todo_server组成main.js
        genshinGacha.js  # 成功获取抽卡记录到terminal
        stats-query.js   # 获取框架数据 「需更新时」
        todo_server.js
```

