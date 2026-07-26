import { DEFAULT_HERO_ID, DEFAULT_SQUIRE_ID } from './MainMenuConfig';
import { MainMenuRenderer } from './MainMenuRenderer';


export class MainMenuScene extends Phaser.Scene {
    public selectedHero = DEFAULT_HERO_ID;
    public selectedSquire = DEFAULT_SQUIRE_ID;
    private sceneRenderer!: MainMenuRenderer;

    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create(): void {
        this.sceneRenderer = new MainMenuRenderer(this);
        this.sceneRenderer.render();
        this.bindEvents();
    }

    private bindEvents(): void {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.sceneRenderer.destroy();
        });

        this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
            this.audio.setMusicVolume(0.25);
            this.audio.playMusic('main-menu');
        });
    }

    public selectHero(id: string): void {
        this.selectedHero = id;
        this.sceneRenderer.selectedHero(id);
    }

    public selectSquire(id: string): void {
        this.selectedSquire = id;
        this.sceneRenderer.selectedSquire(id);
    }
}