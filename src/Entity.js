import * as THREE from 'three';

export class Entity {
    constructor(x, y, width, height, texture) {
        this.position = new THREE.Vector2(x, y);
        this.velocity = new THREE.Vector2(0, 0);
        this.width = width;
        this.height = height;
        this.onGround = false;
        this.alive = true;

        // 创建精灵
        const material = new THREE.SpriteMaterial({ map: texture });
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(width, height, 1);
        this.updateSpritePosition();
    }

    updateSpritePosition() {
        this.sprite.position.set(this.position.x, this.position.y, 0);
    }

    getBounds() {
        return {
            left: this.position.x - this.width / 2,
            right: this.position.x + this.width / 2,
            top: this.position.y + this.height / 2,
            bottom: this.position.y - this.height / 2
        };
    }

    checkCollision(other) {
        const a = this.getBounds();
        const b = other.getBounds();

        return !(a.right < b.left ||
                 a.left > b.right ||
                 a.top < b.bottom ||
                 a.bottom > b.top);
    }

    update(deltaTime) {
        // 基础更新逻辑
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.updateSpritePosition();
    }

    destroy() {
        this.alive = false;
        if (this.sprite.parent) {
            this.sprite.parent.remove(this.sprite);
        }
    }
}
