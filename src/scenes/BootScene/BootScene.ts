import { AudioAssets } from "@/assets/audio/AudioMap";
import { ImageAssets } from "@/assets/sprites/AssetsMap";
import { AssetLoader } from "@/services/AssetLoader";
import { SaveSystem } from "@/services/SaveSystem";
import { SceneManager } from "@/services/SceneManager";
import { loadGameFonts } from "@/utils/UtilsFont";
import { BootRenderer } from "./BootRenderer";

export class BootScene extends Phaser.Scene {
    navigator!: SceneManager;
    private readonly LOADING_DURATION = 350;

    constructor() {
        super({ key: 'BootScene' });
    }

    public preload(): void {
        AssetLoader.loadImages(this.load, ImageAssets);
        AssetLoader.loadAudio(this.load, AudioAssets);
    }

    public async create(): Promise<void> {
        await loadGameFonts();

        SaveSystem.load();

        new BootRenderer(this).render(
            () => this.startMainMenu(),
            this.LOADING_DURATION
        );
    }

    private startMainMenu(): void {
        this.navigator.startMainMenu();
    }
}