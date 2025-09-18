// 引入HTTP请求库
const axios = require('axios');
const querystring = require('querystring');
const url = require('url');

// 翻译数据缓存对象，键为语言代码（如'zh-CN'），值为对应语言的翻译数据，用于避免重复请求
// let translationCache = {};

/**
 * 获取多语言翻译数据（带缓存机制）
 * @param {string} lang - 语言代码，默认'zh-CN'
 * @returns {object} 翻译数据对象
 */
// async function fetchTranslation(lang = 'zh-CN') {
//     // 若缓存中已有该语言数据，直接返回缓存
//     if (translationCache[lang]) return translationCache[lang];
//     try {
//         // 适配语言包文件命名（zh-CN对应zh-cn，其他如en-us保持不变）
//         const langPath = lang === 'zh-CN' ? 'zh-cn' : 'en-us';
//         // 翻译数据的CDN地址
//         const url = `https://webstatic.mihoyo.com/admin/mi18n/hk4e_cn/m20240201hy47qinta8/m20240201hy47qinta8-${langPath}.json`;
//         // 发送请求获取翻译数据
//         const response = await axios.get(url);
//         // 存入缓存
//         translationCache[lang] = response.data;
//         return response.data;
//     } catch (error) {
//         console.warn(`获取${lang}语言包失败，使用默认中文`, error.message);
//         // 失败时降级为中文
//         return fetchTranslation('zh-CN');
//     }
// }

/**
 * 从抽卡链接中提取所有必要参数
 * @param {string} gachaUrl - 游戏内导出的抽卡记录链接
 * @returns {object|null} 提取的参数对象（失败返回null）
 */
async function extractParamsFromUrl(gachaUrl) {
    try {
        const parsedUrl = url.parse(gachaUrl);
        const queryParams = querystring.parse(parsedUrl.query) || {}; // 确保空对象兜底
        
        // 获取翻译数据
        // const translation = await fetchTranslation(queryParams.lang);
        
        // 抽卡池名称相关
        const gachaTypeKey = `gacha_${queryParams.init_type}_title`;
        const gachaTypeMap = {
            '301': '角色祈愿',
            '400': '角色祈愿2',
            '302': '武器祈愿',
            '100': '新手祈愿',
            '200': '常驻祈愿',
            '500': '编年祈愿'
        };
        // const gachaTypeName = translation[gachaTypeKey] || gachaTypeMap[queryParams.init_type] || '未知祈愿';
        const gachaTypeName = gachaTypeMap[queryParams.init_type] || '未知祈愿';
        
        // 星级信息（通过循环简化重复定义）
        const starRanks = ['3', '4', '5'].reduce((acc, rank) => {
            acc[rank] = {
                symbol: `★${rank}`,
                title: `${rank}-Star Items`
            };
            return acc;
        }, {});
        
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
            authkey: queryParams.authkey,
            game_biz: queryParams.game_biz || 'hk4e_cn',
            
            // 抽卡查询参数
            gacha_type: queryParams.init_type || '301',
            page: '1',
            size: '20',
            end_id: '0',
            
            // 额外信息
            gacha_type_name: gachaTypeName,
            gacha_price_range: [`gacha_${queryParams.gacha_type}_price_range`] || '',
            star_ranks: starRanks,
            // gacha_type_tips: translation['gacha_type_tips'] || '',
            // gacha_up_desc: translation['gacha_up_desc'] || ''
        };
        
        // 验证关键参数
        const requiredParams = ['authkey', 'gacha_id', 'region'];
        const missingParams = requiredParams.filter(key => !params[key]);
        if (missingParams.length > 0) {
            console.error(`错误: 抽卡链接中缺少必要参数: ${missingParams.join(', ')}`);
            return null;
        }
        
        return params;
    } catch (error) {
        console.error('解析抽卡链接失败:', error.message);
        return null;
    }
}

/**
 * 获取抽卡记录
 * @param {object} params - 从链接提取的参数对象
 * @returns {Promise<object>} 抽卡记录数据（API返回结果）
 */
async function fetchGachaLogs(params) {
    try {
        // 抽卡记录API的基础URL（米哈游官方接口）
        const apiUrl = 'https://public-operation-hk4e.mihoyo.com/gacha_info/api/getGachaLog';
        
        // 请求头配置（模拟浏览器请求，避免被接口拦截）
        const headers = {
            'authority': 'public-operation-hk4e.mihoyo.com',         // 请求的主机权限
            'accept': 'application/json, text/plain, */*',           // 接受的响应格式
            'accept-encoding': 'gzip, deflate, br, zstd',            // 接受的压缩格式
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',            // 接受的语言
            'origin': 'https://webstatic.mihoyo.com',                // 请求来源页
            'referer': 'https://webstatic.mihoyo.com/',              // 引用页（防盗链）
            'sec-ch-ua': '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"', // 浏览器标识
            'sec-ch-ua-mobile': '?0',                                // 是否移动设备（0-否）
            'sec-ch-ua-platform': '"Windows"',                       // 操作系统
            'sec-fetch-dest': 'empty',                               // 请求目标（空）
            'sec-fetch-mode': 'cors',                                // 请求模式（跨域资源共享）
            'sec-fetch-site': 'same-site',                           // 请求站点（同站）
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0', // 用户代理（模拟Edge浏览器）
            'cache-control': 'max-age=300',                          // 缓存控制（最大缓存300秒）
            'if-modified-since': new Date().toUTCString()            // 条件请求（若资源未修改则返回304）
        };
        
        console.log(`正在获取 [${params.gacha_type_name}] 的第 ${params.page} 页记录...`);
        
        // 发送GET请求获取抽卡记录 ⭐️
        const response = await axios.get(apiUrl, {
            params: params, // 请求参数（从链接提取的params）
            headers: headers, // 请求头
            timeout: 15000, // 超时时间（15秒）
            // 处理可能的SSL证书问题（忽略未认证证书）
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });
        
        // 处理API响应（错误码非0时抛出异常）
        if (response.data.retcode !== 0) {
            // const translation = await fetchTranslation(params.lang);
            // 错误信息的翻译键（如gacha_errcode_10001对应错误码10001的信息）
            const errorKey = `gacha_errcode_${response.data.retcode}`;
            // 错误信息：优先用翻译数据，其次用API返回的message，最后默认未知错误
            const errorMsg = `API错误: ${response.data.message || '未知错误'} (错误码: ${response.data.retcode})`;
            throw new Error(errorMsg);
        }
        return response.data.data; // 返回抽卡记录数据（API响应中的data字段）
    } catch (error) {
        let errorMsg = '获取抽卡记录失败: ';
        if (error.response) {
            // 有响应但状态码非200（如403、404）
            errorMsg += `状态码 ${error.response.status}，响应: ${JSON.stringify(error.response.data || '无数据').substring(0, 100)}`;
        } else if (error.request) {
            // 无响应（网络问题或API地址错误）
            errorMsg += '未收到响应，可能是网络问题或API地址已变更';
        } else {
            // 其他错误（如参数错误）
            errorMsg += error.message;
        }
        throw new Error(errorMsg);
    }
}

/**
 * 格式化并显示抽卡记录（显示所有属性）
 * @param {object} logData - 抽卡记录数据（API返回的data字段）
 * @param {string} gachaTypeName - 抽卡池类型名称（如角色祈愿）
 * @param {object} params - 从链接提取的参数对象（包含星级信息等）
 * @returns {number} 最后一条记录的ID（用于下一页查询）
 */
function displayGachaLogs(logData, gachaTypeName, params) {
    // 若记录为空，提示并返回0
    if (!logData || !logData.list || logData.list.length === 0) {
        console.log('没有找到抽卡记录');
        return 0;
    }

    // 基于记录ID去重（每条记录的id唯一）
    const uniqueRecords = [...new Map(logData.list.map(item => [item.id, item])).values()];
    const actualTotal = uniqueRecords.length; // 去重后的记录数
    console.log(`\n===== ${gachaTypeName} 抽卡记录 (共 ${actualTotal} 条) =====`);
    
    // // 遍历去重后的记录并显示
    // uniqueRecords.forEach((item, index) => {
    //     // 获取当前记录的星级信息（符号+标题）
    //     const rarityInfo = params.star_ranks[item.rank_type];
    //     const rarity = `${rarityInfo.symbol} (${rarityInfo.title})`;
    //     console.log(`\n${index + 1}. [${rarity}] 记录详情：`);

    //     // 获取记录中的所有属性键（包括可能为空的字段）
    //     const allKeys = Object.keys(item);
    //     // 基础属性（优先显示的核心字段）
    //     const baseKeys = ['id', 'time', 'name', 'item_type', 'rank_type', 'count', 'gacha_type', 'uid', 'lang', 'item_id'];
    // // ['id', 'time', 'name', 'item_type', 'rank_type', 'gacha_type', 'uid']
    // // item_id 原神中每个角色 / 武器都有专属的 item_id（例如特定角色的固定编号），用于系统内部识别物品，通常不直接展示给玩家。
        
    //     // 合并基础属性和所有属性，去重后作为显示字段（确保每个键只出现一次）
    //     const combinedKeys = [...baseKeys, ...allKeys];
    //     const displayKeys = [];
    //     const seenKeys = new Set(); // 用于跟踪已添加的键，避免重复
    //     for (const key of combinedKeys) {
    //         if (!seenKeys.has(key)) {
    //             seenKeys.add(key);
    //             displayKeys.push(key);
    //         }
    //     }
        
    //     // 显示每条记录的所有属性
    //     displayKeys.forEach(key => {
    //         let value = item[key];
    //         // 空值统一显示为"空"
    //         if (value === '' || value === undefined || value === null) {
    //             value = '空';
    //         } else if (key === 'is_new') {
    //             // 布尔值"is_new"转换为中文"是/否"
    //             value = value ? '是' : '否';
    //         }
    //         console.log(`   ${key}: ${value}`);
    //     });
    // });

    // 返回去重后最后一条记录的ID（用于下一页查询的end_id）
    return uniqueRecords[uniqueRecords.length - 1].id;
}

/**
 * 主函数：获取并显示num页抽卡记录
 * @param {string} gachaUrl - 抽卡链接
 * @param {number} maxPages - 最大获取页数（默认999）
 */
async function main(gachaUrl, maxPages = 999) {
    console.log('===== 原神抽卡记录获取 =====\n');
    
    // 1. 解析抽卡链接获取参数
    const params = await extractParamsFromUrl(gachaUrl);
    if (!params) {
        console.error('无法继续执行，退出程序');
        return;
    }
    
    console.log(`成功解析抽卡链接: ${params.gacha_type_name}`);
    console.log(`区服: ${params.region} | 游戏版本: ${params.game_version || '未知'}`);
    
    // 2. 循环获取多页记录
    let currentPage = 1; // 当前页码（从1开始）
    let lastEndId = 0; // 上一页最后一条记录的ID（用于分页查询）
    let totalLogs = 0; // 去重后的总记录数
    const allUniqueRecords = new Map(); // 全局去重的记录Map（键为记录id，值为记录对象）
    
    while (currentPage <= maxPages) {
        try {
            // 更新当前页和上一页最后记录ID（用于API查询）
            params.page = currentPage.toString();
            params.end_id = lastEndId.toString();
            
            // 获取当前页的抽卡记录
            const logData = await fetchGachaLogs(params);
            
            // 全局去重（避免跨页重复记录）
            logData.list.forEach(item => {
                if (!allUniqueRecords.has(item.id)) {
                    allUniqueRecords.set(item.id, item);
                }
            });
            totalLogs = allUniqueRecords.size; // 更新总记录数

            // 显示当前页去重后的记录，并获取最后一条记录的ID
            lastEndId = displayGachaLogs(logData, params.gacha_type_name, params);
                        
            // 若当前页记录数少于请求的size，说明已到最后一页
            if (logData.list.length < parseInt(params.size)) {
                console.log(`\n已获取全部抽卡记录，共 ${totalLogs} 条`);
                break;
            }
            
            currentPage++; // 继续获取下一页
            
            // 添加1.5秒延迟，避免触发API频率限制
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
            console.error(`第 ${currentPage} 页获取失败:`, error.message);
            
            // 若为authkey过期，提示用户获取新链接
            if (error.message.includes('authkey已过期')) {
                console.log('\n请按照以下步骤获取新的抽卡链接:');
                console.log('1. 打开原神游戏');
                console.log('2. 进入祈愿界面');
                console.log('3. 点击"历史记录"');
                console.log('4. 点击右上角"导出记录"按钮');
                console.log('5. 复制新生成的链接替换到代码中');
                return;
            }
            
            // 询问用户是否继续尝试
            const readline = require('readline').createInterface({
                input: process.stdin,  // 输入流（键盘）
                output: process.stdout // 输出流（控制台）
            });
            
            readline.question('是否继续尝试获取下一页? (y/n) ', (answer) => {
                readline.close();
                if (answer.toLowerCase() !== 'y') {
                    console.log('已停止获取抽卡记录');
                    process.exit(0); // 用户选择不继续，退出程序
                } else {
                    currentPage++; // 用户选择继续，获取下一页
                }
            });
            
            // 等待用户输入（最多等待10秒）
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    
    // 输出最终结果汇总
    console.log(`\n===== 操作完成 =====`);
    console.log(`成功解析抽卡链接: ${params.gacha_type_name}`);
    console.log(`区服: ${params.region} | 游戏版本: ${params.game_version || '未知'}`);
    console.log(`卡池价格范围: ${params.gacha_price_range || '未知'}`);
    console.log(`卡池说明: ${params.gacha_up_desc || '无'}`);
    console.log(`共获取 ${Math.min(currentPage - 1, maxPages)} 页记录，去重后总计 ${totalLogs} 条`);
}

// 抽卡链接（从游戏中导出的最新链接）
const gachaUrl = 'https://webstatic.mihoyo.com/hk4e/event/e20190909gacha-v3/index.html?win_mode=fullscreen&no_joypad_close=1&authkey_ver=1&sign_type=2&auth_appid=webview_gacha&init_type=200&gacha_id=1d15150b2e8c7375666e13e6e7557162d9f21f1d&timestamp=1753833156&lang=en&device_type=pc&game_version=CNRELWin5.8.0_R36351440_S35665788_D36660778&region=cn_gf01&authkey=Tbc02WnOjcpGfGt%2fRxnsrcCK3ZpAs7C1VHK7uFdHf9U9QOoqA74CPsguvsJhQ01mb%2f29izH5kkQxObPmD9CzXX4pysPocz456YiCMbyiN4nmDsngQUR1t%2bIhimuchFaN60M0SYjBP0GvvC8rEShXubw10KaBCRIWzFjx1qrIcsoRJirWhV3X0%2fT31S7CMNnlYhL1CsGyGQ%2fKImfxKpoXLgMJMV450BbUtngdFmgNeCMpJU0O2sG08gbvgk%2fBfl%2fnXzhhvwR1nbVXv%2bmEcfN0%2boYr3XCgL%2b8crlqyafEQBevAL5eiY8%2fig7TqjHoK2S4fdsAoglwrdsnLGQumZfobvsBcwuTouYlyjWEGEAQ4wTrrgUveLfBCDqdkNjNPWjzBNtWQ1Z2ceKUR9gk3asnWyhLmBS8KLdkN8sgXx0xm2iOBX1wsRxNFfy%2bFVklU0oR6pBRclBegqxf%2bGtXUo%2fm%2f8pSFVjcZZ1awYNLx6XUjR0jCLi4AMb4ga1qKV7kyC7H3tm%2fziPKkQD7N53LGRClXgeb%2f0IYZd1TIdnu1mq7cvom7fA9v%2fnBM%2bbRNyabsJBHyo0flIrJocbRWDdYBhq1TES0tkTUm0t2K9q5dR3VwGnW8I7PebgOjeTVJ5kOYU3DL5BDkYFR0PxhctK3oH6VII07CMpwoz9m7i40W9q4ycIdX6G%2bPBTixQaTt%2bU5P3qpkU3wjAcxpcJcHPb9twe7nyBMJtwNsOFg0xYwPNC1C5mrqSxY5BcQ6os8dGD7znmNyfXA70qTs0eWp1GIy6HuoHZvI2%2bG3W5fDg85QX3228p5C94B9Fzm3oYUub3GVT4vxF0ucIW7sinX4azpAK3VHoHNo%2fk0Foh62ESAHAriTPmnYTtgJI95fc5J2ebDzxL5BBX7Bbe4ZLY6xUjDgKeuPs6%2f1xxj2Dxo0fODd%2btMSQfWN8zjc24oE0meqcUdQSw10sPxT0KlXMcaGcIkoqR50PrZ7GsWL6udCmRg4jF3n2LOC7YPb1Q27ilOSzqD60mudEiWA5qk5HV9RKl52G18WhRNKpHSqn6BVCHbOeTTOATvZGrvooceqwV7A8u1buwXLmI87Xq%2b5ahx8CN0ypQaAFRyKWLiGvaJeTgtiUwPk%2bQJweKVJ7n7oYPcI2%2f2TlCsfLDJlxZ0H1Gjuior5Ddnk2sbaO9G64AFiFyOCzewyIZCsN9vnjjL4QuLVDFO0hrseBbb1S2uo0UFaE7Ynaler1SrYNdtbeEVM1%2b50a8lf9y0GrS3gGkESs%2fONIz9anMADSH%2f5QJfiai6zdBjdQTuL8dwKZLlHG4JOPhlI5I7hNAS61y1kLCYVHktLuIz4IZNkbN09Dd2FplyCAinqCKuj%2bw%3d%3d&game_biz=hk4e_cn#/log';

// 调用主函数，最多获取1页记录
main(gachaUrl, 40);