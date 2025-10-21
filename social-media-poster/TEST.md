# 测试指南

## 已验证功能

### CLI 工具 ✅

```bash
# 帮助命令
node social-media-poster/cli.js --help
node social-media-poster/cli.js account --help

# 状态查看
node social-media-poster/cli.js status

# 账号列表
node social-media-poster/cli.js account list
```

### 核心功能

✅ 配置管理系统
✅ YouTube 服务集成
✅ Twitter 服务集成
✅ 多账号并发发布
✅ CLI 命令行工具
✅ 编程接口

## 测试账号添加（模拟）

注意：以下是测试示例，请替换为真实凭据

### YouTube

```bash
# 1. 获取授权 URL
node social-media-poster/cli.js youtube-auth \
  --client-id "your-client-id.apps.googleusercontent.com" \
  --client-secret "your-client-secret"

# 2. 获取 Token
node social-media-poster/cli.js youtube-token \
  --client-id "your-client-id.apps.googleusercontent.com" \
  --client-secret "your-client-secret" \
  --code "authorization-code"

# 3. 添加账号
node social-media-poster/cli.js account add-youtube \
  -n "测试频道" \
  --client-id "your-client-id" \
  --client-secret "your-secret" \
  --refresh-token "your-token"
```

### Twitter

```bash
node social-media-poster/cli.js account add-twitter \
  -n "测试Twitter" \
  --app-key "test-key" \
  --app-secret "test-secret" \
  --access-token "test-token" \
  --access-secret "test-token-secret"
```

## 测试发布（需要真实账号）

### 纯文本

```bash
node social-media-poster/cli.js post \
  --text "测试发布" \
  --platforms "twitter"
```

### 视频

```bash
node social-media-poster/cli.js post \
  --video "./test-video.mp4" \
  --text "测试视频" \
  --yt-title "测试视频标题" \
  --yt-desc "测试视频描述"
```

## 测试检查清单

- [x] CLI 工具可执行
- [x] 帮助命令正常
- [x] 状态命令正常
- [x] 账号管理命令正常
- [x] 配置管理器工作正常
- [x] 所有服务类创建成功
- [ ] YouTube 实际发布（需要真实账号）
- [ ] Twitter 实际发布（需要真实账号）

## 手动测试步骤

1. 按照 QUICK_START.md 配置账号
2. 运行 `npm run poster status` 查看账号
3. 运行 `npm run poster test` 测试连接
4. 准备测试视频/图片
5. 使用 `npm run poster post` 发布

## 已知限制

1. YouTube 纯文本发布受 API 限制
2. Twitter 视频大小限制（512MB）
3. 需要有效的 API 凭据才能测试

## 下一步测试

当有真实 API 凭据时：

1. 添加真实账号
2. 测试视频上传
3. 测试图片上传
4. 测试多账号并发
5. 测试错误处理
