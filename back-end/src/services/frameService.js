const { query } = require('../config/database');
const { fetchGithubStar, fetchNpmDownloads } = require('./apiFetcher');

/**
 * 更新所有框架的 Star 数和 NPM 下载量
 * @returns {Promise<Array>} 更新后的框架列表
 */
const updateAllFrameData = async () => {
  try {
    // 1. 从数据库读取所有框架的 GitHub 仓库和 NPM 包名
    const { rows: frameworks } = await query(
      'SELECT id, name, github_repo, npm_package FROM frontend_frameworks'
    );

    // 2. 批量爬取并更新数据（用 map + Promise.all 并行处理，提高效率）
    const updatedFrames = await Promise.all(
      frameworks.map(async (frame) => {
        const starCount = await fetchGithubStar(frame.github_repo);
        const npmDownloads = await fetchNpmDownloads(frame.npm_package);

        // 3. 更新数据库
        const { rows: updatedRow } = await query(
          `UPDATE frontend_frameworks 
           SET star_count = $1, npm_downloads = $2, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $3 
           RETURNING name, star_count, npm_downloads`,  // 返回更新后的数据
          [starCount, npmDownloads, frame.id]
        );

        return updatedRow[0];
      })
    );

    console.log('所有框架数据更新成功');
    return updatedFrames;
  } catch (error) {
    console.error('更新框架数据失败:', error.message);
    throw error;
  }
};

/**
 * 从数据库查询所有框架数据（供前端调用）
 * @param {boolean} forceUpdate 是否强制更新（可选，默认 false）
 * @returns {Promise<Array>} 框架数据列表
 */
const getFrameData = async (forceUpdate = false) => {
  try {
    if (forceUpdate) {
      // 强制更新：先爬取最新数据，再返回
      return await updateAllFrameData();
    }

    // 不强制更新：直接从数据库读取（可加「数据过期判断」，如超过12小时自动更新）
    const { rows } = await query(
      'SELECT name, star_count AS star, npm_downloads AS npmDownload FROM frontend_frameworks'
    );
    return rows;
  } catch (error) {
    console.error('查询框架数据失败:', error.message);
    throw error;
  }
};

module.exports = { getFrameData, updateAllFrameData };  