import ConfigManager from './config/config-manager.js';
import YouTubeService from './services/youtube-service.js';
import TwitterService from './services/twitter-service.js';

class MultiPlatformPoster {
  constructor() {
    this.configManager = new ConfigManager();
  }

  /**
   * 发布内容到所有平台
   * @param {Object} options - 发布选项
   * @param {string} options.text - 文本内容
   * @param {string} options.videoPath - 视频文件路径（可选）
   * @param {Array<string>} options.imagePaths - 图片文件路径数组（可选，仅 Twitter）
   * @param {Array<string>} options.platforms - 要发布的平台 ['youtube', 'twitter']
   * @param {Object} options.youtube - YouTube 特定选项
   * @param {string} options.youtube.title - 视频标题
   * @param {string} options.youtube.description - 视频描述
   * @param {Array<string>} options.youtube.tags - 标签
   * @param {string} options.youtube.privacyStatus - 隐私状态
   * @returns {Promise<Object>} 发布结果
   */
  async post(options) {
    const {
      text,
      videoPath,
      imagePaths,
      platforms = ['youtube', 'twitter'],
      youtube = {}
    } = options;

    console.log('\n========================================');
    console.log('开始多平台发布');
    console.log('========================================\n');

    const results = {
      youtube: [],
      twitter: [],
      summary: {
        total: 0,
        success: 0,
        failed: 0
      }
    };

    const tasks = [];

    // YouTube 发布任务
    if (platforms.includes('youtube') && videoPath) {
      const youtubeAccounts = await this.configManager.getEnabledYouTubeAccounts();
      console.log(`找到 ${youtubeAccounts.length} 个启用的 YouTube 账号`);

      for (const account of youtubeAccounts) {
        tasks.push(
          this.postToYouTube(account, {
            videoPath,
            title: youtube.title || text,
            description: youtube.description || text,
            tags: youtube.tags || [],
            privacyStatus: youtube.privacyStatus || 'public'
          })
        );
      }
    }

    // Twitter 发布任务
    if (platforms.includes('twitter')) {
      const twitterAccounts = await this.configManager.getEnabledTwitterAccounts();
      console.log(`找到 ${twitterAccounts.length} 个启用的 Twitter 账号`);

      for (const account of twitterAccounts) {
        if (videoPath) {
          // 发布视频
          tasks.push(this.postToTwitter(account, { text, videoPath }));
        } else if (imagePaths && imagePaths.length > 0) {
          // 发布图片
          tasks.push(this.postToTwitter(account, { text, imagePaths }));
        } else {
          // 仅发布文本
          tasks.push(this.postToTwitter(account, { text }));
        }
      }
    }

    if (tasks.length === 0) {
      console.log('\n没有找到启用的账号或没有可发布的内容');
      return results;
    }

    console.log(`\n总共将执行 ${tasks.length} 个发布任务\n`);

    // 并发执行所有任务
    const taskResults = await Promise.allSettled(tasks);

    // 整理结果
    for (const result of taskResults) {
      if (result.status === 'fulfilled') {
        const data = result.value;
        if (data.platform === 'youtube') {
          results.youtube.push(data);
        } else if (data.platform === 'twitter') {
          results.twitter.push(data);
        }

        if (data.success) {
          results.summary.success++;
        } else {
          results.summary.failed++;
        }
        results.summary.total++;
      } else {
        results.summary.total++;
        results.summary.failed++;
        console.error('任务执行失败:', result.reason);
      }
    }

    // 打印总结
    console.log('\n========================================');
    console.log('发布完成');
    console.log('========================================');
    console.log(`总任务数: ${results.summary.total}`);
    console.log(`成功: ${results.summary.success}`);
    console.log(`失败: ${results.summary.failed}`);
    console.log('========================================\n');

    return results;
  }

  /**
   * 发布到单个 YouTube 账号
   * @param {Object} account - YouTube 账号配置
   * @param {Object} options - 发布选项
   * @returns {Promise<Object>} 发布结果
   */
  async postToYouTube(account, options) {
    try {
      const service = new YouTubeService(account);
      return await service.uploadVideo(options);
    } catch (error) {
      console.error(`YouTube 发布失败 (${account.name}):`, error.message);
      return {
        success: false,
        platform: 'youtube',
        account: account.name,
        error: error.message
      };
    }
  }

  /**
   * 发布到单个 Twitter 账号
   * @param {Object} account - Twitter 账号配置
   * @param {Object} options - 发布选项
   * @returns {Promise<Object>} 发布结果
   */
  async postToTwitter(account, options) {
    try {
      const service = new TwitterService(account);

      if (options.videoPath) {
        return await service.uploadVideo(options);
      } else if (options.imagePaths) {
        return await service.uploadImages(options);
      } else {
        return await service.postText(options);
      }
    } catch (error) {
      console.error(`Twitter 发布失败 (${account.name}):`, error.message);
      return {
        success: false,
        platform: 'twitter',
        account: account.name,
        error: error.message
      };
    }
  }

  /**
   * 仅发布到 YouTube
   * @param {Object} options - YouTube 发布选项
   * @returns {Promise<Object>} 发布结果
   */
  async postToYouTubeOnly(options) {
    return await this.post({
      ...options,
      platforms: ['youtube']
    });
  }

  /**
   * 仅发布到 Twitter
   * @param {Object} options - Twitter 发布选项
   * @returns {Promise<Object>} 发布结果
   */
  async postToTwitterOnly(options) {
    return await this.post({
      ...options,
      platforms: ['twitter']
    });
  }

  /**
   * 获取所有账号状态
   * @returns {Promise<Object>} 账号状态信息
   */
  async getAccountsStatus() {
    const config = await this.configManager.loadConfig();

    const status = {
      youtube: {
        total: config.youtube?.length || 0,
        enabled: config.youtube?.filter(acc => acc.enabled !== false).length || 0,
        disabled: config.youtube?.filter(acc => acc.enabled === false).length || 0
      },
      twitter: {
        total: config.twitter?.length || 0,
        enabled: config.twitter?.filter(acc => acc.enabled !== false).length || 0,
        disabled: config.twitter?.filter(acc => acc.enabled === false).length || 0
      }
    };

    return status;
  }

  /**
   * 测试账号连接
   * @param {string} platform - 平台名称
   * @param {string} accountId - 账号ID（可选，不提供则测试所有账号）
   * @returns {Promise<Array>} 测试结果
   */
  async testAccounts(platform, accountId = null) {
    const results = [];

    if (platform === 'youtube' || platform === 'all') {
      const accounts = await this.configManager.getEnabledYouTubeAccounts();
      const filtered = accountId
        ? accounts.filter(acc => acc.id === accountId)
        : accounts;

      for (const account of filtered) {
        try {
          const service = new YouTubeService(account);
          const info = await service.getChannelInfo();
          results.push({
            platform: 'youtube',
            account: account.name,
            success: info.success,
            info: info
          });
        } catch (error) {
          results.push({
            platform: 'youtube',
            account: account.name,
            success: false,
            error: error.message
          });
        }
      }
    }

    if (platform === 'twitter' || platform === 'all') {
      const accounts = await this.configManager.getEnabledTwitterAccounts();
      const filtered = accountId
        ? accounts.filter(acc => acc.id === accountId)
        : accounts;

      for (const account of filtered) {
        try {
          const service = new TwitterService(account);
          const info = await service.getUserInfo();
          results.push({
            platform: 'twitter',
            account: account.name,
            success: info.success,
            info: info
          });
        } catch (error) {
          results.push({
            platform: 'twitter',
            account: account.name,
            success: false,
            error: error.message
          });
        }
      }
    }

    return results;
  }
}

export default MultiPlatformPoster;
