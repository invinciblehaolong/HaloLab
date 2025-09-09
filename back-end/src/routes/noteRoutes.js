const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// 本地 Markdown 文件存放目录（建议通过环境变量配置）
const NOTE_DIR = process.env.NOTE_DIR || 'C:\\Users\\haolong\\Documents\\Notes';

/**
 * 获取所有 Markdown 文件列表
 * GET /api/notes
 */
router.get('/', async (req, res) => {
  try {
    // 读取目录下所有文件
    const files = await fs.readdir(NOTE_DIR);
    // 筛选 .md 文件并获取详细信息
    const noteFiles = [];
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(NOTE_DIR, file);
        const stats = await fs.stat(filePath); // 获取文件信息
        noteFiles.push({
          id: Date.now() + Math.random().toString(36).substr(2, 9), // 简单生成唯一ID
          filename: file, // 文件名（不含路径）
          path: filePath, // 完整路径（用于后端识别）
          updatedAt: stats.mtime.toLocaleString() // 最后修改时间
        });
      }
    }
    res.json({ data: noteFiles });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({ error: '无法获取笔记列表' });
  }
});

/**
 * 获取单个 Markdown 文件内容
 * GET /api/notes/content
 */
router.get('/content', async (req, res) => {
  // 新增：解码URL编码的文件路径
  let { filePath } = req.query;
  if (!filePath) {
    return res.status(400).json({ error: '文件路径不能为空' });
  }

  try {
    // 解码URL编码的路径
    filePath = decodeURIComponent(filePath);
    
    // 验证文件格式
    if (!filePath.endsWith('.md')) {
      return res.status(400).json({ error: '仅支持访问.md文件' });
    }

    // 安全处理：规范化文件路径（处理相对路径如../）
    const normalizedPath = path.normalize(filePath);
    const resolvedPath = path.resolve(normalizedPath);
    
    // 验证路径是否在允许的目录内
    const normalizedNoteDir = path.normalize(NOTE_DIR);
    const desktopDir = path.normalize('C:\\Users\\haolong\\Desktop');
    if (!resolvedPath.startsWith(normalizedNoteDir) && !resolvedPath.startsWith(desktopDir)) {
        return res.status(403).json({ 
            error: '无权访问该文件',
            message: `文件必须位于允许的目录内: ${NOTE_DIR} 或 ${desktopDir}`
        });
    }

    // 读取文件内容
    const content = await fs.readFile(resolvedPath, 'utf8');
    res.json({ content });
  } catch (error) {
    console.error('读取文件失败:', error);
    if (error.code === 'EACCES') {
      res.status(403).json({ error: '服务器无权限访问该文件' });
    } else if (error.code === 'ENOENT') {
      res.status(404).json({ error: '文件不存在' });
    } else {
      res.status(500).json({ error: '无法读取笔记内容' });
    }
  }
});

module.exports = router;