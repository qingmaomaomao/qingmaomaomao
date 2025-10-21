# 2D Super Mario - Three.js

基于 Three.js 构建的 2D 超级马里奥游戏,使用 SVG 作为游戏资产。

## 特性

- 使用 Three.js 进行 2D 渲染
- 像素风格的 SVG 游戏资产
- 经典的马里奥游戏机制:
  - 跳跃和移动控制
  - 物理引擎(重力、碰撞检测)
  - 敌人 AI
  - 可交互的方块
  - 关卡设计

## 游戏资产

所有游戏资产都使用 SVG 格式,包括:

- `mario.svg` - 马里奥角色
- `brick.svg` - 砖块
- `question-block.svg` - 问号方块
- `goomba.svg` - 蘑菇怪(敌人)
- `pipe.svg` - 管道
- `cloud.svg` - 云朵
- `ground.svg` - 地面

## 安装和运行

1. 安装依赖:
```bash
npm install
```

2. 启动开发服务器:
```bash
npm run dev
```

3. 在浏览器中打开显示的 URL(通常是 `http://localhost:5173`)

## 游戏控制

- **方向键** 或 **WASD** - 左右移动
- **空格键** 或 **向上箭头** - 跳跃
- **R 键** - 重新开始游戏

## 项目结构

```
mario-2d-threejs/
├── assets/              # SVG 游戏资产
│   ├── mario.svg
│   ├── brick.svg
│   ├── question-block.svg
│   ├── goomba.svg
│   ├── pipe.svg
│   ├── cloud.svg
│   └── ground.svg
├── src/                 # 源代码
│   ├── main.js         # 入口文件
│   ├── Game.js         # 游戏主类
│   ├── Player.js       # 玩家类
│   ├── Enemy.js        # 敌人类
│   ├── Entity.js       # 实体基类
│   ├── Level.js        # 关卡类
│   └── SVGLoader.js    # SVG 加载器
├── index.html          # HTML 入口
└── package.json        # 项目配置
```

## 技术栈

- **Three.js** - 3D/2D 渲染引擎
- **Vite** - 构建工具和开发服务器
- **原生 JavaScript (ES6+)** - 游戏逻辑
- **SVG** - 游戏资产格式

## 游戏机制

### 物理系统

- 重力加速度
- 跳跃力学
- 碰撞检测和响应
- 平台物理

### 实体系统

- 玩家控制
- 敌人 AI(巡逻、转向)
- 碰撞交互(踩踏敌人)

### 关卡设计

- 方块平台
- 问号方块(可互动)
- 装饰元素(云朵、管道)
- 敌人生成点

## 游戏玩法

1. 控制马里奥在关卡中移动
2. 跳跃躲避或踩踏敌人
3. 从下方顶撞问号方块获得奖励
4. 收集金币提高分数
5. 避免掉落或被敌人击中

## 开发计划

未来可能添加的功能:

- [ ] 更多敌人类型
- [ ] 能量提升道具(蘑菇、火焰花)
- [ ] 音效和背景音乐
- [ ] 更多关卡
- [ ] 存档系统
- [ ] 移动端触摸控制

## 许可证

MIT License
