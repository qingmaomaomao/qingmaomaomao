/**
 * 多平台社交媒体发帖工具
 *
 * 主入口文件 - 导出所有核心模块
 */

export { default as MultiPlatformPoster } from './multi-platform-poster.js';
export { default as ConfigManager } from './config/config-manager.js';
export { default as YouTubeService } from './services/youtube-service.js';
export { default as TwitterService } from './services/twitter-service.js';

// 便捷导出 - 快速使用
import MultiPlatformPoster from './multi-platform-poster.js';
export default MultiPlatformPoster;
