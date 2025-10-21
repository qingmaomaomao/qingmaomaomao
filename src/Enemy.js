import { Entity } from './Entity.js';

export class Enemy extends Entity {
    constructor(x, y, texture) {
        super(x, y, 1, 1, texture);

        this.moveSpeed = 2;
        this.velocity.x = -this.moveSpeed;
        this.direction = -1;
    }

    update(deltaTime) {
        // 敌人水平移动
        this.velocity.x = this.direction * this.moveSpeed;

        // 应用简单的重力
        if (!this.onGround) {
            this.velocity.y += -25 * deltaTime;
        }

        super.update(deltaTime);
    }

    reverseDirection() {
        this.direction *= -1;
    }

    squash() {
        this.alive = false;
        this.sprite.scale.y = 0.2;
        setTimeout(() => this.destroy(), 200);
    }
}
