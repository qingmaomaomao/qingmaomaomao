# 快速开始指南

这是一个简化的快速开始指南，帮助你在 5 分钟内开始使用多平台发帖工具。

## 第一步：准备 API 凭据

### YouTube (可选)

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建项目并启用 YouTube Data API v3
3. 创建 OAuth 2.0 凭据
4. 记录 Client ID 和 Client Secret

### Twitter (可选)

1. 访问 [Twitter Developer Portal](https://developer.twitter.com/)
2. 创建应用并生成密钥
3. 记录 API Key、API Secret、Access Token 和 Access Token Secret

## 第二步：添加账号

### 添加 YouTube 账号

```bash
# 1. 生成授权链接
npm run poster youtube-auth -- \
  --client-id "你的Client ID" \
  --client-secret "你的Client Secret"

# 2. 访问链接授权，复制返回的 code

# 3. 获取 Refresh Token
npm run poster youtube-token -- \
  --client-id "你的Client ID" \
  --client-secret "你的Client Secret" \
  --code "授权码"

# 4. 添加账号
npm run poster account add-youtube -- \
  -n "我的频道" \
  --client-id "你的Client ID" \
  --client-secret "你的Client Secret" \
  --refresh-token "Refresh Token"
```

### 添加 Twitter 账号

```bash
npm run poster account add-twitter -- \
  -n "我的Twitter" \
  --app-key "你的API Key" \
  --app-secret "你的API Secret" \
  --access-token "你的Access Token" \
  --access-secret "你的Access Token Secret"
```

## 第三步：测试账号

```bash
# 查看所有账号
npm run poster account list

# 测试账号连接
npm run poster test
```

## 第四步：开始发布

### 发布纯文本（Twitter）

```bash
npm run poster post -- \
  --text "Hello World!" \
  --platforms "twitter"
```

### 发布视频

```bash
npm run poster post -- \
  --video "./my-video.mp4" \
  --text "查看我的新视频！" \
  --yt-title "精彩视频" \
  --yt-desc "视频描述" \
  --yt-tags "vlog,生活"
```

## 常用命令速查

```bash
# 查看帮助
npm run poster:help

# 查看状态
npm run poster status

# 列出账号
npm run poster account list

# 测试连接
npm run poster test

# 发布内容
npm run poster post -- [选项]

# 运行示例代码
npm run poster:example
```

## 配置文件位置

- 账号配置: `social-media-poster/config/accounts.json`
- 配置示例: `social-media-poster/config/accounts.example.json`

## 常见问题

**Q: 如何禁用某个账号而不删除？**
```bash
npm run poster account toggle -- -p youtube -i "账号ID" --disable
```

**Q: 发布结果保存在哪里？**

发布后会在项目根目录生成 `post-results-[时间戳].json` 文件。

**Q: 如何只发布到一个平台？**

使用 `--platforms` 参数指定：
```bash
npm run poster post -- --text "内容" --platforms "twitter"
```

**Q: Twitter 最多可以上传几张图片？**

最多 4 张图片。

**Q: YouTube 视频大小限制？**

最大 256 GB 或 12 小时。

## 获取帮助

查看完整文档: [README.md](./README.md)

有问题？提交 Issue 或查看示例代码: `social-media-poster/example.js`

## 下一步

- 阅读完整的 [README.md](./README.md) 了解所有功能
- 查看 [example.js](./example.js) 学习如何在代码中使用
- 配置更多账号实现真正的多账号发布
