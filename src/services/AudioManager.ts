import Phaser from 'phaser';

export default class AudioManager extends Phaser.Plugins.BasePlugin {
    private currentMusic: Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | null = null;
    
    private _masterVolume: number = 1.0;
    private _sfxVolume: number = 1.0;
    private _musicVolume: number = 1.0;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
    }

    // Инициализация плагина
    public init(): void {
        this.game.events.on(Phaser.Core.Events.DESTROY, this.destroy, this);
    }

    /**
     * Воспроизведение звукового эффекта (SFX)
     * @param key Ключ аудио из кэша Phaser
     * @param config Дополнительные настройки звука
     */
    public playSFX(key: string, config: Phaser.Types.Sound.SoundConfig = {}): void {
        const scene = this.pluginManager.game.scene.getScenes(true)[0];
        if (!scene) return;

        const volumeScale = config.volume !== undefined ? config.volume : 1;
        
        const sfx = scene.sound.add(key, {
            ...config,
            volume: volumeScale * this._sfxVolume * this._masterVolume
        });

        sfx.play();
        
        // Автоматически очищаем память после завершения звука
        sfx.on(Phaser.Sound.Events.COMPLETE, () => {
            sfx.destroy();
        });
    }

    /**
     * Воспроизведение фоновой музыки
     * @param key Ключ аудио из кэша
     * @param loop Зацикливать ли трек
     */
    public playMusic(key: string, loop: boolean = true): void {
        const scene = this.pluginManager.game.scene.getScenes(true)[0];
        if (!scene) return;

        // Если этот трек уже играет, ничего не делаем
        if (this.currentMusic && this.currentMusic.key === key && this.currentMusic.isPlaying) {
            return;
        }

        this.stopMusic();

        this.currentMusic = scene.sound.add(key, {
            loop: loop,
            volume: this._musicVolume * this._masterVolume
        });

        this.currentMusic.play();
    }

    /**
     * Остановка текущей фоновой музыки
     */
    public stopMusic(): void {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic.destroy();
            this.currentMusic = null;
        }
    }

    /**
     * Изменение общей громкости
     * @param value Значение от 0.0 до 1.0
     */
    public setMasterVolume(value: number): void {
        this._masterVolume = Phaser.Math.Clamp(value, 0, 1);
        this.updateMusicVolume();
    }

    /**
     * Изменение громкости музыки
     * @param value Значение от 0.0 до 1.0
     */
    public setMusicVolume(value: number): void {
        this._musicVolume = Phaser.Math.Clamp(value, 0, 1);
        this.updateMusicVolume();
    }

    /**
     * Изменение громкости эффектов
     * @param value Значение от 0.0 до 1.0
     */
    public setSFXVolume(value: number): void {
        this._sfxVolume = Phaser.Math.Clamp(value, 0, 1);
    }

    // Геттеры для получения текущих настроек громкости
    public get masterVolume(): number { return this._masterVolume; }
    public get sfxVolume(): number { return this._sfxVolume; }
    public get musicVolume(): number { return this._musicVolume; }

    private updateMusicVolume(): void {
        if (this.currentMusic) {
            this.currentMusic.setVolume(this._musicVolume * this._masterVolume);
        }
    }

    // Очистка при уничтожении плагина
    public override destroy(): void {
        this.stopMusic();
        if (this.game) {
            this.game.events.off(Phaser.Core.Events.DESTROY, this.destroy, this);
        }
        super.destroy();
    }
}
