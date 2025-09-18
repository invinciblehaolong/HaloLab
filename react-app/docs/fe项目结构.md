-   [x] 250917

```sh
PS C:\Users\haolong\Desktop\HaloLab\React-halolab\react-app> tree /F
卷 Windows 的文件夹 PATH 列表
卷序列号为 524E-6DE1
C:.
│  .env
│  .gitignore
│  eslint.config.js
│  index.html          # 入口html
│  package-lock.json
│  package.json
│  vite.config.js      # Vite配置
├─docs                 # 项目文档
├─node_modules
├─public
│      vite.svg
│      vitebak.svg
└─src
    │  App.jsx          # 根组件及路由
    │  main.jsx         # 应用入口
    ├─assets            # 静态资源
    │  │  background.png
    │  │  react.svg
    │  └─styles
    │          apple-styles.css
    │          frame.css
    │          genshinF.css
    │          markdown.css
    ├─components         # 可复用组件
    │  │  FrameChart.jsx
    │  │  MarkdownFileList.jsx
    │  ├─GenshinF        # 抽卡分析相关组件
    │  │      FilterPanel.jsx
    │  │      IntervalAnalysis.jsx
    │  │      RecordTable.jsx
    │  │      UrlInput.jsx
    │  └─TODO            # todo相关组件
    │          TodoFilters.jsx
    │          TodoFooter.jsx
    │          TodoHeader.jsx
    │          TodoInput.jsx
    │          TodoItem.jsx
    │          TodoList.jsx
    ├─layout             # 布局组件
    │      Navbar.jsx
    ├─pages              # 页面组件
    │      FrameStats.jsx
    │      GachaAnalysis.jsx
    │      Home-todo.jsx
    │      MarkdownViewerPage.jsx
    │      NewPage.jsx
    └─services            # API服务
            frontendFrameAPI.js
            genshinFService.js
            noteApi.js
            todoApi.js
```

