import { Application, Assets, Texture } from 'pixi.js';

import { GAME_CONFIG, ISLAND_GRID } from './config';
import { Ship } from './entities/Ship';
import { WaterBackground } from './entities/WaterBackGround';
import { IslandMap } from './entities/IslandMap';

export class GameEngine {
    public app: Application;
    private isDestroyed = false;
    private playerShip?: Ship;
    private waterBackground?: WaterBackground;

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

    public async init(container: HTMLDivElement) {
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

        const [waterTexture, shipTexture, tileTextures] = await Promise.all([
            Assets.load('/public/assets/png/default/tiles/tile_73.png'),
            Assets.load('/public/assets/png/default/ships/ship_1.png'),
            this.loadTileTextures(ISLAND_GRID)
        ]);

        if (this.isDestroyed) return;

        this.waterBackground = new WaterBackground(waterTexture);
        this.app.stage.addChild(this.waterBackground);

        const islandMap = new IslandMap(ISLAND_GRID, tileTextures);
        this.app.stage.addChild(islandMap);

        this.playerShip = new Ship(shipTexture);
        this.app.stage.addChild(this.playerShip);

        this.startLoop();
    }

    private startLoop() {
        this.app.ticker.add((ticker) => {
            const deltaSeconds = ticker.deltaTime / 60;

            if (this.waterBackground) {
                this.waterBackground.update(deltaSeconds);
            }

            if (this.playerShip) {
                this.playerShip.update(deltaSeconds);
            }
        });
    }

    public destroy() {
        this.isDestroyed = true;
        if (this.app.renderer) {
            this.app.destroy(true, { children: true });
        }
    }
}