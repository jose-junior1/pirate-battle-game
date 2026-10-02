import { Container, Texture } from 'pixi.js';
import { Enemy } from './Enemy';
import { ChaserEnemy } from './ChaserEnemy';
import { ShooterEnemy } from './ShooterEnemy';
import { Cannonball } from './Cannonball';
import { Ship, type ShotInfo } from './Ship';
import { sound } from '../utils/SoundManager';
import { GAME_CONFIG } from '../config';
import { checkShipCollision } from '../utils/collision';
import { ExplosionEffect } from "./ExplosionEffect";

export interface EnemyTextures {
    chaser: Texture[];
    shooter: Texture[];
    explosions: Texture[];
    fire: Texture[];
};

export class EnemyManager {
    public enemies: Enemy[] = [];
    private stage: Container;
    private textures: EnemyTextures;

    private spawnTimer = 0;
    private spawnInterval = 5;
    private maxEnemies = 6;

    public onEnemyShoot?: (shot: ShotInfo) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEnemyDestroyed!: (points: any) => void;

    constructor(stage: Container, textures: EnemyTextures) {
        this.stage = stage;
        this.textures = textures;
    };

    public update(
        deltaSeconds: number,
        player: Ship,
        playerCannonballs: Cannonball[]
    ) {
        this.spawnTimer += deltaSeconds;
        if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        };

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaSeconds, player.x, player.y);
            
            let killedByPlayer = false;

            if (enemy instanceof ChaserEnemy && !enemy.isDead) {
                enemy.checkPlayerCollision(player);
            };

            if (!enemy.isDead) {
                for (let j = playerCannonballs.length - 1; j >= 0; j--) {
                    const ball = playerCannonballs[j];
                    if (ball.isDead) continue;

                    const dist = Math.hypot(enemy.x - ball.x, enemy.y - ball.y);
                    if (dist < 25) {
                        ball.isDead = true;
                        enemy.takeDamage(25);

                        if (enemy.isDead) {
                            killedByPlayer = true;
                            break;
                        };
                    };
                };
            };

            if (enemy.isDead) {
                sound.play('ship_explosion_1', 0.5);
                this.createExplosion(enemy.x, enemy.y);

                if (killedByPlayer && this.onEnemyDestroyed) {
                    this.onEnemyDestroyed(1);
                };

                this.stage.removeChild(enemy);
                enemy.destroy();
                this.enemies.splice(i, 1);
            };
        };

        this.resolveShipCollisions(player);
    };

    private resolveShipCollisions(player: Ship) {
        const MIN_DIST = 60;

        const applyDisplacement = (entity: { x: number; y: number }, dx: number, dy: number) => {
            const targetX = Math.max(25, Math.min(GAME_CONFIG.CANVAS_WIDTH - 25, entity.x + dx));
            const targetY = Math.max(25, Math.min(GAME_CONFIG.CANVAS_HEIGHT - 25, entity.y + dy));

            if (!checkShipCollision(targetX, entity.y)) {
                entity.x = targetX;
            };

            if (!checkShipCollision(entity.x, targetY)) {
                entity.y = targetY;
            };
        };

        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            if (enemy.isDead) continue;

            if (enemy instanceof ShooterEnemy) {
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                const dist = Math.hypot(dx, dy);

                if (dist < MIN_DIST && dist > 0) {
                    const overlap = MIN_DIST - dist;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const pushAmount = overlap * 0.5;

                    applyDisplacement(player, -nx * pushAmount, -ny * pushAmount);
                    applyDisplacement(enemy, nx * pushAmount, ny * pushAmount);
                };
            };

            for (let j = i + 1; j < this.enemies.length; j++) {
                const enemyB = this.enemies[j];
                if (enemyB.isDead) continue;

                const dx = enemyB.x - enemy.x;
                const dy = enemyB.y - enemy.y;
                const dist = Math.hypot(dx, dy);

                if (dist < MIN_DIST && dist > 0) {
                    const overlap = MIN_DIST - dist;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const pushAmount = overlap * 0.5;

                    applyDisplacement(enemy, -nx * pushAmount, -ny * pushAmount);
                    applyDisplacement(enemyB, nx * pushAmount, ny * pushAmount);
                };
            };
        };
    };

    private createExplosion(x: number, y: number) {
        if (this.textures.explosions && this.textures.explosions.length > 0) {
            const explosion = new ExplosionEffect(this.textures.explosions, x, y, 1.2);
            this.stage.addChild(explosion);
        };
    };

    private spawnEnemy() {
        let x = 0;
        let y = 0;
        let attempts = 0;
        let validPosition = false;

        while (!validPosition && attempts < 30) {
            attempts++;
            const side = Math.floor(Math.random() * 4);

            switch (side) {
                case 0: x = Math.random() * GAME_CONFIG.CANVAS_WIDTH; y = 30; break;
                case 1: x = GAME_CONFIG.CANVAS_WIDTH - 30; y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT; break;
                case 2: x = Math.random() * GAME_CONFIG.CANVAS_WIDTH; y = GAME_CONFIG.CANVAS_HEIGHT - 30; break;
                case 3: x = 30; y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT; break;
            };

            if (!checkShipCollision(x, y)) {
                validPosition = true;
            };
        };

        if (!validPosition) return;

        const isChaser = Math.random() > 0.5;
        let enemy: Enemy;

        if (isChaser) {
            enemy = new ChaserEnemy(this.textures.chaser, this.textures.fire, x, y);
        } else {
            const shooter = new ShooterEnemy(this.textures.shooter, this.textures.fire, x, y);
            shooter.onShoot = (shot) => {
                sound.play('cannon_fire_1', 0.4);
                if (this.onEnemyShoot) this.onEnemyShoot(shot);
            };
            enemy = shooter;
        };

        this.enemies.push(enemy);
        this.stage.addChild(enemy);
    };
};