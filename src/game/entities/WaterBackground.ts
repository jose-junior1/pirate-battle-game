import { Container, TilingSprite, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../config';

export class WaterBackground extends Container {
    private tilingSprite: TilingSprite;

    constructor(texture: Texture) {
        super();

        this.tilingSprite = new TilingSprite({
            texture,
            width: GAME_CONFIG.CANVAS_WIDTH,
            height: GAME_CONFIG.CANVAS_HEIGHT,
        });

        this.addChild(this.tilingSprite);
    }

    public update(deltaSeconds: number) {
        this.tilingSprite.tilePosition.x += 10 * deltaSeconds;
        this.tilingSprite.tilePosition.y += 5 * deltaSeconds;
    }
};