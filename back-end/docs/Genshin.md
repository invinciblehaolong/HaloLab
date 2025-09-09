### 抽卡系统API文档

#### 一、API概览

PORT=3001

以下API均基于Express路由定义，基础路径为路由挂载路径。
    console.log(`- http://localhost:${PORT}/api/gacha/records (GET)`);
    console.log(`- http://localhost:${PORT}/api/gacha/process-url (POST)`);
    console.log(`- http://localhost:${PORT}/api/gacha/intervals (GET)`);
    console.log(`- http://localhost:${PORT}/api/gacha/calculate-intervals (POST)`);


#### 二、详细接口说明

##### 1. 处理抽卡链接并存储记录
- **请求路径**：`/process-url`
- **请求方法**：`POST`
- **功能描述**：解析抽卡链接，获取抽卡记录并存储到数据库
- **请求体参数**：
  | 参数名   | 类型   | 是否必填 | 说明                     |
  |----------|--------|----------|--------------------------|
  | url      | string | 是       | 抽卡链接（包含抽卡记录的源链接） |
  | maxPages | number | 否       | 最大获取页数，默认值为99    |
- **成功响应**（200 OK）：
  ```json
  {
    "success": true,
    "message": "抽卡记录处理完成",
    "data": {
      // 具体处理结果（如存储的记录数量等，由service层返回）
    }
  }
  ```
- **错误响应**：
  - 400 Bad Request（缺少url参数）：
    ```json
    {
      "success": false,
      "message": "请提供抽卡链接"
    }
    ```
  - 500 Internal Server Error（服务器处理错误）：
    
    ```json
    {
      "success": false,
      "message": "错误信息详情"
    }
    ```


##### 2. 获取抽卡记录
- **请求路径**：`/records`
- **请求方法**：`GET`
- **功能描述**：从数据库中查询抽卡记录，支持多条件筛选和分页
- **查询参数**：
  | 参数名      | 类型   | 是否必填 | 说明                     |
  |-------------|--------|----------|--------------------------|
  | uid         | string | 否       | 玩家ID，用于筛选指定玩家的记录 |
  | gacha_type  | number | 否       | 卡池类型（整数），用于筛选指定卡池的记录 |
  | rank_type   | number | 否       | 物品稀有度（整数），用于筛选指定稀有度的记录 |
  | page        | number | 否       | 页码，默认值为1           |
  | limit       | number | 否       | 每页条数，默认值为100      |
- **成功响应**（200 OK）：
  ```json
  {
    "success": true,
    "data": {
      // 抽卡记录列表及分页信息（如total、list等，由service层返回）
    }
  }
  ```
- **错误响应**（500 Internal Server Error）：
  ```json
  {
    "success": false,
    "message": "错误信息详情"
  }
  ```


##### 3. 手动触发五星间隔计算
- **请求路径**：`/calculate-intervals`
- **请求方法**：`POST`
- **功能描述**：手动触发计算五星物品的抽卡间隔（即连续抽卡中两次五星物品之间的抽卡次数）
- **请求参数**：无
- **成功响应**（200 OK）：
  ```json
  {
    "success": true,
    "message": "五星间隔计算完成",
    "data": {
      "updatedCount": 100 // 本次计算更新的间隔记录数量
    }
  }
  ```
- **错误响应**（500 Internal Server Error）：
  ```json
  {
    "success": false,
    "message": "错误信息详情"
  }
  ```


##### 4. 获取五星间隔记录
- **请求路径**：`/intervals`
- **请求方法**：`GET`
- **功能描述**：查询已计算的五星间隔记录，支持多条件筛选和分页
- **查询参数**：
  | 参数名      | 类型   | 是否必填 | 说明                     |
  |-------------|--------|----------|--------------------------|
  | uid         | string | 否       | 玩家ID，用于筛选指定玩家的间隔记录 |
  | gacha_type  | number | 否       | 卡池类型（整数），用于筛选指定卡池的间隔记录 |
  | page        | number | 否       | 页码，默认值为1           |
  | limit       | number | 否       | 每页条数，默认值为50       |
- **成功响应**（200 OK）：
  ```json
  {
    "success": true,
    "data": {
      // 五星间隔记录列表及分页信息（如total、list等，由service层返回）
    }
  }
  ```
- **错误响应**（500 Internal Server Error）：
  
  ```json
  {
    "success": false,
    "message": "错误信息详情"
  }
  ```