/**
 * 多平台发帖工具使用示例
 *
 * 这个文件展示了如何在代码中使用多平台发帖工具
 */

import MultiPlatformPoster from './multi-platform-poster.js';
import ConfigManager from './config/config-manager.js';

// 示例 1: 发布视频到所有平台
async function example1() {
  console.log('=== 示例 1: 发布视频到所有平台 ===\n');

  const poster = new MultiPlatformPoster();

  const results = await poster.post({
    text: '这是我的新视频！欢迎观看 🎥',
    videoPath: './test-video.mp4', // 替换为你的视频路径
    platforms: ['youtube', 'twitter'],
    youtube: {
      title: '精彩视频 - 必看！',
      description: '这是一个非常精彩的视频，包含了很多有趣的内容。\n\n欢迎订阅我的频道！',
      tags: ['教程', 'vlog', '生活'],
      privacyStatus: 'public' // public, private, unlisted
    }
  });

  console.log('\n发布结果:', JSON.stringify(results, null, 2));
}

// 示例 2: 仅发布到 YouTube
async function example2() {
  console.log('=== 示例 2: 仅发布到 YouTube ===\n');

  const poster = new MultiPlatformPoster();

  const results = await poster.postToYouTubeOnly({
    videoPath: './my-video.mp4',
    youtube: {
      title: '我的 YouTube 视频',
      description: '视频描述内容',
      tags: ['科技', '教程'],
      privacyStatus: 'unlisted'
    }
  });

  console.log('\n发布结果:', results);
}

// 示例 3: 仅发布到 Twitter（纯文本）
async function example3() {
  console.log('=== 示例 3: 发布纯文本到 Twitter ===\n');

  const poster = new MultiPlatformPoster();

  const results = await poster.postToTwitterOnly({
    text: 'Hello Twitter! 这是一条测试推文 👋'
  });

  console.log('\n发布结果:', results);
}

// 示例 4: 发布带图片的推文
async function example4() {
  console.log('=== 示例 4: 发布带图片的推文 ===\n');

  const poster = new MultiPlatformPoster();

  const results = await poster.postToTwitterOnly({
    text: '分享一些精彩图片！📸',
    imagePaths: [
      './image1.jpg',
      './image2.jpg',
      './image3.jpg'
    ]
  });

  console.log('\n发布结果:', results);
}

// 示例 5: 添加账号
async function example5() {
  console.log('=== 示例 5: 添加账号 ===\n');

  const configManager = new ConfigManager();

  // 添加 YouTube 账号
  await configManager.addYouTubeAccount({
    name: '我的频道',
    clientId: 'your-client-id.apps.googleusercontent.com',
    clientSecret: 'your-client-secret',
    refreshToken: 'your-refresh-token'
  });

  // 添加 Twitter 账号
  await configManager.addTwitterAccount({
    name: '我的 Twitter',
    appKey: 'your-app-key',
    appSecret: 'your-app-secret',
    accessToken: 'your-access-token',
    accessSecret: 'your-access-secret'
  });

  console.log('账号添加完成！');
}

// 示例 6: 管理账号
async function example6() {
  console.log('=== 示例 6: 管理账号 ===\n');

  const configManager = new ConfigManager();

  // 列出所有账号
  const config = await configManager.listAllAccounts();
  console.log('所有账号:', config);

  // 禁用某个账号
  // await configManager.toggleAccount('youtube', 'account-id', false);

  // 启用某个账号
  // await configManager.toggleAccount('youtube', 'account-id', true);

  // 删除账号
  // await configManager.removeAccount('twitter', 'account-id');
}

// 示例 7: 测试账号连接
async function example7() {
  console.log('=== 示例 7: 测试账号连接 ===\n');

  const poster = new MultiPlatformPoster();

  // 测试所有平台
  const results = await poster.testAccounts('all');

  for (const result of results) {
    console.log(`\n${result.platform} - ${result.account}:`);
    console.log('  状态:', result.success ? '✓ 成功' : '✗ 失败');

    if (result.success && result.info) {
      console.log('  详情:', result.info);
    } else if (!result.success) {
      console.log('  错误:', result.error);
    }
  }
}

// 示例 8: 查看账号状态
async function example8() {
  console.log('=== 示例 8: 查看账号状态 ===\n');

  const poster = new MultiPlatformPoster();

  const status = await poster.getAccountsStatus();

  console.log('YouTube 账号:');
  console.log('  总计:', status.youtube.total);
  console.log('  启用:', status.youtube.enabled);
  console.log('  禁用:', status.youtube.disabled);

  console.log('\nTwitter 账号:');
  console.log('  总计:', status.twitter.total);
  console.log('  启用:', status.twitter.enabled);
  console.log('  禁用:', status.twitter.disabled);
}

// 运行示例
async function main() {
  try {
    // 取消注释你想运行的示例

    // await example1(); // 发布视频到所有平台
    // await example2(); // 仅发布到 YouTube
    // await example3(); // 发布纯文本到 Twitter
    // await example4(); // 发布带图片的推文
    // await example5(); // 添加账号
    // await example6(); // 管理账号
    // await example7(); // 测试账号连接
    await example8(); // 查看账号状态

  } catch (error) {
    console.error('错误:', error.message);
    console.error(error);
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
  example7,
  example8
};
