import * as THREE from 'three';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Level } from './Level.js';
import { SVGLoader } from './SVGLoader.js';

export class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.enemies = [];
        this.level = null;
        this.svgLoader = new SVGLoader();

        this.score = 0;
        this.coins = 0;
        this.lives = 3;

        this.lastTime = 0;
        this.gameOver = false;

        this.init();
    }

    async init() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x5c94fc);

        // 创建相机
        const aspect = window.innerWidth / window.innerHeight;
        const viewHeight = 10;
        const viewWidth = viewHeight * aspect;

        this.camera = new THREE.OrthographicCamera(
            -viewWidth / 2,
            viewWidth / 2,
            viewHeight / 2,
            -viewHeight / 2,
            0.1,
            1000
        );
        this.camera.position.z = 10;

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('game-canvas').appendChild(this.renderer.domElement);

        // 处理窗口大小变化
        window.addEventListener('resize', () => this.onWindowResize());

        // 创建关卡
        this.level = new Level(this.scene, this.svgLoader);
        await this.level.buildLevel();

        // 创建玩家
        const marioTexture = await this.svgLoader.loadSVG('/assets/mario.svg');
        this.player = new Player(0, 0, marioTexture);
        this.scene.add(this.player.sprite);

        // 创建敌人
        await this.spawnEnemies();

        // 设置重新开始键
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR') {
                this.restart();
            }
        });

        // 开始游戏循环
        this.animate();
    }

    async spawnEnemies() {
        const goombaTexture = await this.svgLoader.loadSVG('/assets/goomba.svg');

        // 生成几个敌人
        const enemyPositions = [
            { x: 8, y: 0 },
            { x: 15, y: 0 },
            { x: 25, y: 0 },
            { x: 30, y: 0 }
        ];

        for (const pos of enemyPositions) {
            const enemy = new Enemy(pos.x, pos.y, goombaTexture);
            this.enemies.push(enemy);
            this.scene.add(enemy.sprite);
        }
    }

    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        const viewHeight = 10;
        const viewWidth = viewHeight * aspect;

        this.camera.left = -viewWidth / 2;
        this.camera.right = viewWidth / 2;
        this.camera.top = viewHeight / 2;
        this.camera.bottom = -viewHeight / 2;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update(deltaTime) {
        if (this.gameOver) return;

        // 更新玩家
        this.player.update(deltaTime);

        // 碰撞检测 - 地面和方块
        this.handleBlockCollisions();

        // 更新敌人
        for (const enemy of this.enemies) {
            if (enemy.alive) {
                enemy.update(deltaTime);
                this.handleEnemyBlockCollisions(enemy);
            }
        }

        // 玩家与敌人碰撞
        this.handlePlayerEnemyCollisions();

        // 相机跟随玩家
        this.updateCamera();

        // 检查玩家是否掉出地图
        if (this.player.position.y < -10) {
            this.playerDie();
        }

        // 更新UI
        this.updateUI();
    }

    handleBlockCollisions() {
        const blocks = this.level.getBlocks();
        this.player.onGround = false;

        for (const block of blocks) {
            if (this.checkBlockCollision(this.player, block)) {
                const playerBounds = this.player.getBounds();
                const blockBounds = block.bounds;

                // 计算重叠量
                const overlapLeft = playerBounds.right - blockBounds.left;
                const overlapRight = blockBounds.right - playerBounds.left;
                const overlapTop = playerBounds.top - blockBounds.bottom;
                const overlapBottom = blockBounds.top - playerBounds.bottom;

                // 找到最小重叠方向
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapBottom && this.player.velocity.y > 0) {
                    // 从下方碰撞 - 顶到方块
                    this.player.position.y = blockBounds.bottom - this.player.height / 2;
                    this.player.velocity.y = 0;
                    this.level.hitBlock(block);
                } else if (minOverlap === overlapTop && this.player.velocity.y <= 0) {
                    // 从上方碰撞 - 站在方块上
                    this.player.position.y = blockBounds.top + this.player.height / 2;
                    this.player.velocity.y = 0;
                    this.player.onGround = true;
                } else if (minOverlap === overlapLeft) {
                    // 从左侧碰撞
                    this.player.position.x = blockBounds.left - this.player.width / 2;
                } else if (minOverlap === overlapRight) {
                    // 从右侧碰撞
                    this.player.position.x = blockBounds.right + this.player.width / 2;
                }

                this.player.updateSpritePosition();
            }
        }
    }

    handleEnemyBlockCollisions(enemy) {
        const blocks = this.level.getBlocks();
        enemy.onGround = false;

        for (const block of blocks) {
            if (this.checkBlockCollision(enemy, block)) {
                const enemyBounds = enemy.getBounds();
                const blockBounds = block.bounds;

                const overlapTop = enemyBounds.top - blockBounds.bottom;
                const overlapLeft = enemyBounds.right - blockBounds.left;
                const overlapRight = blockBounds.right - enemyBounds.left;

                const minOverlap = Math.min(overlapTop, overlapLeft, overlapRight);

                if (minOverlap === overlapTop && enemy.velocity.y <= 0) {
                    enemy.position.y = blockBounds.top + enemy.height / 2;
                    enemy.velocity.y = 0;
                    enemy.onGround = true;
                } else if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                    enemy.reverseDirection();
                }

                enemy.updateSpritePosition();
            }
        }
    }

    handlePlayerEnemyCollisions() {
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;

            if (this.player.checkCollision(enemy)) {
                const playerBounds = this.player.getBounds();
                const enemyBounds = enemy.getBounds();

                // 如果玩家从上方踩到敌人
                if (playerBounds.bottom >= enemyBounds.top - 0.2 && this.player.velocity.y < 0) {
                    enemy.squash();
                    this.player.velocity.y = 8; // 小跳
                    this.score += 100;
                } else {
                    // 玩家受伤
                    this.playerDie();
                }
            }
        }
    }

    checkBlockCollision(entity, block) {
        const bounds = entity.getBounds();
        return !(bounds.right < block.bounds.left ||
                 bounds.left > block.bounds.right ||
                 bounds.top < block.bounds.bottom ||
                 bounds.bottom > block.bounds.top);
    }

    updateCamera() {
        // 相机跟随玩家,但不会向左移动
        const targetX = Math.max(0, this.player.position.x);
        this.camera.position.x = targetX;
    }

    playerDie() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver = true;
            alert('游戏结束! 按 R 重新开始');
        } else {
            // 重置玩家位置
            this.player.position.set(0, 0);
            this.player.velocity.set(0, 0);
            this.camera.position.x = 0;
        }
    }

    updateUI() {
        document.getElementById('score').textContent = String(this.score).padStart(6, '0');
        document.getElementById('coins').textContent = String(this.coins).padStart(2, '0');
        document.getElementById('lives').textContent = this.lives;
    }

    animate(currentTime = 0) {
        requestAnimationFrame((time) => this.animate(time));

        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        if (deltaTime > 0) {
            this.update(deltaTime);
        }

        this.renderer.render(this.scene, this.camera);
    }

    async restart() {
        // 清理场景
        this.enemies.forEach(enemy => enemy.destroy());
        this.enemies = [];

        // 重置游戏状态
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.gameOver = false;

        // 重置玩家
        this.player.position.set(0, 0);
        this.player.velocity.set(0, 0);
        this.player.alive = true;
        this.camera.position.x = 0;

        // 重新生成敌人
        await this.spawnEnemies();

        this.updateUI();
    }
}
