import { Entity } from './Entity.js';
import * as THREE from 'three';

export class Player extends Entity {
    constructor(x, y, texture) {
        super(x, y, 1, 1, texture);

        this.moveSpeed = 5;
        this.jumpSpeed = 12;
        this.gravity = -25;
        this.maxFallSpeed = -20;

        this.keys = {
            left: false,
            right: false,
            jump: false
        };

        this.canJump = true;
        this.facing = 1; // 1 = 右, -1 = 左

        this.setupControls();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = true;
                    break;
                case 'Space':
                case 'ArrowUp':
                case 'KeyW':
                    this.keys.jump = true;
                    e.preventDefault();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = false;
                    break;
                case 'Space':
                case 'ArrowUp':
                case 'KeyW':
                    this.keys.jump = false;
                    break;
            }
        });
    }

    update(deltaTime) {
        // 水平移动
        if (this.keys.left) {
            this.velocity.x = -this.moveSpeed;
            this.facing = -1;
            this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
        } else if (this.keys.right) {
            this.velocity.x = this.moveSpeed;
            this.facing = 1;
            this.sprite.scale.x = Math.abs(this.sprite.scale.x);
        } else {
            this.velocity.x = 0;
        }

        // 跳跃
        if (this.keys.jump && this.onGround && this.canJump) {
            this.velocity.y = this.jumpSpeed;
            this.onGround = false;
            this.canJump = false;
        }

        if (!this.keys.jump) {
            this.canJump = true;
        }

        // 应用重力
        if (!this.onGround) {
            this.velocity.y += this.gravity * deltaTime;
            this.velocity.y = Math.max(this.velocity.y, this.maxFallSpeed);
        }

        super.update(deltaTime);
    }

    die() {
        this.alive = false;
        // 死亡动画
        this.velocity.y = 10;
    }
}
