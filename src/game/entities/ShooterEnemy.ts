import { Texture } from 'pixi.js';
import { Enemy } from './Enemy';
import type { ShotInfo } from './Ship';

export class ShooterEnemy extends Enemy {
    private attackRange = 220;
    private shootCooldown = 0;
    private fireRate = 2.0;

    public onShoot?: (shot: ShotInfo) => void;

    constructor(textureOrTextures: Texture | Texture[], fireTextures: Texture[], startX: number, startY: number) {
        super(textureOrTextures, fireTextures, startX, startY, 60, 75);
    };

    public update(deltaSeconds: number, targetX: number, targetY: number) {
        if (this.isDead) return;

        super.update(deltaSeconds, targetX, targetY);

        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaSeconds;
        };

        const dist = Math.hypot(targetX - this.x, targetY - this.y);

        this.rotateTowards(targetX, targetY, deltaSeconds);

        if (dist > this.attackRange) {
            this.moveForward(deltaSeconds);
        } else {
            if (this.shootCooldown <= 0) {
                if (this.onShoot) {
                    this.onShoot({
                        x: this.x,
                        y: this.y,
                        rotation: this.rotation,
                    });
                };
                this.shootCooldown = this.fireRate;
            };
        };
    };
};