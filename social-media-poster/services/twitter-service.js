import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';

class TwitterService {
  constructor(credentials) {
    this.credentials = credentials;
    this.client = null;
  }

  /**
   * 初始化 Twitter 客户端
   */
  initializeClient() {
    this.client = new TwitterApi({
      appKey: this.credentials.appKey,
      appSecret: this.credentials.appSecret,
      accessToken: this.credentials.accessToken,
      accessSecret: this.credentials.accessSecret,
    });
  }

  /**
   * 发布纯文本推文
   * @param {Object} options - 发布选项
   * @param {string} options.text - 推文内容
   * @returns {Promise<Object>} 发布结果
   */
  async postText(options) {
    if (!this.client) {
      this.initializeClient();
    }

    const { text } = options;

    try {
      console.log(`发布推文: ${text.substring(0, 50)}...`);
      console.log(`账号: ${this.credentials.name}`);

      const tweet = await this.client.v2.tweet({
        text: text
      });

      const tweetUrl = `https://twitter.com/i/web/status/${tweet.data.id}`;

      console.log(`✓ 推文发布成功!`);
      console.log(`  账号: ${this.credentials.name}`);
      console.log(`  推文ID: ${tweet.data.id}`);
      console.log(`  链接: ${tweetUrl}`);

      return {
        success: true,
        platform: 'twitter',
        account: this.credentials.name,
        tweetId: tweet.data.id,
        url: tweetUrl,
        data: tweet.data
      };

    } catch (error) {
      console.error(`✗ Twitter 发布失败 (${this.credentials.name}):`, error.message);

      return {
        success: false,
        platform: 'twitter',
        account: this.credentials.name,
        error: error.message,
        details: error.data || error.errors
      };
    }
  }

  /**
   * 上传视频并发布推文
   * @param {Object} options - 发布选项
   * @param {string} options.videoPath - 视频文件路径
   * @param {string} options.text - 推文内容
   * @returns {Promise<Object>} 发布结果
   */
  async uploadVideo(options) {
    if (!this.client) {
      this.initializeClient();
    }

    const { videoPath, text } = options;

    try {
      // 验证视频文件是否存在
      if (!fs.existsSync(videoPath)) {
        throw new Error(`视频文件不存在: ${videoPath}`);
      }

      console.log(`上传视频到 Twitter: ${text.substring(0, 50)}...`);
      console.log(`账号: ${this.credentials.name}`);

      // 获取文件大小
      const stats = fs.statSync(videoPath);
      const fileSizeInBytes = stats.size;
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

      console.log(`  视频大小: ${fileSizeInMB.toFixed(2)} MB`);

      // 上传媒体文件
      // 根据文件大小选择合适的上传类型
      const mediaType = fileSizeInMB > 15 ? 'longmp4' : 'mp4';

      console.log(`  上传中... (类型: ${mediaType})`);
      const mediaId = await this.client.v1.uploadMedia(videoPath, {
        mimeType: 'video/mp4',
        target: mediaType
      });

      console.log(`  视频上传完成，媒体ID: ${mediaId}`);

      // 发布带视频的推文
      const tweet = await this.client.v2.tweet({
        text: text,
        media: {
          media_ids: [mediaId]
        }
      });

      const tweetUrl = `https://twitter.com/i/web/status/${tweet.data.id}`;

      console.log(`✓ 视频推文发布成功!`);
      console.log(`  账号: ${this.credentials.name}`);
      console.log(`  推文ID: ${tweet.data.id}`);
      console.log(`  链接: ${tweetUrl}`);

      return {
        success: true,
        platform: 'twitter',
        account: this.credentials.name,
        tweetId: tweet.data.id,
        url: tweetUrl,
        mediaId: mediaId,
        data: tweet.data
      };

    } catch (error) {
      console.error(`✗ Twitter 视频上传失败 (${this.credentials.name}):`, error.message);

      return {
        success: false,
        platform: 'twitter',
        account: this.credentials.name,
        error: error.message,
        details: error.data || error.errors
      };
    }
  }

  /**
   * 上传图片并发布推文
   * @param {Object} options - 发布选项
   * @param {string|Array<string>} options.imagePaths - 图片文件路径（可以是单个或数组，最多4张）
   * @param {string} options.text - 推文内容
   * @returns {Promise<Object>} 发布结果
   */
  async uploadImages(options) {
    if (!this.client) {
      this.initializeClient();
    }

    const { imagePaths, text } = options;
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];

    try {
      console.log(`上传图片到 Twitter: ${text.substring(0, 50)}...`);
      console.log(`账号: ${this.credentials.name}`);
      console.log(`图片数量: ${paths.length}`);

      // Twitter 最多支持 4 张图片
      if (paths.length > 4) {
        throw new Error('Twitter 一次最多只能上传 4 张图片');
      }

      // 验证所有图片文件是否存在
      for (const path of paths) {
        if (!fs.existsSync(path)) {
          throw new Error(`图片文件不存在: ${path}`);
        }
      }

      // 上传所有图片
      const mediaIds = [];
      for (const imagePath of paths) {
        console.log(`  上传图片: ${imagePath}`);
        const mediaId = await this.client.v1.uploadMedia(imagePath);
        mediaIds.push(mediaId);
        console.log(`  上传完成，媒体ID: ${mediaId}`);
      }

      // 发布带图片的推文
      const tweet = await this.client.v2.tweet({
        text: text,
        media: {
          media_ids: mediaIds
        }
      });

      const tweetUrl = `https://twitter.com/i/web/status/${tweet.data.id}`;

      console.log(`✓ 图片推文发布成功!`);
      console.log(`  账号: ${this.credentials.name}`);
      console.log(`  推文ID: ${tweet.data.id}`);
      console.log(`  链接: ${tweetUrl}`);

      return {
        success: true,
        platform: 'twitter',
        account: this.credentials.name,
        tweetId: tweet.data.id,
        url: tweetUrl,
        mediaIds: mediaIds,
        data: tweet.data
      };

    } catch (error) {
      console.error(`✗ Twitter 图片上传失败 (${this.credentials.name}):`, error.message);

      return {
        success: false,
        platform: 'twitter',
        account: this.credentials.name,
        error: error.message,
        details: error.data || error.errors
      };
    }
  }

  /**
   * 获取用户信息
   * @returns {Promise<Object>} 用户信息
   */
  async getUserInfo() {
    if (!this.client) {
      this.initializeClient();
    }

    try {
      const user = await this.client.v2.me({
        'user.fields': ['public_metrics', 'description', 'created_at']
      });

      return {
        success: true,
        id: user.data.id,
        username: user.data.username,
        name: user.data.name,
        description: user.data.description,
        followersCount: user.data.public_metrics?.followers_count,
        followingCount: user.data.public_metrics?.following_count,
        tweetCount: user.data.public_metrics?.tweet_count,
        createdAt: user.data.created_at
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default TwitterService;
