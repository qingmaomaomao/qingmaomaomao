import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import MultiPlatformPoster from './multi-platform-poster.js';
import ConfigManager from './config/config-manager.js';
import YouTubeService from './services/youtube-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 配置文件上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB 限制
  }
});

// 初始化实例
const poster = new MultiPlatformPoster();
const configManager = new ConfigManager();

// ============ API 路由 ============

// 获取账号状态
app.get('/api/status', async (req, res) => {
  try {
    const status = await poster.getAccountsStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取所有账号
app.get('/api/accounts', async (req, res) => {
  try {
    const accounts = await configManager.listAllAccounts();
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 添加 YouTube 账号
app.post('/api/accounts/youtube', async (req, res) => {
  try {
    const { name, clientId, clientSecret, refreshToken } = req.body;

    if (!name || !clientId || !clientSecret || !refreshToken) {
      return res.status(400).json({
        success: false,
        error: '缺少必需字段'
      });
    }

    await configManager.addYouTubeAccount({
      name,
      clientId,
      clientSecret,
      refreshToken
    });

    res.json({ success: true, message: 'YouTube 账号添加成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 添加 Twitter 账号
app.post('/api/accounts/twitter', async (req, res) => {
  try {
    const { name, appKey, appSecret, accessToken, accessSecret } = req.body;

    if (!name || !appKey || !appSecret || !accessToken || !accessSecret) {
      return res.status(400).json({
        success: false,
        error: '缺少必需字段'
      });
    }

    await configManager.addTwitterAccount({
      name,
      appKey,
      appSecret,
      accessToken,
      accessSecret
    });

    res.json({ success: true, message: 'Twitter 账号添加成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除账号
app.delete('/api/accounts/:platform/:id', async (req, res) => {
  try {
    const { platform, id } = req.params;
    await configManager.removeAccount(platform, id);
    res.json({ success: true, message: '账号删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 切换账号状态
app.patch('/api/accounts/:platform/:id', async (req, res) => {
  try {
    const { platform, id } = req.params;
    const { enabled } = req.body;
    await configManager.toggleAccount(platform, id, enabled);
    res.json({ success: true, message: '账号状态更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 测试账号连接
app.post('/api/test', async (req, res) => {
  try {
    const { platform } = req.body;
    const results = await poster.testAccounts(platform || 'all');
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 发布内容
app.post('/api/post', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'images', maxCount: 4 }
]), async (req, res) => {
  try {
    const {
      text,
      platforms,
      ytTitle,
      ytDesc,
      ytTags,
      ytPrivacy
    } = req.body;

    const videoFile = req.files?.video?.[0];
    const imageFiles = req.files?.images || [];

    const postOptions = {
      text: text || '',
      videoPath: videoFile?.path,
      imagePaths: imageFiles.map(f => f.path),
      platforms: platforms ? platforms.split(',') : ['youtube', 'twitter'],
      youtube: {
        title: ytTitle,
        description: ytDesc,
        tags: ytTags ? ytTags.split(',').map(t => t.trim()) : [],
        privacyStatus: ytPrivacy || 'public'
      }
    };

    const results = await poster.post(postOptions);

    // 清理上传的文件
    if (videoFile) {
      await fs.unlink(videoFile.path).catch(() => {});
    }
    for (const file of imageFiles) {
      await fs.unlink(file.path).catch(() => {});
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('发布失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// YouTube OAuth URL 生成
app.post('/api/youtube/auth-url', (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        success: false,
        error: '缺少 Client ID 或 Client Secret'
      });
    }

    const url = YouTubeService.generateAuthUrl(clientId, clientSecret);
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// YouTube Token 获取
app.post('/api/youtube/token', async (req, res) => {
  try {
    const { clientId, clientSecret, code } = req.body;

    if (!clientId || !clientSecret || !code) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数'
      });
    }

    const tokens = await YouTubeService.getTokensFromCode(
      clientId,
      clientSecret,
      code
    );

    res.json({
      success: true,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 根路径
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  多平台发帖工具 Web 界面`);
  console.log(`========================================`);
  console.log(`  服务器运行在: http://localhost:${PORT}`);
  console.log(`  按 Ctrl+C 停止服务器`);
  console.log(`========================================\n`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});
