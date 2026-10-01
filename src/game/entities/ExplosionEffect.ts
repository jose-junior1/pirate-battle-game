import { AnimatedSprite, Texture } from 'pixi.js';
import { sound } from '../utils/SoundManager';

export class ExplosionEffect extends AnimatedSprite {
    constructor(textures: Texture[], x: number, y: number, rotation: number) {
        super(textures);

        // Centralizar o ponto de ancoragem
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.rotation = rotation; // Herdar a rotação do tiro

        // Configurações da animação
        this.loop = false; // Não repetir
        this.animationSpeed = 0.2; // Velocidade da animação (ajustável)
        this.scale.set(0.5); // Reduzir o tamanho da explosão para combinar com o jogo

        sound.play('shipexplosion_1', 0.4); // Tocar o som da explosão

        // Ouvir o evento de conclusão para limpar o efeito
        this.onComplete = () => {
            this.cleanup();
        };

        // Começar a animação imediatamente
        this.play();
    }

    private cleanup() {
        if (this.parent) {
            this.parent.removeChild(this); // Remover do palco
        }
        this.destroy(); // Limpar da memória
    }
}