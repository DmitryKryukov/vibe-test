import Phaser from 'phaser';
import { UI } from '@/config/UIConfig';

import { COLORTOKEN } from '@/ui/styles/ColorTokens';
import { TYPETOKEN } from '@/ui/styles/TypeTokens';

import { fitCameraToCanvas, viewBounds, ViewBounds } from '@/utils/UtilsLayout';
import { loadGameFonts } from '@/utils/UtilsFont';
import { Background } from '@/ui/components/Background';
import { LoadingBar, LoadingBarStyleScheme } from '@/ui/components/LoadingBar';

/*
import { SaveSystem } from '../state/SaveSystem';
import { IMAGE_ASSETS } from '../assets/AssetMap';
import { applyContentOverrides, contentImageAssets } from '../content/ContentSystem';
*/


export class BootScene extends Phaser.Scene {
    private BOOT_SCENE_CONFIG = {
        layout: {
            textOffsetY: -40,
            loadingBar: {
                style: {
                    width: 640,
                    height: 18,
                    paddings: 4,
                } as LoadingBarStyleScheme,
                offsetY: 40,
            }
        },
        animation: {
            loadingBarFill: {
                duration: 850,
            }
        }
    } as const;

    private background!: UI.Background;
    private loadingBar!: UI.LoadingBar;

    constructor() {
        super({ key: 'BootScene' });
    }

    public preload(): void {
        this.registerAssets();
    }

    public async create(): Promise<void> {
        await this.initialize();
    }

    private async initialize(): Promise<void> {
        await loadGameFonts();
        fitCameraToCanvas(this);

        // SaveSystem.load();
        this.renderScene();
    }

    private registerAssets(): void {
        //const contentPack = applyContentOverrides();
        //const assets = { ...IMAGE_ASSETS, ...contentImageAssets(contentPack) };

        // Object.entries(assets).forEach(([key, url]) => {
        //  if (typeof url === 'string') {
        //    this.load.image(key, url);
        //  }
    };

    private renderScene(): void {
        const view = viewBounds(this) as ViewBounds;
        this.background = new Background(this);
        this.renderTitle(view);
        this.renderLoadingBar(view);
    }

    private renderTitle(view: ViewBounds): void {
        const accentColor = COLORTOKEN.Foreground.Secondary;
        this.add.text(
            view.centerX,
            view.centerY + this.BOOT_SCENE_CONFIG.layout.textOffsetY,
            'Armory Intendant',
            {
                ...TYPETOKEN.Primary.Display,
                color: COLORTOKEN.Foreground.Secondary,
            }
        ).setOrigin(.5);
    }

    private renderLoadingBar(view: ViewBounds): void {
        this.loadingBar = new LoadingBar(this, { x: view.centerX, y: view.centerY + this.BOOT_SCENE_CONFIG.layout.loadingBar.offsetY }, this.BOOT_SCENE_CONFIG.layout.loadingBar.style);
        this.simulateLoading();
    }

    private simulateLoading(): void {
        this.loadingBar.animateFill(1, () => {
            this.transitionToMainMenu();
        }, this.BOOT_SCENE_CONFIG.animation.loadingBarFill.duration);
    }

    private transitionToMainMenu(): void {
         this.scene.start('MainMenuScene');
    }
}