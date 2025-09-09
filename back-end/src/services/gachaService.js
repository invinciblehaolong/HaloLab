const axios = require('axios');
const querystring = require('querystring');
const url = require('url');
const gachaModel = require('../models/gachaModel');


/**
 * 从抽卡链接中提取所有必要参数
 */
async function extractParamsFromUrl(gachaUrl) {
  try {
    const parsedUrl = url.parse(gachaUrl);
    const queryParams = querystring.parse(parsedUrl.query) || {};
    
    // 抽卡池名称相关
    const gachaTypeMap = {
      '301': '角色祈愿&角色祈愿2',
      '302': '武器祈愿',
      '100': '新手祈愿',
      '200': '常驻祈愿',
      '500': '编年祈愿'
    };
    const gachaTypeName = gachaTypeMap[queryParams.init_type] || '未知祈愿';
    
    // 星级信息（使用默认中文）
    const starRanks = ['3', '4', '5'].reduce((acc, rank) => {
      acc[rank] = {
        symbol: `★${rank}`,
        title: `${rank}-Star Items`
      };
      return acc;
    }, {});
    console.log(`queryParams.init_type:${queryParams.init_type}`)
    
    // 整理参数
    const params = {
      // 基础参数
      win_mode: queryParams.win_mode || 'fullscreen',
      no_joypad_close: queryParams.no_joypad_close || '1',
      authkey_ver: queryParams.authkey_ver || '1',
      sign_type: queryParams.sign_type || '2',
      auth_appid: queryParams.auth_appid || 'webview_gacha',
      init_type: queryParams.init_type || '301',
      gacha_id: queryParams.gacha_id,
      timestamp: queryParams.timestamp || Date.now().toString(),
      lang: queryParams.lang || 'zh-CN',
      device_type: queryParams.device_type || 'pc',
      game_version: queryParams.game_version,
      region: queryParams.region || 'cn_gf01',
      authkey: queryParams.authkey ? decodeURIComponent(queryParams.authkey) : null,
      game_biz: queryParams.game_biz || 'hk4e_cn',
      
      // 抽卡查询参数
      gacha_type: queryParams.init_type || '301',
      page: '1',
      size: '20',
      end_id: '0',
      
      // 额外信息
      gacha_type_name: gachaTypeName,
      gacha_price_range: `gacha_${queryParams.gacha_type}_price_range` || '',
      star_ranks: starRanks,
      gacha_type_tips: 'gacha_type_tips' || '',
      gacha_up_desc: 'gacha_up_desc' || ''
    };
    
    // 验证关键参数
    const requiredParams = ['authkey', 'gacha_id', 'region'];
    const missingParams = requiredParams.filter(key => !params[key]);
    if (missingParams.length > 0) {
      throw new Error(`抽卡链接中缺少必要参数: ${missingParams.join(', ')}`);
    }
    
    return params;
  } catch (error) {
    console.error('解析抽卡链接失败:', error.message);
    throw error;
  }
}

/**
 * 获取抽卡记录
 */
async function fetchGachaLogs(params) {
  try {
    const apiUrl = 'https://public-operation-hk4e.mihoyo.com/gacha_info/api/getGachaLog';
    
    const headers = {
      'authority': 'public-operation-hk4e.mihoyo.com',
      'accept': 'application/json, text/plain, */*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'origin': 'https://webstatic.mihoyo.com',
      'referer': 'https://webstatic.mihoyo.com/',
      'sec-ch-ua': '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
      'cache-control': 'max-age=300',
      'if-modified-since': new Date().toUTCString()
    };
    
    console.log(`正在获取 [${params.gacha_type_name}] 的第 ${params.page} 页记录...`);
    
    const response = await axios.get(apiUrl, {
      params: params,
      headers: headers,
      timeout: 15000,
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false,
      }),
      proxy: false,       // 原来是代理的问题。。。250908
    });
    
    if (response.data.retcode !== 0) {
      const errorMsg = `API错误: ${response.data.message || '未知错误'} (错误码: ${response.data.retcode})`;
      throw new Error(errorMsg);
    }
    return response.data.data;
  } catch (error) {
    let errorMsg = '获取抽卡记录失败: ';
    if (error.code) errorMsg += `错误码: ${error.code}, `;
    if (error.message) errorMsg += `消息: ${error.message}, `;
    if (error.stack) errorMsg += `堆栈: ${error.stack.substring(0, 200)}`;
    throw new Error(errorMsg);
    if (error.response) {
      errorMsg += `状态码 ${error.response.status}，响应: ${JSON.stringify(error.response.data || '无数据').substring(0, 100)}`;
    } else if (error.request) {
      errorMsg += '未收到响应，可能是网络问题或API地址已变更';
    }
  }
}

/**
 * 处理并存储抽卡记录
 */
async function processAndStoreGachaRecords(gachaUrl, maxPages = 999) {
  try {
    // 解析抽卡链接获取参数
    const params = await extractParamsFromUrl(gachaUrl);
    if (!params) {
      throw new Error('无法解析抽卡链接参数');
    }
    
    let currentPage = 1;
    let lastEndId = 0;
    const allUniqueRecords = new Map();
    
    while (currentPage <= maxPages) {
      try {
        params.page = currentPage.toString();
        params.end_id = lastEndId.toString();
        
        const logData = await fetchGachaLogs(params);
        
        // 去重并收集记录
        logData.list.forEach(item => {
          if (!allUniqueRecords.has(item.id)) {
            allUniqueRecords.set(item.id, item);
          }
        });
        
        // 更新最后一条记录ID
        if (logData.list.length > 0) {
          lastEndId = logData.list[logData.list.length - 1].id;
        }
        
        // 若当前页记录数少于请求的size，说明已到最后一页
        if (logData.list.length < parseInt(params.size)) {
          console.log(`已获取全部抽卡记录，共 ${allUniqueRecords.size} 条`);
          break;
        }
        
        currentPage++;
        
        // 添加延迟避免频率限制
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`第 ${currentPage} 页获取失败:`, error.message);
        
        // 处理authkey过期
        if (error.message.includes('authkey已过期')) {
          throw new Error('authkey已过期，请获取新的抽卡链接');
        }
        
        throw error;
      }
    }
    
    // 转换为需要的字段格式
    const recordsToStore = Array.from(allUniqueRecords.values()).map(record => ({
      id: record.id,
      time: record.time,
      name: record.name,
      item_type: record.item_type,
      rank_type: parseInt(record.rank_type),
      gacha_type: parseInt(record.gacha_type),
      uid: record.uid
    }));
    
    // 批量存储到数据库
    const result = await gachaModel.bulkInsertGachaRecords(recordsToStore);
    // 新增：自动计算五星间隔
    // if (result) {
    //     await require('./fiveStarService').calculateIntervals();
    // }
    
    return {
      success: result,
      totalRecords: recordsToStore.length,
      storedRecords: result ? recordsToStore.length : 0,
      gachaType: params.gacha_type_name,
      uid: recordsToStore.length > 0 ? recordsToStore[0].uid : null
    };
  } catch (error) {
    console.error('处理抽卡记录失败:', error.message);
    throw error;
  }
}

module.exports = {
  processAndStoreGachaRecords,
  getGachaRecords: gachaModel.getGachaRecords
};