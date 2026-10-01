export class SoundManager {
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private bgm?: HTMLAudioElement;
    private isUnlocked = false;

    public setupAudioUnlock() {
        const unlock = () => {
            if (this.isUnlocked) return;
            this.isUnlocked = true;

            if (this.bgm && this.bgm.paused) {
                this.bgm.play().catch(() => { });
            };

            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        };

        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
    };

    public load(key: string, path: string) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.sounds.set(key, audio);
    };

    public play(key: string, volume: number = 0.5) {
        const sound = this.sounds.get(key);
        if (!sound) return;

        const soundClone = sound.cloneNode() as HTMLAudioElement;
        soundClone.volume = volume;
        soundClone.play().catch(() => {
        });
    };

    public playLoop(key: string, volume: number = 0.2) {
        const sound = this.sounds.get(key);
        if (!sound) return;

        if (this.bgm) {
            this.bgm.pause();
        };

        this.bgm = sound.cloneNode() as HTMLAudioElement;
        this.bgm.volume = volume;
        this.bgm.loop = true;

        this.bgm.play().catch(() => { });
    }
}

export const sound = new SoundManager();