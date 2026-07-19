import Phaser from 'phaser';
import { UI } from '@/config/UIConfig';

import { COLORTOKEN } from '@/partials/styles/ColorTokens';
import { TYPETOKEN } from '@/partials/styles/TypeTokens';

import { fitCameraToCanvas, viewBounds, ViewBounds } from '@/utils/UtilsLayout';
import { loadGameFonts } from '@/utils/UtilsFont';
import { Background } from '@/partials/ui/components/Background';
import { LoadingBar, LoadingBarStyleScheme } from '@/partials/ui/components/LoadingBar';

import { ImageAssets } from '@/assets/sprites/AssetsMap';
import { GameState } from '@/store/GameState';
import { AudioAssets } from '@/assets/audio/AudioMap';

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
                duration: 350,
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
       // this.load.audio('bg_music', 'assets/audio/music/main-menu.mp3');
        //this.load.audio('sfx-strike-ability', 'assets/audio/sfx/abilities/sfx-strike-ability.m4a')
        //this.load.audio('click_sfx', 'assets/audio/click.wav');
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
        const audio = AudioAssets;
        const assets = ImageAssets;

        Object.entries(assets).forEach(([key, url]) => {
            if (typeof url === 'string') {
                this.load.image(key, url);
            }
        })
          Object.entries(AudioAssets).forEach(([key, url]) => {
             this.load.audio(key, url);
          });
    }

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
            this.transitionToMainMenu(false);
        }, this.BOOT_SCENE_CONFIG.animation.loadingBarFill.duration);
    }

    private transitionToMainMenu(test: boolean): void {
        if (test) {
            GameState.startRun('galahad', 'robert');
            this.scene.start('BattleScene');
            return
        }
        else {
            this.scene.start('MainMenuScene');
        }
    }
}