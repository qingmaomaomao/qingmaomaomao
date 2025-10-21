# 多平台社交媒体自动发帖工具

一个支持 YouTube 和 Twitter/X 平台的自动发帖工具，支持多账号同时发布，可上传视频和文本内容。

## 功能特性

- ✅ 支持 YouTube 和 Twitter/X 平台
- ✅ 支持多账号管理和同时发布
- ✅ 支持视频上传（YouTube 和 Twitter）
- ✅ 支持图片上传（Twitter，最多 4 张）
- ✅ 支持纯文本发布（Twitter）
- ✅ 并发发布，提高效率
- ✅ 详细的发布结果记录
- ✅ 账号启用/禁用管理
- ✅ 账号连接测试功能

## 技术架构

本项目基于对现有开源社交媒体管理工具（如 Postiz、Socioboard）的研究开发，采用以下技术栈：

- **Node.js** - 运行环境
- **googleapis** - YouTube Data API v3 集成
- **twitter-api-v2** - Twitter API v2 集成
- **commander** - CLI 命令行工具
- **chalk** - 终端输出美化

### 设计思路

1. **模块化架构**: 每个平台使用独立的服务类
2. **配置管理**: JSON 文件存储账号配置，支持多账号
3. **并发处理**: 使用 Promise.all 并发发布到多个账号
4. **错误处理**: 完善的错误捕获和报告机制
5. **OAuth 认证**: YouTube 使用 OAuth2，Twitter 使用 OAuth 1.0a

## 安装

已在主项目中安装依赖：

```bash
# 依赖包已安装
# googleapis, twitter-api-v2, commander, chalk, ora
```

## 配置

### 1. YouTube 账号配置

#### 步骤 1: 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 YouTube Data API v3
4. 创建 OAuth 2.0 凭据（应用类型：Web 应用）
5. 添加授权重定向 URI: `http://localhost`

#### 步骤 2: 获取 Refresh Token

```bash
# 生成授权 URL
node social-media-poster/cli.js youtube-auth \
  --client-id "your-client-id" \
  --client-secret "your-client-secret"

# 访问输出的 URL，授权后获取授权码
# 使用授权码获取 Refresh Token
node social-media-poster/cli.js youtube-token \
  --client-id "your-client-id" \
  --client-secret "your-client-secret" \
  --code "authorization-code"
```

#### 步骤 3: 添加账号

```bash
node social-media-poster/cli.js account add-youtube \
  -n "我的 YouTube 频道" \
  --client-id "your-client-id" \
  --client-secret "your-client-secret" \
  --refresh-token "your-refresh-token"
```

### 2. Twitter 账号配置

#### 步骤 1: 创建 Twitter 开发者账号

1. 访问 [Twitter Developer Portal](https://developer.twitter.com/)
2. 创建新应用
3. 生成 API Key、API Secret、Access Token 和 Access Token Secret
4. 确保应用有读写权限

#### 步骤 2: 添加账号

```bash
node social-media-poster/cli.js account add-twitter \
  -n "我的 Twitter 账号" \
  --app-key "your-api-key" \
  --app-secret "your-api-secret" \
  --access-token "your-access-token" \
  --access-secret "your-access-secret"
```

## 使用方法

### 查看所有命令

```bash
node social-media-poster/cli.js --help
```

### 账号管理

```bash
# 列出所有账号
node social-media-poster/cli.js account list

# 查看账号状态
node social-media-poster/cli.js status

# 测试账号连接
node social-media-poster/cli.js test -p all

# 禁用账号
node social-media-poster/cli.js account toggle -p youtube -i "账号ID" --disable

# 启用账号
node social-media-poster/cli.js account toggle -p youtube -i "账号ID" --enable

# 删除账号
node social-media-poster/cli.js account remove -p twitter -i "账号ID"
```

### 发布内容

#### 1. 发布视频到所有平台

```bash
node social-media-poster/cli.js post \
  --video "./my-video.mp4" \
  --text "这是我的新视频！" \
  --yt-title "精彩视频标题" \
  --yt-desc "这是视频的详细描述" \
  --yt-tags "标签1,标签2,标签3" \
  --yt-privacy "public"
```

#### 2. 仅发布到 YouTube

```bash
node social-media-poster/cli.js post \
  --video "./my-video.mp4" \
  --platforms "youtube" \
  --yt-title "我的视频" \
  --yt-desc "视频描述" \
  --yt-tags "vlog,生活"
```

#### 3. 仅发布到 Twitter（纯文本）

```bash
node social-media-poster/cli.js post \
  --text "Hello Twitter! 这是一条推文" \
  --platforms "twitter"
```

#### 4. 发布带视频的推文

```bash
node social-media-poster/cli.js post \
  --video "./video.mp4" \
  --text "查看我的新视频！" \
  --platforms "twitter"
```

#### 5. 发布带图片的推文

```bash
node social-media-poster/cli.js post \
  --images "./image1.jpg,./image2.jpg,./image3.jpg" \
  --text "查看这些精彩图片！" \
  --platforms "twitter"
```

## 编程接口

除了 CLI 工具，你也可以在代码中直接使用：

```javascript
import MultiPlatformPoster from './social-media-poster/multi-platform-poster.js';

const poster = new MultiPlatformPoster();

// 发布到所有平台
const results = await poster.post({
  text: '这是我的内容',
  videoPath: './video.mp4',
  platforms: ['youtube', 'twitter'],
  youtube: {
    title: '视频标题',
    description: '视频描述',
    tags: ['tag1', 'tag2'],
    privacyStatus: 'public'
  }
});

console.log(results);
```

## 项目结构

```
social-media-poster/
├── config/
│   ├── config-manager.js          # 配置管理器
│   ├── accounts.json               # 账号配置（自动生成）
│   └── accounts.example.json       # 配置示例
├── services/
│   ├── youtube-service.js          # YouTube 服务
│   └── twitter-service.js          # Twitter 服务
├── utils/                          # 工具函数（预留）
├── multi-platform-poster.js        # 主控制器
├── cli.js                          # CLI 入口
└── README.md                       # 使用文档
```

## 注意事项

1. **API 限制**
   - YouTube: 每日配额限制，默认 10,000 单位
   - Twitter: 根据 API 访问级别有不同限制

2. **视频大小限制**
   - YouTube: 最大 256 GB 或 12 小时
   - Twitter: 最大 512 MB（普通账号）

3. **安全建议**
   - 不要将 `accounts.json` 提交到版本控制
   - 定期更新访问令牌
   - 使用环境变量存储敏感信息

4. **YouTube 纯文本发布**
   - YouTube API 对社区帖子的支持有限
   - 建议使用视频上传功能

## 常见问题

### 1. YouTube 上传失败

- 检查 API 配额是否超限
- 确认 Refresh Token 是否有效
- 验证视频文件格式是否支持

### 2. Twitter 认证失败

- 确认 API 密钥和令牌正确
- 检查应用权限设置（需要读写权限）
- 验证网络连接

### 3. 如何获取更多配额

- YouTube: 申请配额增加
- Twitter: 升级 API 访问级别

## 开发参考

本项目开发时参考了以下开源项目和资源：

- [Postiz](https://github.com/gitroomhq/postiz-app) - 开源社交媒体调度工具
- [Socioboard](https://github.com/socioboard/Socioboard-5.0) - 社交媒体管理平台
- [Ayrshare Social Media API](https://github.com/ayrshare/social-media-api) - 社交媒体 API
- [YouTube Data API](https://developers.google.com/youtube/v3) - Google 官方文档
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api) - Twitter 官方文档

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0 (2025-10-21)

- ✅ 初始版本发布
- ✅ 支持 YouTube 和 Twitter 平台
- ✅ 多账号管理
- ✅ 视频和图片上传
- ✅ CLI 工具
- ✅ 完整文档
