import { Container, Sprite, Texture, Text, TextStyle } from 'pixi.js';
import { GAME_CONFIG } from '../config';
import { UIButton } from './UIButton';

export interface OptionsMenuTextures {
    panel: Texture;
    btnPrimaryNormal: Texture;
    btnPrimaryHover: Texture;
    btnPrimaryPressed: Texture;
    btnPrimaryDisabled: Texture;
    btnRoundNormal: Texture;
    btnRoundHover: Texture;
    btnRoundPressed: Texture;
};

export class OptionsMenu extends Container {
    public onBackClick?: () => void;
    public onSessionTimeChange?: (timeSeconds: number) => void;
    public onEnemySpawnTimeChange?: (timeSeconds: number) => void;

    private sessionTime = 120;
    private spawnTime = 3;

    private sessionTimeText: Text;
    private spawnTimeText: Text;

    constructor(textures: OptionsMenuTextures) {
        super();

        const panel = new Sprite(textures.panel);
        panel.anchor.set(0.5);
        panel.width = 600;
        panel.height = 600;
        panel.x = GAME_CONFIG.CANVAS_WIDTH / 2;
        panel.y = GAME_CONFIG.CANVAS_HEIGHT / 2;
        this.addChild(panel);

        const titleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: 0xffffff,
            align: 'center',
        });

        const title = new Text({ text: 'OPTIONS', style: titleStyle });
        title.anchor.set(0.5);
        title.x = panel.x;
        title.y = panel.y - 170;
        this.addChild(title);

        const labelStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fontWeight: 'bold',
            fill: 0xa0aea1,
        });

        const valueStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 22,
            fontWeight: 'bold',
            fill: 0xffffff,
        });

        const sessionLabel = new Text({ text: 'Game session time', style: labelStyle });
        sessionLabel.anchor.set(0.5);
        sessionLabel.x = panel.x;
        sessionLabel.y = title.y + 60;
        this.addChild(sessionLabel);

        const sessionMinusBtn = new UIButton({
            normal: textures.btnRoundNormal,
            hover: textures.btnRoundHover,
            pressed: textures.btnRoundPressed,
            label: '-',
            fontSize: 24,
            fontColor: 0xffffff,
            onClick: () => this.adjustSessionTime(-30),
        });

        sessionMinusBtn.width = 45;
        sessionMinusBtn.height = 45;
        sessionMinusBtn.x = panel.x - 120;
        sessionMinusBtn.y = sessionLabel.y + 45;
        this.addChild(sessionMinusBtn);

        this.sessionTimeText = new Text({ text: `${this.sessionTime} s`, style: valueStyle });
        this.sessionTimeText.anchor.set(0.5);
        this.sessionTimeText.x = panel.x;
        this.sessionTimeText.y = sessionMinusBtn.y;
        this.addChild(this.sessionTimeText);

        const sessionPlusBtn = new UIButton({
            normal: textures.btnRoundNormal,
            hover: textures.btnRoundHover,
            pressed: textures.btnRoundPressed,
            label: '+',
            fontSize: 24,
            fontColor: 0xffffff,
            onClick: () => this.adjustSessionTime(30),
        });

        sessionPlusBtn.width = 45;
        sessionPlusBtn.height = 45;
        sessionPlusBtn.x = panel.x + 120;
        sessionPlusBtn.y = sessionMinusBtn.y;
        this.addChild(sessionPlusBtn);

        const spawnLabel = new Text({ text: 'Enemy spawn time', style: labelStyle });
        spawnLabel.anchor.set(0.5);
        spawnLabel.x = panel.x;
        spawnLabel.y = sessionMinusBtn.y + 55;
        this.addChild(spawnLabel);

        const spawnMinusBtn = new UIButton({
            normal: textures.btnRoundNormal,
            hover: textures.btnRoundHover,
            pressed: textures.btnRoundPressed,
            label: '-',
            fontSize: 24,
            fontColor: 0xffffff,
            onClick: () => this.adjustSpawnTime(-1),
        });

        spawnMinusBtn.width = 45;
        spawnMinusBtn.height = 45;
        spawnMinusBtn.x = panel.x - 120;
        spawnMinusBtn.y = spawnLabel.y + 45;
        this.addChild(spawnMinusBtn);

        this.spawnTimeText = new Text({ text: `${this.spawnTime} s`, style: valueStyle });
        this.spawnTimeText.anchor.set(0.5);
        this.spawnTimeText.x = panel.x;
        this.spawnTimeText.y = spawnMinusBtn.y;
        this.addChild(this.spawnTimeText);

        const spawnPlusBtn = new UIButton({
            normal: textures.btnRoundNormal,
            hover: textures.btnRoundHover,
            pressed: textures.btnRoundPressed,
            label: '+',
            fontSize: 24,
            fontColor: 0xffffff,
            onClick: () => this.adjustSpawnTime(1),
        });

        spawnPlusBtn.width = 45;
        spawnPlusBtn.height = 45;
        spawnPlusBtn.x = panel.x + 120;
        spawnPlusBtn.y = spawnMinusBtn.y;
        this.addChild(spawnPlusBtn);

        const backBtn = new UIButton({
            normal: textures.btnPrimaryNormal,
            hover: textures.btnPrimaryHover,
            pressed: textures.btnPrimaryPressed,
            disabled: textures.btnPrimaryDisabled,
            label: 'VOLTAR',
            fontSize: 20,
            fontColor: 0x3d1e08,
            onClick: () => this.onBackClick?.(),
        });

        backBtn.x = panel.x;
        backBtn.y = spawnMinusBtn.y + 80;
        this.addChild(backBtn);
    };

    private adjustSessionTime(delta: number) {
        this.sessionTime = Math.max(60, Math.min(180, this.sessionTime + delta));
        this.sessionTimeText.text = `${this.sessionTime} s`;
        this.onSessionTimeChange?.(this.sessionTime);
    };

    private adjustSpawnTime(delta: number) {
        this.spawnTime = Math.max(1, Math.min(10, this.spawnTime + delta));
        this.spawnTimeText.text = `${this.spawnTime} s`;
        this.onEnemySpawnTimeChange?.(this.spawnTime);
    };
};