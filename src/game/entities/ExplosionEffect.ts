import { AnimatedSprite, Texture } from 'pixi.js';
import { sound } from '../utils/SoundManager';

export class ExplosionEffect extends AnimatedSprite {
    constructor(textures: Texture[], x: number, y: number, rotation: number) {
        super(textures);

        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.rotation = rotation;

        this.loop = false;
        this.animationSpeed = 0.2;
        this.scale.set(0.5);

        sound.play('shipexplosion_1', 0.4);

        this.onComplete = () => {
            this.destroy();
        };

        this.play();
    }

    private cleanup() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.destroy();
    }
}