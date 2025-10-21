import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, 'accounts.json');
  }

  /**
   * 加载账号配置
   * @returns {Promise<Object>} 账号配置对象
   */
  async loadConfig() {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // 如果文件不存在，返回默认配置
        return this.getDefaultConfig();
      }
      throw new Error(`加载配置失败: ${error.message}`);
    }
  }

  /**
   * 保存账号配置
   * @param {Object} config - 配置对象
   */
  async saveConfig(config) {
    try {
      await fs.writeFile(
        this.configPath,
        JSON.stringify(config, null, 2),
        'utf-8'
      );
      console.log('配置保存成功');
    } catch (error) {
      throw new Error(`保存配置失败: ${error.message}`);
    }
  }

  /**
   * 获取默认配置模板
   * @returns {Object} 默认配置
   */
  getDefaultConfig() {
    return {
      youtube: [],
      twitter: []
    };
  }

  /**
   * 添加 YouTube 账号
   * @param {Object} account - YouTube 账号配置
   */
  async addYouTubeAccount(account) {
    const config = await this.loadConfig();
    if (!config.youtube) {
      config.youtube = [];
    }

    // 验证必需字段
    if (!account.name || !account.clientId || !account.clientSecret || !account.refreshToken) {
      throw new Error('YouTube 账号配置缺少必需字段');
    }

    config.youtube.push({
      id: Date.now().toString(),
      name: account.name,
      clientId: account.clientId,
      clientSecret: account.clientSecret,
      refreshToken: account.refreshToken,
      enabled: account.enabled !== false
    });

    await this.saveConfig(config);
    return config;
  }

  /**
   * 添加 Twitter 账号
   * @param {Object} account - Twitter 账号配置
   */
  async addTwitterAccount(account) {
    const config = await this.loadConfig();
    if (!config.twitter) {
      config.twitter = [];
    }

    // 验证必需字段
    if (!account.name || !account.appKey || !account.appSecret ||
        !account.accessToken || !account.accessSecret) {
      throw new Error('Twitter 账号配置缺少必需字段');
    }

    config.twitter.push({
      id: Date.now().toString(),
      name: account.name,
      appKey: account.appKey,
      appSecret: account.appSecret,
      accessToken: account.accessToken,
      accessSecret: account.accessSecret,
      enabled: account.enabled !== false
    });

    await this.saveConfig(config);
    return config;
  }

  /**
   * 获取启用的 YouTube 账号
   * @returns {Promise<Array>} YouTube 账号列表
   */
  async getEnabledYouTubeAccounts() {
    const config = await this.loadConfig();
    return (config.youtube || []).filter(account => account.enabled !== false);
  }

  /**
   * 获取启用的 Twitter 账号
   * @returns {Promise<Array>} Twitter 账号列表
   */
  async getEnabledTwitterAccounts() {
    const config = await this.loadConfig();
    return (config.twitter || []).filter(account => account.enabled !== false);
  }

  /**
   * 删除账号
   * @param {string} platform - 平台名称 (youtube/twitter)
   * @param {string} accountId - 账号ID
   */
  async removeAccount(platform, accountId) {
    const config = await this.loadConfig();
    if (config[platform]) {
      config[platform] = config[platform].filter(acc => acc.id !== accountId);
      await this.saveConfig(config);
    }
  }

  /**
   * 启用/禁用账号
   * @param {string} platform - 平台名称
   * @param {string} accountId - 账号ID
   * @param {boolean} enabled - 是否启用
   */
  async toggleAccount(platform, accountId, enabled) {
    const config = await this.loadConfig();
    if (config[platform]) {
      const account = config[platform].find(acc => acc.id === accountId);
      if (account) {
        account.enabled = enabled;
        await this.saveConfig(config);
      }
    }
  }

  /**
   * 列出所有账号
   * @returns {Promise<Object>} 所有账号配置
   */
  async listAllAccounts() {
    return await this.loadConfig();
  }
}

export default ConfigManager;
