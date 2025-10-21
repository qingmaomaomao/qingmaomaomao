import { google } from 'googleapis';
import fs from 'fs';

class YouTubeService {
  constructor(credentials) {
    this.credentials = credentials;
    this.oauth2Client = null;
    this.youtube = null;
  }

  /**
   * 初始化 OAuth2 客户端
   */
  initializeAuth() {
    this.oauth2Client = new google.auth.OAuth2(
      this.credentials.clientId,
      this.credentials.clientSecret,
      'http://localhost' // Redirect URI
    );

    this.oauth2Client.setCredentials({
      refresh_token: this.credentials.refreshToken
    });

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });
  }

  /**
   * 上传视频到 YouTube
   * @param {Object} options - 上传选项
   * @param {string} options.videoPath - 视频文件路径
   * @param {string} options.title - 视频标题
   * @param {string} options.description - 视频描述
   * @param {Array<string>} options.tags - 标签数组
   * @param {string} options.privacyStatus - 隐私状态 (public/private/unlisted)
   * @param {string} options.categoryId - 分类ID (默认 22 - 人物和博客)
   * @returns {Promise<Object>} 上传结果
   */
  async uploadVideo(options) {
    if (!this.youtube) {
      this.initializeAuth();
    }

    const {
      videoPath,
      title,
      description = '',
      tags = [],
      privacyStatus = 'public',
      categoryId = '22'
    } = options;

    try {
      // 验证视频文件是否存在
      if (!fs.existsSync(videoPath)) {
        throw new Error(`视频文件不存在: ${videoPath}`);
      }

      console.log(`开始上传视频: ${title}`);
      console.log(`账号: ${this.credentials.name}`);

      const response = await this.youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: title,
            description: description,
            tags: tags,
            categoryId: categoryId,
            defaultLanguage: 'zh',
            defaultAudioLanguage: 'zh'
          },
          status: {
            privacyStatus: privacyStatus,
            selfDeclaredMadeForKids: false
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });

      const videoId = response.data.id;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      console.log(`✓ 视频上传成功!`);
      console.log(`  账号: ${this.credentials.name}`);
      console.log(`  视频ID: ${videoId}`);
      console.log(`  链接: ${videoUrl}`);

      return {
        success: true,
        platform: 'youtube',
        account: this.credentials.name,
        videoId: videoId,
        url: videoUrl,
        data: response.data
      };

    } catch (error) {
      console.error(`✗ YouTube 上传失败 (${this.credentials.name}):`, error.message);

      return {
        success: false,
        platform: 'youtube',
        account: this.credentials.name,
        error: error.message,
        details: error.errors || error.response?.data
      };
    }
  }

  /**
   * 仅发布文本（作为社区帖子 - 需要 YouTube API 的社区功能权限）
   * 注意: YouTube API 目前对社区帖子的支持有限
   * @param {Object} options - 发布选项
   * @param {string} options.text - 文本内容
   * @returns {Promise<Object>} 发布结果
   */
  async postText(options) {
    console.warn('注意: YouTube API 对社区帖子的支持有限，建议使用视频上传');

    return {
      success: false,
      platform: 'youtube',
      account: this.credentials.name,
      error: 'YouTube 纯文本发布需要通过社区帖子功能，目前 API 支持有限',
      message: '建议上传视频或使用其他平台发布纯文本内容'
    };
  }

  /**
   * 获取频道信息
   * @returns {Promise<Object>} 频道信息
   */
  async getChannelInfo() {
    if (!this.youtube) {
      this.initializeAuth();
    }

    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics'],
        mine: true
      });

      if (response.data.items && response.data.items.length > 0) {
        const channel = response.data.items[0];
        return {
          success: true,
          channelId: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          subscriberCount: channel.statistics.subscriberCount,
          videoCount: channel.statistics.videoCount,
          viewCount: channel.statistics.viewCount
        };
      }

      return {
        success: false,
        error: '未找到频道信息'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 生成 OAuth URL 用于获取授权码
   * @param {string} clientId - 客户端ID
   * @param {string} clientSecret - 客户端密钥
   * @param {string} redirectUri - 重定向URI
   * @returns {string} 授权URL
   */
  static generateAuthUrl(clientId, clientSecret, redirectUri = 'http://localhost') {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    return url;
  }

  /**
   * 使用授权码获取 tokens
   * @param {string} clientId - 客户端ID
   * @param {string} clientSecret - 客户端密钥
   * @param {string} code - 授权码
   * @param {string} redirectUri - 重定向URI
   * @returns {Promise<Object>} tokens 对象
   */
  static async getTokensFromCode(clientId, clientSecret, code, redirectUri = 'http://localhost') {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }
}

export default YouTubeService;
