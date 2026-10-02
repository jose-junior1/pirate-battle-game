import { Application, Assets, Container, Texture } from 'pixi.js';

import { GAME_CONFIG, ISLAND_GRID } from './config';
import { Ship } from './entities/Ship';
import { WaterBackground } from './entities/WaterBackground';
import { IslandMap } from './entities/IslandMap';
import { Cannonball } from "./entities/Cannonball";
import { sound } from "./utils/SoundManager";
import { HUD } from './ui/HUD';
import { EnemyManager } from './entities/EnemyManager';
import { ExplosionEffect } from './entities/ExplosionEffect';

export class GameEngine {
    public app: Application;
    private isDestroyed = false;
    private isPaused = false;

    private gameLayer = new Container();
    private uiLayer = new Container();

    private waterBackground?: WaterBackground;
    private playerShip?: Ship;

    private playerCannonballs: Cannonball[] = [];
    private enemyCannonballs: Cannonball[] = [];

    private cannonballTexture?: Texture;
    private explosionTextures: Texture[] = [];
    private fireTextures: Texture[] = [];
    private enemyManager?: EnemyManager;
    private hud?: HUD;

    constructor() {
        this.app = new Application();
    };

    private async loadTileTextures(grid: number[][]): Promise<Map<number, Texture>> {
        const uniqueIds = Array.from(new Set(grid.flat())).filter((id) => id > 0);
        const textureMap = new Map<number, Texture>();

        await Promise.all(
            uniqueIds.map(async (id) => {
                const texture = await Assets.load(`/assets/png/default/tiles/tile_${id}.png`);
                textureMap.set(id, texture);
            })
        );

        return textureMap;
    };

    public async init(container: HTMLDivElement) {
        sound.setupAudioUnlock();

        sound.load('cannon_fire_1', '/assets/sounds/cannon_fire_1.wav');
        sound.load('cannon_broadside', '/assets/sounds/cannon_broadside.wav');
        sound.load('ship_explosion_1', '/assets/sounds/ship_explosion_1.wav');
        sound.load('water_hit', '/assets/sounds/cannonball_water_hit_1.wav');
        sound.load('ocean_ambience', '/assets/sounds/ocean_ambience_loop.wav');

        const [
            shipTex1, shipTex2, shipTex3,
            shooterTex1, shooterTex2, shooterTex3,
            chaserTex1, chaserTex2,
            waterTexture,
            cannonballTex,
            tileTextures,
            explosion1Tex,
            explosion2Tex,
            explosion3Tex,
            fire1Tex,
            fire2Tex,
            hudFrame,
            hudHeart,
            hudCounterPanel,
            hudIconScore,
            hudIconTime,
            hudBtnNormal,
            hudBtnHover,
            hudBtnPressed,
            hudIconPause,
            hudIconPlay
        ] = await Promise.all([
            // Player textures
            Assets.load('/assets/png/default/ships/ship_1.png'),
            Assets.load('/assets/png/default/ships/ship_7.png'),
            Assets.load('/assets/png/default/ships/ship_13.png'),

            // Shooter enemy textures
            Assets.load('/assets/png/default/ships/ship_3.png'),
            Assets.load('/assets/png/default/ships/ship_9.png'),
            Assets.load('/assets/png/default/ships/ship_15.png'),

            // Chaser enemy textures
            Assets.load('/assets/png/default/ships/ship_22.png'),
            Assets.load('/assets/png/default/ships/ship_19.png'),

            Assets.load('/assets/png/default/tiles/tile_73.png'),
            Assets.load('/assets/png/default/ship_parts/cannon_ball.png'),
            this.loadTileTextures(ISLAND_GRID),
            Assets.load('/assets/png/default/effects/explosion_1.png'),
            Assets.load('/assets/png/default/effects/explosion_2.png'),
            Assets.load('/assets/png/default/effects/explosion_3.png'),
            Assets.load('/assets/png/default/effects/fire_1.png'),
            Assets.load('/assets/png/default/effects/fire_2.png'),
            Assets.load('/assets/png/default/ui/hud/health_frame.png'),
            Assets.load('/assets/png/default/ui/hud/icon_heart.png'),
            Assets.load('/assets/png/default/ui/hud/counter_panel.png'),
            Assets.load('/assets/png/default/ui/hud/icon_score.png'),
            Assets.load('/assets/png/default/ui/hud/icon_time.png'),
            Assets.load('/assets/png/default/ui/controls/button_round_normal.png'),
            Assets.load('/assets/png/default/ui/controls/button_round_hover.png'),
            Assets.load('/assets/png/default/ui/controls/button_round_pressed.png'),
            Assets.load('/assets/png/default/ui/controls/icon_pause.png'),
            Assets.load('/assets/png/default/ui/controls/icon_play.png'),
        ]);

        await this.app.init({
            width: GAME_CONFIG.CANVAS_WIDTH,
            height: GAME_CONFIG.CANVAS_HEIGHT,
            backgroundColor: 0x0f172a,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        if (this.isDestroyed) {
            this.app.destroy(true, { children: true });
            return;
        };

        container.appendChild(this.app.canvas);

        sound.playLoop('ocean_ambience', 0.15);

        if (this.isDestroyed) return;

        this.app.stage.addChild(this.gameLayer);
        this.app.stage.addChild(this.uiLayer);

        this.cannonballTexture = cannonballTex;
        this.explosionTextures = [explosion1Tex, explosion2Tex, explosion3Tex];
        this.fireTextures = [fire1Tex, fire2Tex];

        this.enemyManager = new EnemyManager(this.gameLayer, {
            chaser: [chaserTex1, chaserTex2],
            shooter: [shooterTex1, shooterTex2, shooterTex3],
            explosions: this.explosionTextures,
            fire: this.fireTextures,
        });

        this.enemyManager.onEnemyShoot = (shot) => {
            if (!this.cannonballTexture) return;

            const flash = new ExplosionEffect(this.fireTextures, shot.x, shot.y, 0.5);
            this.gameLayer.addChild(flash);

            const ball = new Cannonball(
                this.cannonballTexture,
                shot.x, shot.y,
                shot.rotation,
                this.explosionTextures,
                this.gameLayer
            );
            this.enemyCannonballs.push(ball);
            this.gameLayer.addChild(ball);
        };

        this.enemyManager.onEnemyDestroyed = (points) => {
            this.hud?.addScore(points);
        };

        this.waterBackground = new WaterBackground(waterTexture);
        this.gameLayer.addChild(this.waterBackground);

        const islandMap = new IslandMap(ISLAND_GRID, tileTextures);
        this.gameLayer.addChild(islandMap);

        this.playerShip = new Ship([shipTex1, shipTex2, shipTex3]);

        this.hud = new HUD({
            frame: hudFrame,
            counterPanel: hudCounterPanel,
            iconHeart: hudHeart,
            iconScore: hudIconScore,
            iconTime: hudIconTime,
            buttonNormal: hudBtnNormal,
            buttonHover: hudBtnHover,
            buttonPressed: hudBtnPressed,
            iconPause: hudIconPause,
            iconPlay: hudIconPlay,
        });

        this.hud.onPauseToggle = (isPaused) => {
            this.isPaused = isPaused;
        };

        this.playerShip.onHpChange = (currentHp, maxHp) => {
            this.hud?.updateHealth(currentHp, maxHp);
        };

        this.playerShip.onShoot = (shots) => {
            if (!this.cannonballTexture) return;

            shots.forEach((shot) => {
                const flash = new ExplosionEffect(this.fireTextures, shot.x, shot.y, 0.5);
                this.gameLayer.addChild(flash);

                const ball = new Cannonball(
                    this.cannonballTexture!,
                    shot.x, shot.y,
                    shot.rotation,
                    this.explosionTextures,
                    this.gameLayer
                );
                this.playerCannonballs.push(ball);
                this.gameLayer.addChild(ball);
            });
        };

        this.gameLayer.addChild(this.playerShip);
        this.uiLayer.addChild(this.hud);

        this.startLoop();
    };

    private startLoop() {
        this.app.ticker.add((ticker) => {
            const deltaSeconds = ticker.deltaTime / 60;

            if (this.isPaused) return;

            if (this.hud) {
                this.hud.updateTimer(deltaSeconds);
            };

            if (this.waterBackground) {
                this.waterBackground.update(deltaSeconds);
            };

            if (this.playerShip) {
                this.playerShip.update(deltaSeconds);
            };

            if (this.playerShip && this.enemyManager) {
                this.enemyManager.update(
                    deltaSeconds,
                    this.playerShip,
                    this.playerCannonballs
                );
            };

            for (let i = this.playerCannonballs.length - 1; i >= 0; i--) {
                const ball = this.playerCannonballs[i];
                ball.update(deltaSeconds);

                if (ball.isDead) {
                    this.gameLayer.removeChild(ball);
                    ball.destroy();
                    this.playerCannonballs.splice(i, 1);
                };
            };

            for (let i = this.enemyCannonballs.length - 1; i >= 0; i--) {
                const ball = this.enemyCannonballs[i];
                ball.update(deltaSeconds);

                if (this.playerShip && !this.playerShip.isDead && !ball.isDead) {
                    const dist = Math.hypot(this.playerShip.x - ball.x, this.playerShip.y - ball.y);
                    if (dist < 25) {
                        this.playerShip.takeDamage(15);
                        ball.isDead = true;

                        const impact = new ExplosionEffect(this.explosionTextures, ball.x, ball.y, 0.7);
                        this.gameLayer.addChild(impact);
                    };
                };

                if (ball.isDead) {
                    this.gameLayer.removeChild(ball);
                    ball.destroy();
                    this.enemyCannonballs.splice(i, 1);
                };
            };
        });
    };

    public destroy() {
        this.isDestroyed = true;
        if (this.app.renderer) {
            this.app.destroy(true, { children: true });
        };
    };
};