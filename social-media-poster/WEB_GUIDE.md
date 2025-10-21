# Web 界面使用指南

## 快速开始

### 启动 Web 服务器

```bash
# 方式 1: 使用 npm 脚本
npm run poster:web

# 方式 2: 或者
npm run poster:start

# 方式 3: 直接运行
node social-media-poster/server.js
```

启动后，打开浏览器访问: **http://localhost:3000**

## 界面功能

### 1. 📢 发布内容

在这个页面，你可以：

**基本操作：**
- 选择要发布的平台（YouTube、Twitter 或两者）
- 输入文本内容
- 上传视频文件（可选）
- 上传图片文件（可选，Twitter 最多 4 张）

**YouTube 专属设置：**
- 视频标题
- 视频描述
- 标签（用逗号分隔）
- 隐私状态（公开/不公开列出/私密）

**发布流程：**
1. 选择平台
2. 输入文本内容
3. 如需要，上传视频或图片
4. 如果发布到 YouTube，填写视频信息
5. 点击"开始发布"按钮
6. 等待发布完成，查看结果

### 2. 👥 账号管理

**添加 YouTube 账号：**
1. 输入账号名称（自定义，用于识别）
2. 输入 Client ID（从 Google Cloud Console 获取）
3. 输入 Client Secret
4. 输入 Refresh Token（需要先在"YouTube 配置"页面获取）
5. 点击"添加 YouTube 账号"

**添加 Twitter 账号：**
1. 输入账号名称
2. 输入 App Key（API Key）
3. 输入 App Secret（API Secret）
4. 输入 Access Token
5. 输入 Access Token Secret
6. 点击"添加 Twitter 账号"

**管理账号：**
- **启用/禁用**: 点击对应按钮切换账号状态
- **删除**: 点击删除按钮移除账号（需要确认）

### 3. 📊 状态查看

**账号统计：**
- 查看 YouTube 和 Twitter 账号总数
- 查看启用和禁用的账号数量

**测试连接：**
- 点击"测试所有账号"按钮
- 系统会连接每个账号并验证凭据
- 查看测试结果，包括账号信息和连接状态

### 4. 🔑 YouTube 配置

这是获取 YouTube Refresh Token 的辅助工具。

**步骤 1: 生成授权链接**
1. 输入 Client ID
2. 输入 Client Secret
3. 点击"生成授权链接"
4. 点击生成的链接，打开新窗口
5. 登录 Google 账号并授权
6. 复制返回 URL 中的 `code=` 参数值

**步骤 2: 获取 Refresh Token**
1. 输入与步骤 1 相同的 Client ID 和 Client Secret
2. 粘贴刚才复制的授权码
3. 点击"获取 Refresh Token"
4. 复制显示的 Refresh Token
5. 在"账号管理"页面使用这个 Token 添加账号

## 使用场景示例

### 场景 1: 纯文本发布到 Twitter

1. 打开"发布内容"页面
2. 取消勾选"YouTube"，只勾选"Twitter/X"
3. 输入推文内容
4. 点击"开始发布"

### 场景 2: 视频发布到所有平台

1. 打开"发布内容"页面
2. 勾选"YouTube"和"Twitter/X"
3. 输入文本内容
4. 上传视频文件
5. 填写 YouTube 视频信息（标题、描述、标签）
6. 点击"开始发布"

### 场景 3: Twitter 图文发布

1. 打开"发布内容"页面
2. 只勾选"Twitter/X"
3. 输入文本内容
4. 上传 1-4 张图片
5. 点击"开始发布"

### 场景 4: 多账号管理

1. 打开"账号管理"页面
2. 添加多个 YouTube 和 Twitter 账号
3. 根据需要启用/禁用特定账号
4. 发布时，只有启用的账号会收到内容

## 技术细节

### 服务器配置

- **默认端口**: 3000
- **文件上传限制**: 500MB
- **支持的视频格式**: MP4, MOV, AVI 等
- **支持的图片格式**: JPG, PNG, GIF 等

### API 端点

Web 界面使用以下 API 端点：

- `GET /api/status` - 获取账号状态
- `GET /api/accounts` - 获取所有账号
- `POST /api/accounts/youtube` - 添加 YouTube 账号
- `POST /api/accounts/twitter` - 添加 Twitter 账号
- `DELETE /api/accounts/:platform/:id` - 删除账号
- `PATCH /api/accounts/:platform/:id` - 更新账号状态
- `POST /api/test` - 测试账号连接
- `POST /api/post` - 发布内容
- `POST /api/youtube/auth-url` - 生成 YouTube 授权 URL
- `POST /api/youtube/token` - 获取 YouTube Token

### 文件存储

- 上传的文件临时存储在 `social-media-poster/uploads/` 目录
- 发布完成后自动删除临时文件
- 配置文件存储在 `social-media-poster/config/accounts.json`

## 常见问题

### 1. 无法访问 http://localhost:3000

**解决方法：**
- 确认服务器是否正在运行
- 检查端口 3000 是否被占用
- 尝试重启服务器

### 2. 发布失败

**可能原因：**
- 账号凭据无效或过期
- 文件格式不支持
- 文件大小超过限制
- 网络连接问题

**解决方法：**
- 在"状态查看"页面测试账号连接
- 检查文件格式和大小
- 查看发布结果中的错误信息

### 3. YouTube 视频上传慢

**说明：**
- 视频上传速度取决于文件大小和网络速度
- 大文件可能需要几分钟时间
- 请耐心等待，不要关闭页面

### 4. 如何更改端口？

编辑 `social-media-poster/server.js`，修改：
```javascript
const PORT = 3000; // 改为你想要的端口
```

## 安全建议

1. **不要在公网暴露这个服务**
   - 仅在本地使用（localhost）
   - 如需远程访问，使用 SSH 隧道或 VPN

2. **保护配置文件**
   - `config/accounts.json` 包含敏感信息
   - 不要提交到版本控制
   - 定期备份

3. **定期更新凭据**
   - 定期刷新 Access Token
   - 如有安全疑虑，及时删除并重新添加账号

## 特性优势

相比 CLI 工具，Web 界面提供：

✅ **更友好的用户界面** - 无需记忆命令
✅ **实时反馈** - 即时查看操作结果
✅ **拖拽上传** - 方便的文件选择
✅ **可视化管理** - 直观的账号管理
✅ **一键操作** - 点击即可完成复杂任务
✅ **结果展示** - 清晰的发布结果显示

## 下一步

- 添加你的第一个账号
- 测试账号连接
- 尝试发布内容
- 查看 [README.md](./README.md) 了解更多功能

---

**提示**: 如果遇到问题，请检查浏览器控制台的错误信息，或查看服务器终端的日志输出。
