import { Container, Sprite, Texture } from 'pixi.js';

export const TILE_SIZE = 64;

export interface TileTextures {
    shallowWater: Texture;
    sand: Texture;
    grass: Texture;
}

export class IslandMap extends Container {
    constructor(grid: number[][], textureMap: Map<number, Texture>) {
        super();

        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const tileId = grid[row][col];
                if (tileId === 0) continue;

                const texture = textureMap.get(tileId);
                if (texture) {
                    const sprite = new Sprite(texture);
                    sprite.x = col * TILE_SIZE;
                    sprite.y = row * TILE_SIZE;
                    this.addChild(sprite);
                }
            }
        }
    }
}