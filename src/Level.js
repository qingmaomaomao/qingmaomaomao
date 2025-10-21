import * as THREE from 'three';

export class Level {
    constructor(scene, svgLoader) {
        this.scene = scene;
        this.svgLoader = svgLoader;
        this.blocks = [];
        this.decorations = [];
    }

    async createBlock(x, y, type) {
        let texturePath;
        switch(type) {
            case 'brick':
                texturePath = '/assets/brick.svg';
                break;
            case 'question':
                texturePath = '/assets/question-block.svg';
                break;
            case 'ground':
                texturePath = '/assets/ground.svg';
                break;
            default:
                texturePath = '/assets/ground.svg';
        }

        const texture = await this.svgLoader.loadSVG(texturePath);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1, 1, 1);
        sprite.position.set(x, y, -0.1);

        this.scene.add(sprite);

        const block = {
            sprite,
            position: { x, y },
            type,
            bounds: {
                left: x - 0.5,
                right: x + 0.5,
                top: y + 0.5,
                bottom: y - 0.5
            },
            active: type === 'question'
        };

        this.blocks.push(block);
        return block;
    }

    async createDecoration(x, y, type) {
        let texturePath;
        let scale;

        switch(type) {
            case 'cloud':
                texturePath = '/assets/cloud.svg';
                scale = { x: 2, y: 1 };
                break;
            case 'pipe':
                texturePath = '/assets/pipe.svg';
                scale = { x: 2, y: 4 };
                break;
            default:
                return;
        }

        const texture = await this.svgLoader.loadSVG(texturePath);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(scale.x, scale.y, 1);
        sprite.position.set(x, y, -0.2);

        this.scene.add(sprite);
        this.decorations.push({ sprite, position: { x, y }, type });
    }

    async buildLevel() {
        // 创建地面
        for (let i = -20; i < 100; i++) {
            await this.createBlock(i, -5, 'ground');
        }

        // 创建一些平台
        for (let i = 5; i < 10; i++) {
            await this.createBlock(i, -1, 'brick');
        }

        // 问号块
        await this.createBlock(7, 2, 'question');
        await this.createBlock(12, 2, 'question');
        await this.createBlock(15, 5, 'question');

        // 更多砖块
        for (let i = 10; i < 15; i++) {
            await this.createBlock(i, -1, 'brick');
        }

        for (let i = 18; i < 22; i++) {
            await this.createBlock(i, 2, 'brick');
        }

        // 阶梯
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j <= i; j++) {
                await this.createBlock(25 + i, -4 + j, 'brick');
            }
        }

        // 云朵装饰
        await this.createDecoration(3, 7, 'cloud');
        await this.createDecoration(15, 8, 'cloud');
        await this.createDecoration(30, 7, 'cloud');

        // 管道
        await this.createDecoration(20, -3, 'pipe');
        await this.createDecoration(35, -3, 'pipe');
    }

    getBlocks() {
        return this.blocks;
    }

    hitBlock(block) {
        if (block.type === 'question' && block.active) {
            // 播放动画
            const originalY = block.sprite.position.y;
            block.sprite.position.y += 0.2;
            setTimeout(() => {
                block.sprite.position.y = originalY;
            }, 100);

            // 变为已使用的砖块
            block.active = false;
            this.svgLoader.loadSVG('/assets/brick.svg').then(texture => {
                block.sprite.material.map = texture;
                block.sprite.material.needsUpdate = true;
            });

            return true; // 返回奖励
        }
        return false;
    }
}
