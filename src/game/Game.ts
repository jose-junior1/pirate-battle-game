import { Application } from 'pixi.js';

export class GameEngine {
    public app: Application;
    private isDestroyed = false;

    constructor() {
        this.app = new Application();
    }

    public async init(container: HTMLDivElement) {
        await this.app.init({
            width: 1280,
            height: 720,
            backgroundColor: 0x0f172a,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        if(this.isDestroyed)  {
            this.app.destroy(true, { children: true});
            return
        }

        container.appendChild(this.app.canvas);
        this.startLoop();
    }

    private startLoop() {
        this.app.ticker.add((ticker) => {
            // Toda a lógica do jogo roda aqui em TS puro, longe do React
        });
    }

    public destroy() {
        this.isDestroyed = true;
        if(this.app.renderer) {
            this.app.destroy(true, { children: true });
        }
    }
}