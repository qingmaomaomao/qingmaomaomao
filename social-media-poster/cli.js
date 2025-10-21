#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import MultiPlatformPoster from './multi-platform-poster.js';
import ConfigManager from './config/config-manager.js';
import YouTubeService from './services/youtube-service.js';

const program = new Command();
const poster = new MultiPlatformPoster();
const configManager = new ConfigManager();

program
  .name('social-poster')
  .description('多平台社交媒体发布工具 (YouTube & Twitter/X)')
  .version('1.0.0');

// 发布命令
program
  .command('post')
  .description('发布内容到社交媒体')
  .option('-t, --text <text>', '文本内容')
  .option('-v, --video <path>', '视频文件路径')
  .option('-i, --images <paths>', '图片文件路径，多个用逗号分隔（仅 Twitter）')
  .option('-p, --platforms <platforms>', '平台列表，用逗号分隔 (youtube,twitter)', 'youtube,twitter')
  .option('--yt-title <title>', 'YouTube 视频标题')
  .option('--yt-desc <description>', 'YouTube 视频描述')
  .option('--yt-tags <tags>', 'YouTube 标签，用逗号分隔')
  .option('--yt-privacy <status>', 'YouTube 隐私状态 (public/private/unlisted)', 'public')
  .action(async (options) => {
    try {
      if (!options.text && !options.video) {
        console.error(chalk.red('错误: 必须提供文本内容或视频文件'));
        process.exit(1);
      }

      const platforms = options.platforms.split(',').map(p => p.trim());
      const imagePaths = options.images ? options.images.split(',').map(p => p.trim()) : null;

      const postOptions = {
        text: options.text || '',
        videoPath: options.video,
        imagePaths: imagePaths,
        platforms: platforms,
        youtube: {
          title: options.ytTitle,
          description: options.ytDesc,
          tags: options.ytTags ? options.ytTags.split(',').map(t => t.trim()) : [],
          privacyStatus: options.ytPrivacy
        }
      };

      const results = await poster.post(postOptions);

      // 保存结果到文件
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fs = await import('fs/promises');
      await fs.writeFile(
        `./post-results-${timestamp}.json`,
        JSON.stringify(results, null, 2)
      );

      console.log(chalk.green(`\n结果已保存到: post-results-${timestamp}.json`));

    } catch (error) {
      console.error(chalk.red('发布失败:'), error.message);
      process.exit(1);
    }
  });

// 账号管理命令
const accountCmd = program.command('account').description('管理账号');

// 添加 YouTube 账号
accountCmd
  .command('add-youtube')
  .description('添加 YouTube 账号')
  .option('-n, --name <name>', '账号名称')
  .option('--client-id <id>', 'Google OAuth Client ID')
  .option('--client-secret <secret>', 'Google OAuth Client Secret')
  .option('--refresh-token <token>', 'Refresh Token')
  .action(async (options) => {
    try {
      if (!options.name || !options.clientId || !options.clientSecret || !options.refreshToken) {
        console.error(chalk.red('错误: 缺少必需参数'));
        console.log('使用方法: social-poster account add-youtube -n "账号名" --client-id "..." --client-secret "..." --refresh-token "..."');
        process.exit(1);
      }

      await configManager.addYouTubeAccount({
        name: options.name,
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        refreshToken: options.refreshToken
      });

      console.log(chalk.green(`✓ 成功添加 YouTube 账号: ${options.name}`));
    } catch (error) {
      console.error(chalk.red('添加账号失败:'), error.message);
      process.exit(1);
    }
  });

// 添加 Twitter 账号
accountCmd
  .command('add-twitter')
  .description('添加 Twitter 账号')
  .option('-n, --name <name>', '账号名称')
  .option('--app-key <key>', 'Twitter App Key (API Key)')
  .option('--app-secret <secret>', 'Twitter App Secret (API Secret)')
  .option('--access-token <token>', 'Access Token')
  .option('--access-secret <secret>', 'Access Token Secret')
  .action(async (options) => {
    try {
      if (!options.name || !options.appKey || !options.appSecret ||
          !options.accessToken || !options.accessSecret) {
        console.error(chalk.red('错误: 缺少必需参数'));
        console.log('使用方法: social-poster account add-twitter -n "账号名" --app-key "..." --app-secret "..." --access-token "..." --access-secret "..."');
        process.exit(1);
      }

      await configManager.addTwitterAccount({
        name: options.name,
        appKey: options.appKey,
        appSecret: options.appSecret,
        accessToken: options.accessToken,
        accessSecret: options.accessSecret
      });

      console.log(chalk.green(`✓ 成功添加 Twitter 账号: ${options.name}`));
    } catch (error) {
      console.error(chalk.red('添加账号失败:'), error.message);
      process.exit(1);
    }
  });

// 列出所有账号
accountCmd
  .command('list')
  .description('列出所有账号')
  .action(async () => {
    try {
      const config = await configManager.listAllAccounts();

      console.log(chalk.bold('\n=== YouTube 账号 ==='));
      if (config.youtube && config.youtube.length > 0) {
        config.youtube.forEach((acc, index) => {
          const status = acc.enabled !== false ? chalk.green('✓ 启用') : chalk.red('✗ 禁用');
          console.log(`${index + 1}. ${acc.name} (ID: ${acc.id}) ${status}`);
        });
      } else {
        console.log(chalk.gray('暂无 YouTube 账号'));
      }

      console.log(chalk.bold('\n=== Twitter 账号 ==='));
      if (config.twitter && config.twitter.length > 0) {
        config.twitter.forEach((acc, index) => {
          const status = acc.enabled !== false ? chalk.green('✓ 启用') : chalk.red('✗ 禁用');
          console.log(`${index + 1}. ${acc.name} (ID: ${acc.id}) ${status}`);
        });
      } else {
        console.log(chalk.gray('暂无 Twitter 账号'));
      }
      console.log('');

    } catch (error) {
      console.error(chalk.red('获取账号列表失败:'), error.message);
      process.exit(1);
    }
  });

// 删除账号
accountCmd
  .command('remove')
  .description('删除账号')
  .option('-p, --platform <platform>', '平台 (youtube/twitter)')
  .option('-i, --id <id>', '账号 ID')
  .action(async (options) => {
    try {
      if (!options.platform || !options.id) {
        console.error(chalk.red('错误: 必须提供平台和账号 ID'));
        process.exit(1);
      }

      await configManager.removeAccount(options.platform, options.id);
      console.log(chalk.green(`✓ 成功删除账号`));
    } catch (error) {
      console.error(chalk.red('删除账号失败:'), error.message);
      process.exit(1);
    }
  });

// 启用/禁用账号
accountCmd
  .command('toggle')
  .description('启用或禁用账号')
  .option('-p, --platform <platform>', '平台 (youtube/twitter)')
  .option('-i, --id <id>', '账号 ID')
  .option('-e, --enable', '启用账号')
  .option('-d, --disable', '禁用账号')
  .action(async (options) => {
    try {
      if (!options.platform || !options.id) {
        console.error(chalk.red('错误: 必须提供平台和账号 ID'));
        process.exit(1);
      }

      if (!options.enable && !options.disable) {
        console.error(chalk.red('错误: 必须指定 --enable 或 --disable'));
        process.exit(1);
      }

      const enabled = options.enable === true;
      await configManager.toggleAccount(options.platform, options.id, enabled);
      console.log(chalk.green(`✓ 账号已${enabled ? '启用' : '禁用'}`));
    } catch (error) {
      console.error(chalk.red('操作失败:'), error.message);
      process.exit(1);
    }
  });

// 测试账号连接
program
  .command('test')
  .description('测试账号连接')
  .option('-p, --platform <platform>', '平台 (youtube/twitter/all)', 'all')
  .action(async (options) => {
    try {
      console.log(chalk.bold('正在测试账号连接...\n'));

      const results = await poster.testAccounts(options.platform);

      for (const result of results) {
        const status = result.success ? chalk.green('✓ 成功') : chalk.red('✗ 失败');
        console.log(`${status} ${result.platform} - ${result.account}`);

        if (result.success && result.info) {
          if (result.platform === 'youtube') {
            console.log(chalk.gray(`  频道: ${result.info.title}`));
            console.log(chalk.gray(`  订阅者: ${result.info.subscriberCount}`));
          } else if (result.platform === 'twitter') {
            console.log(chalk.gray(`  用户名: @${result.info.username}`));
            console.log(chalk.gray(`  粉丝: ${result.info.followersCount}`));
          }
        } else if (!result.success) {
          console.log(chalk.red(`  错误: ${result.error}`));
        }
        console.log('');
      }

    } catch (error) {
      console.error(chalk.red('测试失败:'), error.message);
      process.exit(1);
    }
  });

// 状态命令
program
  .command('status')
  .description('查看账号状态')
  .action(async () => {
    try {
      const status = await poster.getAccountsStatus();

      console.log(chalk.bold('\n=== 账号状态 ===\n'));
      console.log(chalk.bold('YouTube:'));
      console.log(`  总计: ${status.youtube.total}`);
      console.log(`  启用: ${chalk.green(status.youtube.enabled)}`);
      console.log(`  禁用: ${chalk.red(status.youtube.disabled)}\n`);

      console.log(chalk.bold('Twitter:'));
      console.log(`  总计: ${status.twitter.total}`);
      console.log(`  启用: ${chalk.green(status.twitter.enabled)}`);
      console.log(`  禁用: ${chalk.red(status.twitter.disabled)}\n`);

    } catch (error) {
      console.error(chalk.red('获取状态失败:'), error.message);
      process.exit(1);
    }
  });

// YouTube OAuth 辅助命令
program
  .command('youtube-auth')
  .description('获取 YouTube OAuth URL')
  .option('--client-id <id>', 'Google OAuth Client ID')
  .option('--client-secret <secret>', 'Google OAuth Client Secret')
  .action((options) => {
    if (!options.clientId || !options.clientSecret) {
      console.error(chalk.red('错误: 必须提供 Client ID 和 Client Secret'));
      process.exit(1);
    }

    const url = YouTubeService.generateAuthUrl(
      options.clientId,
      options.clientSecret
    );

    console.log(chalk.bold('\n请访问以下 URL 进行授权:\n'));
    console.log(chalk.blue(url));
    console.log(chalk.bold('\n授权后，复制 URL 中的 code 参数值\n'));
    console.log(chalk.gray('然后使用: social-poster youtube-token --client-id "..." --client-secret "..." --code "..."'));
    console.log('');
  });

// 获取 YouTube Token
program
  .command('youtube-token')
  .description('使用授权码获取 YouTube Refresh Token')
  .option('--client-id <id>', 'Google OAuth Client ID')
  .option('--client-secret <secret>', 'Google OAuth Client Secret')
  .option('--code <code>', '授权码')
  .action(async (options) => {
    try {
      if (!options.clientId || !options.clientSecret || !options.code) {
        console.error(chalk.red('错误: 必须提供所有参数'));
        process.exit(1);
      }

      const tokens = await YouTubeService.getTokensFromCode(
        options.clientId,
        options.clientSecret,
        options.code
      );

      console.log(chalk.green('\n✓ 成功获取 Tokens!\n'));
      console.log(chalk.bold('Refresh Token:'));
      console.log(chalk.yellow(tokens.refresh_token));
      console.log(chalk.gray('\n请保存好这个 Refresh Token，添加账号时需要使用\n'));

    } catch (error) {
      console.error(chalk.red('获取 Token 失败:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

// 如果没有提供任何命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
