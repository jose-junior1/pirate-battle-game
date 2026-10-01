import { Container, Sprite, Texture, Text, TextStyle, Graphics } from 'pixi.js';

export interface HUDTextures {
    frame: Texture;
    iconHeart?: Texture;
    fillGreen?: Texture;
    fillAmber?: Texture;
    fillRed?: Texture;
}

export class HUD extends Container {
    private frameSprite: Sprite;
    private fillGraphic: Graphics;
    private hpText: Text;

    private fillWidth = 196;
    private fillHeight = 22;
    private fillOffsetX = 29;
    private fillOffsetY = 13;

    constructor(textures: HUDTextures) {
        super();

        this.x = 90;
        this.y = 20;

        this.frameSprite = new Sprite(textures.frame);
        this.addChild(this.frameSprite);

        this.fillGraphic = new Graphics();
        this.addChild(this.fillGraphic);

        if (textures.iconHeart) {
            const heart = new Sprite(textures.iconHeart);
            heart.anchor.set(0.5);
            heart.x = -40;
            heart.y = this.frameSprite.height / 2;
            this.addChild(heart);
        };

        const textStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'bold',
            fill: 0xffffff,
            dropShadow: {
                alpha: 0.8,
                angle: 1.5,
                blur: 2,
                color: 0x000000,
                distance: 1,
            },
        });

        this.hpText = new Text({ text: '100 / 100', style: textStyle });
        this.hpText.anchor.set(0.5);
        this.hpText.x = this.frameSprite.width / 2;
        this.hpText.y = this.frameSprite.height / 2;
        this.addChild(this.hpText);

        this.updateHealth(100, 100);
    };

    public updateHealth(currentHp: number, maxHp: number) {
        const clampedHp = Math.max(0, Math.min(currentHp, maxHp));
        const ratio = clampedHp / maxHp;

        let color = 0x11c51e;
        if (ratio < 0.3) {
            color = 0xef4444;
        } else if (ratio < 0.6) {
            color = 0xf59e0b;
        };

        const currentWidth = Math.max(0, this.fillWidth * ratio);

        this.fillGraphic.clear();
        if (currentWidth > 0) {
            this.fillGraphic.roundRect(this.fillOffsetX, this.fillOffsetY, currentWidth, this.fillHeight, 10);
            this.fillGraphic.fill(color);
        };

        this.hpText.text = `${Math.ceil(clampedHp)} / ${maxHp}`;
    };
};