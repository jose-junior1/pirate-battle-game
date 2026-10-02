import { Texture } from 'pixi.js';
import { Enemy } from './Enemy';
import { Ship } from './Ship';

export class ChaserEnemy extends Enemy {
    private explosionDamage = 25;

    constructor(textureOrTextures: Texture | Texture[], fireTextures: Texture[], startX: number, startY: number) {
        super(textureOrTextures, fireTextures, startX, startY, 40, 110);
    };

    public update(deltaSeconds: number, targetX: number, targetY: number) {
        if (this.isDead) return;

        super.update(deltaSeconds, targetX, targetY);
        this.rotateTowards(targetX, targetY, deltaSeconds);
        this.moveForward(deltaSeconds);
    };

    public checkPlayerCollision(player: Ship): boolean {
        if (this.isDead || player.isDead) return false;

        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < 26) {
            player.takeDamage(this.explosionDamage);
            this.isDead = true;
            return true;
        };
        return false;
    };
};