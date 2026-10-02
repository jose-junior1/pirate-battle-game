import { Container, Sprite, Texture } from "pixi.js";
import { GAME_CONFIG } from "../config";
import { checkShipCollision } from "../utils/collision";
import { sound } from "../utils/SoundManager";

export interface ShotInfo {
    x: number;
    y: number;
    rotation: number;
};

export class Ship extends Container {
    public speed = GAME_CONFIG.SHIP_SPEED;
    public rotationSpeed = GAME_CONFIG.SHIP_ROTATION_SPEED;

    public maxHp = 100;
    public currentHp = 100;
    public isDead = false;

    private keys: Record<string, boolean> = {};
    private sprite: Sprite;
    private textures: Texture[] = [];
    private hitFlashTimer = 0;

    private broadsideCooldownLeft = 0;
    private broadsideCooldownRight = 0;
    private frontShootCooldown = 0;
    private fireRate = 0.60;

    public onShoot?: (shots: ShotInfo[]) => void;
    public onHpChange?: (currentHp: number, maxHp: number) => void;

    private handleKeyDown = (e: KeyboardEvent) => (this.keys[e.code] = true);
    private handleKeyUp = (e: KeyboardEvent) => (this.keys[e.code] = false);

    constructor(textureOrTextures: Texture | Texture[]) {
        super();

        if (Array.isArray(textureOrTextures)) {
            this.textures = textureOrTextures;
        } else {
            this.textures = [textureOrTextures];
        }

        this.sprite = new Sprite(this.textures[0]);
        this.sprite.anchor.set(0.5);
        this.sprite.rotation = Math.PI;
        this.sprite.scale.set(0.7);

        this.addChild(this.sprite);

        this.x = GAME_CONFIG.CANVAS_WIDTH / 3;
        this.y = GAME_CONFIG.CANVAS_HEIGHT / 2;
        this.setupInputs();
    };

    private setupInputs() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    };

    public takeDamage(amount: number) {
        if (this.isDead) return;

        this.currentHp = Math.max(0, this.currentHp - amount);

        this.sprite.tint = 0xff4444;
        this.hitFlashTimer = 0.12;

        this.updateDamageState();

        if (this.onHpChange) {
            this.onHpChange(this.currentHp, this.maxHp);
        };

        if (this.currentHp <= 0) {
            this.isDead = true;
        };
    };

    private updateDamageState() {
        if (this.textures.length < 2) return;

        const ratio = this.currentHp / this.maxHp;

        if (this.textures.length >= 3) {
            if (ratio > 0.66) {
                this.sprite.texture = this.textures[0];
            } else if (ratio > 0.33) {
                this.sprite.texture = this.textures[1];
            } else {
                this.sprite.texture = this.textures[2];
            };
        } else if (this.textures.length === 2) {
            if (ratio > 0.5) {
                this.sprite.texture = this.textures[0];
            } else {
                this.sprite.texture = this.textures[1];
            };
        };
    };

    private createBroadsideShots(side: 'left' | 'right'): ShotInfo[] {
        const shots: ShotInfo[] = [];

        const forwardX = Math.sin(this.rotation);
        const forwardY = -Math.cos(this.rotation);

        const baseSideAngle = side === 'left' ? this.rotation - Math.PI / 2 : this.rotation + Math.PI / 2;
        const sideX = Math.sin(baseSideAngle);
        const sideY = -Math.cos(baseSideAngle);

        const sideOffset = 18;
        const cannonSpacing = 4;
        const spreadAngle = 0.16;

        for (let i = -1; i <= 1; i++) {
            const shotX = this.x + (sideX * sideOffset) + (forwardX * i * cannonSpacing);
            const shotY = this.y + (sideY * sideOffset) + (forwardY * i * cannonSpacing);

            const shotRotation = baseSideAngle + (i * spreadAngle);

            shots.push({
                x: shotX,
                y: shotY,
                rotation: shotRotation,
            });
        };

        return shots;
    };

    public update(deltaSeconds: number) {
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaSeconds;
            if (this.hitFlashTimer <= 0) {
                this.sprite.tint = 0xffffff;
            }
        }

        if (this.frontShootCooldown > 0) this.frontShootCooldown -= deltaSeconds;
        if (this.broadsideCooldownLeft > 0) this.broadsideCooldownLeft -= deltaSeconds;
        if (this.broadsideCooldownRight > 0) this.broadsideCooldownRight -= deltaSeconds;

        if (this.keys['Space'] && this.frontShootCooldown <= 0) {
            if (this.onShoot) {
                sound.play('cannon_fire_1', 0.5);
                this.onShoot([{ x: this.x, y: this.y, rotation: this.rotation }]);
            }
            this.frontShootCooldown = this.fireRate;
        }

        if (this.keys['KeyQ'] && this.broadsideCooldownLeft <= 0) {
            if (this.onShoot) {
                sound.play('cannon_broadside', 0.6);
                this.onShoot(this.createBroadsideShots('left'));
            }
            this.broadsideCooldownLeft = this.fireRate;
        }

        if (this.keys['KeyE'] && this.broadsideCooldownRight <= 0) {
            if (this.onShoot) {
                sound.play('cannon_broadside', 0.6);
                this.onShoot(this.createBroadsideShots('right'));
            }
            this.broadsideCooldownRight = this.fireRate;
        }

        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            this.rotation -= this.rotationSpeed * deltaSeconds;
        };

        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            this.rotation += this.rotationSpeed * deltaSeconds;
        };

        let dx = 0;
        let dy = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            dx += Math.sin(this.rotation) * this.speed * deltaSeconds;
            dy -= Math.cos(this.rotation) * this.speed * deltaSeconds;
        };

        if (dx !== 0) {
            const nextX = this.x + dx;
            const boundedX = Math.max(25, Math.min(GAME_CONFIG.CANVAS_WIDTH - 25, nextX));

            if (!checkShipCollision(boundedX, this.y)) {
                this.x = boundedX;
            }
        }

        if (dy !== 0) {
            const nextY = this.y + dy;
            const boundedY = Math.max(25, Math.min(GAME_CONFIG.CANVAS_HEIGHT - 25, nextY));

            if (!checkShipCollision(this.x, boundedY)) {
                this.y = boundedY;
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public destroy(options?: any) {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        super.destroy(options);
    };
};