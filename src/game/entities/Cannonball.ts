import { Container, Sprite, Texture } from 'pixi.js';
import { isPointSolid } from '../utils/collision';
import { ExplosionEffect } from './ExplosionEffect';
import { sound } from "../utils/SoundManager";

export class Cannonball extends Sprite {
    private speed = 500;
    private lifespan = 0.6;
    public isDead = false;
    private explosionTextures: Texture[];
    private appStage: Container;

    constructor(
        texture: Texture,
        x: number, y: number,
        rotation: number,
        explosionTextures: Texture[],
        appStage: Container
    ) {
        super(texture);

        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.scale.set(1.3);
        this.explosionTextures = explosionTextures;
        this.appStage = appStage;
    }

    public update(deltaSeconds: number) {
        if (this.isDead) return;

        this.lifespan -= deltaSeconds;
        if (this.lifespan <= 0) {
            sound.play('water_hit', 0.4);
            this.isDead = true;
            return;
        }

        const dx = Math.sin(this.rotation) * this.speed * deltaSeconds;
        const dy = -Math.cos(this.rotation) * this.speed * deltaSeconds;

        this.x += dx;
        this.y += dy;

        if (isPointSolid(this.x, this.y)) {
            const explosion = new ExplosionEffect(
                this.explosionTextures,
                this.x,
                this.y,
                this.rotation
            );
            this.appStage.addChild(explosion);

            this.isDead = true;
        }
    }
}