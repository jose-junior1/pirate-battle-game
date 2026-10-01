import { Application, Assets, Texture } from 'pixi.js';

import { GAME_CONFIG, ISLAND_GRID } from './config';
import { Ship } from './entities/Ship';
import { WaterBackground } from './entities/WaterBackground';
import { IslandMap } from './entities/IslandMap';
import { Cannonball } from "./entities/Cannonball";
import { sound } from "./utils/SoundManager";
import { HUD } from './ui/HUD';

export class GameEngine {
    public app: Application;
    private isDestroyed = false;
    private waterBackground?: WaterBackground;
    private playerShip?: Ship;
    private cannonballs: Cannonball[] = [];
    private cannonballTexture?: Texture;
    private explosionTextures: Texture[] = [];

    constructor() {
        this.app = new Application();
    };

    private async loadTileTextures(grid: number[][]): Promise<Map<number, Texture>> {
        const uniqueIds = Array.from(new Set(grid.flat())).filter((id) => id > 0);
        const textureMap = new Map<number, Texture>();

        await Promise.all(
            uniqueIds.map(async (id) => {
                const texture = await Assets.load(`/public/assets/png/default/tiles/tile_${id}.png`);
                textureMap.set(id, texture);
            })
        );

        return textureMap;
    };

    private hud?: HUD;

    public async init(container: HTMLDivElement) {
        sound.setupAudioUnlock();

        sound.load('cannon_fire_1', '/assets/sounds/cannon_fire_1.wav');
        sound.load('cannon_broadside', '/assets/sounds/cannon_broadside.wav');
        sound.load('ship_explosion_1', '/assets/sounds/ship_explosion_1.wav');
        sound.load('water_hit', '/assets/sounds/cannonball_water_hit_1.wav');
        sound.load('ocean_ambience', '/assets/sounds/ocean_ambience_loop.wav');

        await this.app.init({
            width: GAME_CONFIG.CANVAS_WIDTH,
            height: GAME_CONFIG.CANVAS_HEIGHT,
            backgroundColor: 0x0f172a,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        if (this.isDestroyed) {
            this.app.destroy(true, { children: true });
            return
        }

        container.appendChild(this.app.canvas);

        sound.playLoop('ocean_ambience', 0.15);

        const [
            waterTexture,
            shipTexture,
            cannonballTex,
            tileTextures,
            explosion1Tex,
            explosion2Tex,
            explosion3Tex,
            hudFrame,
            hudGreen,
            hudAmber,
            hudRed,
            hudHeart
        ] = await Promise.all([
            Assets.load('/assets/png/default/tiles/tile_73.png'),
            Assets.load('/assets/png/default/ships/ship_1.png'),
            Assets.load('/assets/png/default/ship_parts/cannon_ball.png'),
            this.loadTileTextures(ISLAND_GRID),
            Assets.load('/assets/png/default/effects/explosion_1.png'),
            Assets.load('/assets/png/default/effects/explosion_2.png'),
            Assets.load('/assets/png/default/effects/explosion_3.png'),
            Assets.load('/assets/png/default/ui/hud/health_frame.png'),
            Assets.load('/assets/png/default/ui/hud/health_fill_green.png'),
            Assets.load('/assets/png/default/ui/hud/health_fill_amber.png'),
            Assets.load('/assets/png/default/ui/hud/health_fill_red.png'),
            Assets.load('/assets/png/default/ui/hud/icon_heart.png'),
        ]);

        if (this.isDestroyed) return;

        this.cannonballTexture = cannonballTex;
        this.explosionTextures = [explosion1Tex, explosion2Tex, explosion3Tex];

        this.waterBackground = new WaterBackground(waterTexture);
        this.app.stage.addChild(this.waterBackground);

        const islandMap = new IslandMap(ISLAND_GRID, tileTextures);
        this.app.stage.addChild(islandMap);

        this.playerShip = new Ship(shipTexture);

        this.hud = new HUD({
            frame: hudFrame,
            fillGreen: hudGreen,
            fillAmber: hudAmber,
            fillRed: hudRed,
            iconHeart: hudHeart
        });

        this.playerShip.onHpChange = (currentHp, maxHp) => {
            this.hud?.updateHealth(currentHp, maxHp);
        };

        this.playerShip.onShoot = (shots) => {
            if (!this.cannonballTexture) return;

            shots.forEach((shot) => {
                const ball = new Cannonball(
                    this.cannonballTexture!,
                    shot.x, shot.y,
                    shot.rotation,
                    this.explosionTextures,
                    this.app.stage);
                this.cannonballs.push(ball);
                this.app.stage.addChild(ball);
            });
        };

        this.app.stage.addChild(this.playerShip);

        this.app.stage.addChild(this.hud);

        this.startLoop();
    }

    private startLoop() {
        this.app.ticker.add((ticker) => {
            const deltaSeconds = ticker.deltaTime / 60;

            if (this.waterBackground) {
                this.waterBackground.update(deltaSeconds);
            };

            if (this.playerShip) {
                this.playerShip.update(deltaSeconds);
            };

            for (let i = this.cannonballs.length - 1; i >= 0; i--) {
                const ball = this.cannonballs[i];
                ball.update(deltaSeconds);

                if (ball.isDead) {
                    this.app.stage.removeChild(ball);
                    ball.destroy();
                    this.cannonballs.splice(i, 1);
                };
            };
        });
    }

    public destroy() {
        this.isDestroyed = true;
        if (this.app.renderer) {
            this.app.destroy(true, { children: true });
        }
    }
}