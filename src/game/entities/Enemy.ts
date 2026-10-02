import { Container, Sprite, Graphics, AnimatedSprite, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../config';
import { checkShipCollision } from '../utils/collision';

export abstract class Enemy extends Container {
    public hp: number;
    public maxHp: number;
    public isDead = false;
    public speed: number;
    public rotationSpeed: number;

    protected shipSprite: Sprite;
    protected textures: Texture[] = [];
    private healthBar: Graphics;
    private fireSprite: AnimatedSprite;
    private hitFlashTimer = 0;

    constructor(
        textureOrTextures: Texture | Texture[],
        fireTextures: Texture[],
        x: number,
        y: number,
        maxHp: number = 50,
        speed: number = 80
    ) {
        super();

        this.x = x;
        this.y = y;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.speed = speed;
        this.rotationSpeed = GAME_CONFIG.SHIP_ROTATION_SPEED * 0.8;

        if (Array.isArray(textureOrTextures)) {
            this.textures = textureOrTextures;
        } else {
            this.textures = [textureOrTextures];
        };

        this.shipSprite = new Sprite(this.textures[0]);
        this.shipSprite.anchor.set(0.5);
        this.addChild(this.shipSprite);
        
        this.shipSprite.rotation = Math.PI;
        this.shipSprite.scale.set(0.7);

        this.fireSprite = new AnimatedSprite(fireTextures);
        this.fireSprite.anchor.set(0.5);
        this.fireSprite.scale.set(1.2);
        this.fireSprite.animationSpeed = 0.12;
        this.fireSprite.visible = false;
        this.shipSprite.addChild(this.fireSprite);

        this.healthBar = new Graphics();
        this.addChild(this.healthBar);
        this.updateHealthBar();
    }

    public takeDamage(amount: number) {
        this.hp -= amount;

        this.shipSprite.tint = 0xff4444;
        this.hitFlashTimer = 0.12;

        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
        };

        this.updateHealthBar();

        if (this.hp / this.maxHp <= 0.5 && !this.fireSprite.visible) {
            this.fireSprite.visible = true;
            this.fireSprite.play();
        };
    };

    private updateDamageState() {
        if (this.textures.length < 2) return;

        const ratio = this.hp / this.maxHp;

        if (this.textures.length >= 3) {
            if (ratio > 0.66) {
                this.shipSprite.texture = this.textures[0];
            } else if (ratio > 0.33) {
                this.shipSprite.texture = this.textures[1];
            } else {
                this.shipSprite.texture = this.textures[2];
            };
        } else if (this.textures.length === 2) {
            if (ratio > 0.5) {
                this.shipSprite.texture = this.textures[0];
            } else {
                this.shipSprite.texture = this.textures[1];
            };
        };
    };

    private updateHealthBar() {
        this.healthBar.clear();

        const barWidth = 36;
        const barHeight = 5;
        const xOffset = -barWidth / 2;
        const yOffset = -40;

        this.healthBar.rect(xOffset - 1, yOffset - 1, barWidth + 2, barHeight + 2);
        this.healthBar.fill({ color: 0x000000, alpha: 0.7 });

        this.healthBar.rect(xOffset, yOffset, barWidth, barHeight);
        this.healthBar.fill({ color: 0x550000 });

        const currentWidth = Math.max(0, (this.hp / this.maxHp) * barWidth);
        if (currentWidth > 0) {
            this.healthBar.rect(xOffset, yOffset, currentWidth, barHeight);
            this.healthBar.fill({ color: 0xef4444 });
        };
    };

    protected rotateTowards(targetX: number, targetY: number, deltaSeconds: number) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;

        let diff = targetAngle - this.rotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        this.rotation += Math.sign(diff) * Math.min(Math.abs(diff), this.rotationSpeed * deltaSeconds);
    };

    protected moveForward(deltaSeconds: number) {
        const dx = Math.sin(this.rotation) * this.speed * deltaSeconds;
        const dy = -Math.cos(this.rotation) * this.speed * deltaSeconds;

        const nextX = this.x + dx;
        const nextY = this.y + dy;

        if (!checkShipCollision(nextX, nextY)) {
            this.x = Math.max(25, Math.min(GAME_CONFIG.CANVAS_WIDTH - 25, nextX));
            this.y = Math.max(25, Math.min(GAME_CONFIG.CANVAS_HEIGHT - 25, nextY));
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public update(deltaSeconds: number, _playerX: number, _playerY: number) {
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaSeconds;
            if (this.hitFlashTimer <= 0) {
                this.shipSprite.tint = 0xffffff;
            };
        };

        this.healthBar.rotation = -this.rotation;
    };
};