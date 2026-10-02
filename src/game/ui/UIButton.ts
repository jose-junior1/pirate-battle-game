import { Container, Sprite, Texture, Text, TextStyle } from 'pixi.js';

export interface UIButtonOptions {
    normal: Texture;
    hover?: Texture;
    pressed?: Texture;
    disabled?: Texture;
    label?: string;
    fontSize?: number;
    fontColor?: number;
    onClick?: () => void;
    enabled?: boolean;
};

export class UIButton extends Container {
    private sprite: Sprite;
    private labelText?: Text;
    private textures: {
        normal: Texture;
        hover?: Texture;
        pressed?: Texture;
        disabled?: Texture;
    };

    private isHovered = false;
    private isPressed = false;
    public enabled = true;
    public onClick?: () => void;

    constructor(options: UIButtonOptions) {
        super();

        this.textures = {
            normal: options.normal,
            hover: options.hover || options.normal,
            pressed: options.pressed || options.normal,
            disabled: options.disabled || options.normal,
        };

        this.onClick = options.onClick;
        this.enabled = options.enabled ?? true;

        this.sprite = new Sprite(this.textures.normal);
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);

        if (options.label) {
            const style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: options.fontSize || 18,
                fontWeight: 'bold',
                fill: options.fontColor || 0x4a2810,
                align: 'center',
            });

            this.labelText = new Text({ text: options.label, style });
            this.labelText.anchor.set(0.5);
            this.addChild(this.labelText);
        };

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.setupEvents();
        this.updateState();
    };

    private setupEvents() {
        this.on('pointerover', () => {
            if (!this.enabled) return;
            this.isHovered = true;
            this.updateState();
        });

        this.on('pointerout', () => {
            if (!this.enabled) return;
            this.isHovered = false;
            this.isPressed = false;
            this.updateState();
        });

        this.on('pointerdown', () => {
            if (!this.enabled) return;
            this.isPressed = true;
            this.updateState();
        });

        this.on('pointerup', () => {
            if (!this.enabled) return;
            if (this.isPressed && this.onClick) {
                this.onClick();
            }
            this.isPressed = false;
            this.updateState();
        });

        this.on('pointerupoutside', () => {
            if (!this.enabled) return;
            this.isPressed = false;
            this.updateState();
        });
    };

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
        this.cursor = enabled ? 'pointer' : 'default';
        this.updateState();
    };

    private updateState() {
        if (!this.enabled) {
            this.sprite.texture = this.textures.disabled || this.textures.normal;
            return;
        };

        if (this.isPressed) {
            this.sprite.texture = this.textures.pressed || this.textures.normal;
        } else if (this.isHovered) {
            this.sprite.texture = this.textures.hover || this.textures.normal;
        } else {
            this.sprite.texture = this.textures.normal;
        };
    };
};