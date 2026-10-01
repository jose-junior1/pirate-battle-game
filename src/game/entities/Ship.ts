import { Container, Sprite, Texture } from "pixi.js";
import { GAME_CONFIG } from "../config";
import { checkShipCollision } from "../utils/collision";

export class Ship extends Container {
    public speed = GAME_CONFIG.SHIP_SPEED;
    public rotationSpeed = GAME_CONFIG.SHIP_ROTATION_SPEED;
    private keys: Record<string, boolean> = {};
    private sprite: Sprite;

    private handleKeyDown = (e: KeyboardEvent) => (this.keys[e.code] = true);
    private handleKeyUp = (e: KeyboardEvent) => (this.keys[e.code] = false);

    constructor(texture: Texture) {
        super();

        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.rotation = Math.PI;
        this.sprite.scale.set(0.5);

        this.addChild(this.sprite);

        this.x = GAME_CONFIG.CANVAS_WIDTH / 3;
        this.y = GAME_CONFIG.CANVAS_HEIGHT / 2;
        this.setupInputs();
    };

    private setupInputs() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    };

    public update(deltaSeconds: number) {
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

    public destroy(options?: any) {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        super.destroy(options);
    };
};