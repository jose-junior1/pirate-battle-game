import { Container, Sprite, Texture, Text, TextStyle } from 'pixi.js';
import { GAME_CONFIG } from '../config';
import { UIButton } from './UIButton';

export interface MainMenuTextures {
    panel: Texture;
    title: Texture;
    shipIcon?: Texture;
    btnPrimaryNormal: Texture;
    btnPrimaryHover: Texture;
    btnPrimaryPressed: Texture;
    btnPrimaryDisabled: Texture;
    btnSecondaryNormal: Texture;
    btnSecondaryPressed: Texture;
};

export class MainMenu extends Container {
    public onPlayClick?: () => void;
    public onOptionsClick?: () => void;
    public onRankingClick?: () => void;
    public onMatchHistoryClick?: () => void;

    constructor(textures: MainMenuTextures) {
        super();

        const panel = new Sprite(textures.panel);
        panel.anchor.set(0.5);
        panel.width = 600;
        panel.height = 600;
        panel.x = GAME_CONFIG.CANVAS_WIDTH / 2;
        panel.y = GAME_CONFIG.CANVAS_HEIGHT / 2;
        this.addChild(panel);

        const title = new Sprite(textures.title);
        title.anchor.set(0.5);
        title.x = panel.x;
        title.y = panel.y - 190;
        this.addChild(title);

        const subtitleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fontWeight: 'bold',
            fill: 0xa0aea1,
            letterSpacing: 2,
        });
        
        const subtitle = new Text({ text: 'SET SAIL. TAKE COMMAND.', style: subtitleStyle });
        subtitle.anchor.set(0.5);
        subtitle.x = panel.x;
        subtitle.y = title.y + 75;
        this.addChild(subtitle);

        const playBtn = new UIButton({
            normal: textures.btnPrimaryNormal,
            hover: textures.btnPrimaryHover,
            pressed: textures.btnPrimaryPressed,
            disabled: textures.btnPrimaryDisabled,
            label: 'PLAY',
            fontSize: 20,
            fontColor: 0x3d1e08,
            onClick: () => this.onPlayClick?.(),
        });

        playBtn.x = panel.x;
        playBtn.y = subtitle.y + 65;
        this.addChild(playBtn);

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
        optionsBtn.y = playBtn.y + 90;
        this.addChild(optionsBtn);

        if (textures.shipIcon) {
            const ship = new Sprite(textures.shipIcon);
            ship.anchor.set(0.5);
            ship.scale.set(0.6);
            ship.x = panel.x;
            ship.y = optionsBtn.y + 80;
            this.addChild(ship);
        };

        const descStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xa0aea1,
        });

        const descText = new Text({ text: 'Navigate the islands. Survive the battle.', style: descStyle });
        descText.anchor.set(0.5);
        descText.x = panel.x;
        descText.y = optionsBtn.y + 130;
        this.addChild(descText);

        const rankingBtn = new UIButton({
            normal: textures.btnSecondaryNormal,
            pressed: textures.btnSecondaryPressed,
            label: 'RANKING',
            fontSize: 16,
            fontColor: 0xd0e0f0,
            onClick: () => this.onRankingClick?.(),
        });

        rankingBtn.width = 180;
        rankingBtn.height = 60;
        rankingBtn.x = panel.x - 90;
        rankingBtn.y = descText.y + 50;
        this.addChild(rankingBtn);

        const matchHistoryBtn = new UIButton({
            normal: textures.btnSecondaryNormal,
            pressed: textures.btnSecondaryPressed,
            label: 'MATCH HISTORY',
            fontSize: 16,
            fontColor: 0xd0e0f0,
            onClick: () => this.onMatchHistoryClick?.(),
        });

        matchHistoryBtn.width = 180;
        matchHistoryBtn.height = 60;
        matchHistoryBtn.x = panel.x + 90;
        matchHistoryBtn.y = descText.y + 50;
        this.addChild(matchHistoryBtn);
    };
};