import { Container, Sprite, Texture, Text, TextStyle, Graphics } from 'pixi.js';
import { GAME_CONFIG } from '../config';

export interface HUDTextures {
    frame: Texture;
    counterPanel: Texture;
    iconHeart?: Texture;
    iconScore: Texture;
    iconTime: Texture;
    buttonNormal?: Texture;
    buttonHover?: Texture;
    buttonPressed?: Texture;
    iconPause?: Texture;
    iconPlay?: Texture;
}

export class HUD extends Container {
    private healthContainer!: Container;
    private frameSprite!: Sprite;
    private fillGraphic!: Graphics;
    private hpText!: Text;

    private textures: HUDTextures;

    private fillWidth = 196;
    private fillHeight = 22;
    private fillOffsetX = 29;
    private fillOffsetY = 13;

    private score = 0;
    private scoreText!: Text;

    private timeSeconds = 0;
    private timerText!: Text;

    private pauseButtonSprite?: Sprite;
    private pauseIconSprite?: Sprite;

    private isPaused = false;
    public onPauseToggle?: (isPaused: boolean) => void;

    private handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Escape' || e.code === 'KeyP') {
            this.togglePause();
        };
    };

    constructor(textures: HUDTextures) {
        super();

        this.textures = textures;

        this.x = 0;
        this.y = 0;

        this.createHealthBar(textures);
        this.createScoreBadge(textures.counterPanel, textures.iconScore);
        this.createTimerBadge(textures.counterPanel, textures.iconTime);
        this.createPauseButton(textures);

        window.addEventListener('keydown', this.handleKeyDown);
    };

    private createHealthBar(textures: HUDTextures) {
        this.healthContainer = new Container();
        this.healthContainer.x = 90;
        this.healthContainer.y = 15;

        this.frameSprite = new Sprite(textures.frame);
        this.healthContainer.addChild(this.frameSprite);

        this.fillGraphic = new Graphics();
        this.healthContainer.addChild(this.fillGraphic);

        if (textures.iconHeart) {
            const heart = new Sprite(textures.iconHeart);
            heart.anchor.set(0.5);
            heart.x = -30;
            heart.y = this.frameSprite.height / 2;
            this.healthContainer.addChild(heart);
        }

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
        this.healthContainer.addChild(this.hpText);

        this.addChild(this.healthContainer);

        // Renderiza o preenchimento inicial
        this.updateHealth(100, 100);
    };

    public updateHealth(currentHp: number, maxHp: number) {
        const clampedHp = Math.max(0, Math.min(currentHp, maxHp));
        const ratio = clampedHp / maxHp;

        let color = 0x11c51e;
        if (ratio < 0.3) {
            color = 0xeb1121;
        } else if (ratio < 0.6) {
            color = 0xf59e0b;
        }

        const currentWidth = Math.max(0, this.fillWidth * ratio);

        this.fillGraphic.clear();
        if (currentWidth > 0) {
            this.fillGraphic.roundRect(
                this.fillOffsetX,
                this.fillOffsetY,
                currentWidth,
                this.fillHeight,
                8
            );
            this.fillGraphic.fill(color);
        };

        this.hpText.text = `${Math.ceil(clampedHp)} / ${maxHp}`;
    };

    private createScoreBadge(panelTexture: Texture, starTexture: Texture) {
        const container = new Container();
        container.x = GAME_CONFIG.CANVAS_WIDTH - 420;
        container.y = 15;

        const panel = new Sprite(panelTexture);
        panel.scale.set(1);
        container.addChild(panel);

        const star = new Sprite(starTexture);
        star.anchor.set(0.5);
        star.x = 30;
        star.y = panel.height / 2;
        star.scale.set(0.6);
        container.addChild(star);

        this.scoreText = new Text({
            text: '0',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fontWeight: 'bold',
                fill: '#ffffff',
                align: 'center'
            })
        });
        this.scoreText.anchor.set(0.5);
        this.scoreText.x = panel.width * 0.65;
        this.scoreText.y = panel.height / 2;

        container.addChild(this.scoreText);
        this.addChild(container);
    };

    private createTimerBadge(panelTexture: Texture, timeTexture: Texture) {
        const container = new Container();
        container.x = GAME_CONFIG.CANVAS_WIDTH - 250;
        container.y = 15;

        const panel = new Sprite(panelTexture);
        panel.scale.set(1);
        container.addChild(panel);

        const clock = new Sprite(timeTexture);
        clock.anchor.set(0.5);
        clock.x = 30;
        clock.y = panel.height / 2;
        clock.scale.set(0.6);
        container.addChild(clock);

        this.timerText = new Text({
            text: '00:00',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fontWeight: 'bold',
                fill: '#ffffff',
                align: 'center'
            })
        });
        this.timerText.anchor.set(0.5);
        this.timerText.x = panel.width * 0.65;
        this.timerText.y = panel.height / 2;

        container.addChild(this.timerText);
        this.addChild(container);
    };

    private createPauseButton(textures: HUDTextures) {
        const container = new Container();
        container.x = GAME_CONFIG.CANVAS_WIDTH - 50;
        container.y = 40;

        if (textures.buttonNormal) {
            this.pauseButtonSprite = new Sprite(textures.buttonNormal);
            this.pauseButtonSprite.anchor.set(0.5);
            this.pauseButtonSprite.scale.set(0.8);

            if (textures.iconPause) {
                this.pauseIconSprite = new Sprite(textures.iconPause);
                this.pauseIconSprite.anchor.set(0.5);
                this.pauseIconSprite.scale.set(0.5);
                this.pauseButtonSprite.addChild(this.pauseIconSprite);
            };

            this.pauseButtonSprite.interactive = true;
            this.pauseButtonSprite.cursor = 'pointer';

            this.pauseButtonSprite.on('pointerover', () => {
                if (textures.buttonHover) this.pauseButtonSprite!.texture = textures.buttonHover;
            });

            this.pauseButtonSprite.on('pointerout', () => {
                if (textures.buttonNormal) this.pauseButtonSprite!.texture = textures.buttonNormal;
            });

            this.pauseButtonSprite.on('pointerdown', () => {
                if (textures.buttonPressed) this.pauseButtonSprite!.texture = textures.buttonPressed;
            });

            this.pauseButtonSprite.on('pointerup', () => {
                if (textures.buttonHover) this.pauseButtonSprite!.texture = textures.buttonHover;
                this.togglePause();
            });

            container.addChild(this.pauseButtonSprite);
        } else {
            const button = new Container();
            const bg = new Graphics();
            bg.circle(0, 0, 18);
            bg.fill({ color: 0x2d1b0e });
            bg.stroke({ width: 3, color: 0xb37737 });

            const inner = new Graphics();
            inner.circle(0, 0, 14);
            inner.fill({ color: 0x111923, alpha: 0.9 });

            const bars = new Graphics();
            bars.rect(-4, -5, 3, 10);
            bars.rect(1, -5, 3, 10);
            bars.fill({ color: 0xffffff });

            button.addChild(bg, inner, bars);
            button.interactive = true;
            button.cursor = 'pointer';
            button.on('pointerdown', () => this.togglePause());

            container.addChild(button);
        };

        this.addChild(container);
    };


    public addScore(points: number) {
        this.score += points;
        this.scoreText.text = `${this.score}`;
    };

    public setScore(points: number) {
        this.score = points;
        this.scoreText.text = `${this.score}`;
    };

    public updateTimer(deltaSeconds: number) {
        if (this.isPaused) return;

        this.timeSeconds += deltaSeconds;
        const minutes = Math.floor(this.timeSeconds / 60);
        const seconds = Math.floor(this.timeSeconds % 60);

        const formattedM = String(minutes).padStart(2, '0');
        const formattedS = String(seconds).padStart(2, '0');

        this.timerText.text = `${formattedM}:${formattedS}`;
    };

    public togglePause() {
        this.isPaused = !this.isPaused;

        if (this.pauseIconSprite) {
            if (this.isPaused && this.textures.iconPlay) {
                this.pauseIconSprite.texture = this.textures.iconPlay;
            } else if (!this.isPaused && this.textures.iconPause) {
                this.pauseIconSprite.texture = this.textures.iconPause;
            };
        };

        if (this.onPauseToggle) {
            this.onPauseToggle(this.isPaused);
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public destroy(options?: any) {
        window.removeEventListener('keydown', this.handleKeyDown);
        super.destroy(options);
    };
};