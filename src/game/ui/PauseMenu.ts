import { Container, Sprite, Texture, Text, TextStyle } from 'pixi.js';
import { GAME_CONFIG } from '../config';
import { UIButton } from './UIButton';

export interface PauseMenuTextures {
    panel: Texture;
    btnPrimaryNormal: Texture;
    btnPrimaryHover: Texture;
    btnPrimaryPressed: Texture;
    btnPrimaryDisabled: Texture;
};

export class PauseMenu extends Container {
    public onResumeClick?: () => void;
    public onOptionsClick?: () => void;
    public onMainMenuClick?: () => void;

    constructor(textures: PauseMenuTextures) {
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

        const title = new Text({ text: 'PAUSED', style: titleStyle });
        title.anchor.set(0.5);
        title.x = panel.x;
        title.y = panel.y - 150;
        this.addChild(title);

        const subtitleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 13,
            fontWeight: 'bold',
            fill: 0xa0aea1,
        });

        const subtitle = new Text({ text: 'Ready when you are.', style: subtitleStyle });
        subtitle.anchor.set(0.5);
        subtitle.x = panel.x;
        subtitle.y = title.y + 40;
        this.addChild(subtitle);

        const resumeBtn = new UIButton({
            normal: textures.btnPrimaryNormal,
            hover: textures.btnPrimaryHover,
            pressed: textures.btnPrimaryPressed,
            disabled: textures.btnPrimaryDisabled,
            label: 'RESUME',
            fontSize: 20,
            fontColor: 0x3d1e08,
            onClick: () => this.onResumeClick?.(),
        });

        resumeBtn.x = panel.x;
        resumeBtn.y = subtitle.y + 60;
        this.addChild(resumeBtn);

        const optionsBtn = new UIButton({
            normal: textures.btnPrimaryNormal,
            hover: textures.btnPrimaryHover,
            pressed: textures.btnPrimaryPressed,
            disabled: textures.btnPrimaryDisabled,
            label: 'OPTIONS',
            fontSize: 20,
            fontColor: 0x3d1e08,
            onClick: () => this.onOptionsClick?.(),
        });

        optionsBtn.x = panel.x;
        optionsBtn.y = resumeBtn.y + 70;
        this.addChild(optionsBtn);

        const mainMenuBtn = new UIButton({
            normal: textures.btnPrimaryNormal,
            hover: textures.btnPrimaryHover,
            pressed: textures.btnPrimaryPressed,
            disabled: textures.btnPrimaryDisabled,
            label: 'MAIN MENU',
            fontSize: 20,
            fontColor: 0x3d1e08,
            onClick: () => this.onMainMenuClick?.(),
        });

        mainMenuBtn.x = panel.x;
        mainMenuBtn.y = optionsBtn.y + 70;
        this.addChild(mainMenuBtn);
    };
};