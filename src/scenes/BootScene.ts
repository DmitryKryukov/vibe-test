import Phaser from 'phaser';
/*
import { SaveSystem } from '../state/SaveSystem';
import { IMAGE_ASSETS } from '../assets/AssetMap';
import { fitCameraToCanvas, viewBounds } from '../utils/layout';
import { applyContentOverrides, contentImageAssets } from '../content/ContentSystem';
import { Backdrop } from '../ui/Backdrop';
import { METRICS } from '../utils/Metrics';
import { hexStringToNumber } from '../utils/ColorUtils';
import { PHASER_FONT_FAMILIES, loadGameFonts } from '../ui/styles/fontRegistry';
import { LoadingBarConfig, ViewBounds } from '../entities/Types';
*/

export class BootScene extends Phaser.Scene {
    /*
  private backdrop!: Backdrop;
  private loadingBar!: {
    bar: Phaser.GameObjects.Rectangle;
    fill: Phaser.GameObjects.Rectangle;
  };

  private static readonly LOADING_CONFIG: LoadingBarConfig = {
    width: 640,
    height: 18,
    fillHeight: 12,
    strokeWidth: 2,
    innerPadding: 4,
    backgroundColor: 0x101510,
  };

  private static readonly ANIMATION_DURATION_MS = 850;
  private static readonly TEXT_OFFSET_Y = 40;
  private static readonly BAR_OFFSET_Y = 48;

  constructor() {
    super({ key: 'BootScene' });
  }

  public preload(): void {
    this.registerAssets();
  }

  public async create(): Promise<void> {
    await this.initializeWhenFontsReady();
  }

  private async initializeWhenFontsReady(): Promise<void> {
    await loadGameFonts();

    this.backdrop = new Backdrop(this);
    SaveSystem.load();
    fitCameraToCanvas(this);
    
    this.buildUserInterface();
    this.simulateLoadingSequence();
  }

  private registerAssets(): void {
    const contentPack = applyContentOverrides();
    const assets = { ...IMAGE_ASSETS, ...contentImageAssets(contentPack) };
    
    Object.entries(assets).forEach(([key, url]) => {
      if (typeof url === 'string') {
        this.load.image(key, url);
      }
    });
  }

  private buildUserInterface(): void {
    const view = viewBounds(this) as ViewBounds;
    
    this.backdrop.render();
    this.renderTitle(view);
    this.createLoadingBar(view);
  }

  private renderTitle(view: ViewBounds): void {
    const accentColor = METRICS.color.accent;
    
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: PHASER_FONT_FAMILIES.xprm3,
      resolution: 2,
      fontSize: METRICS.typography.title.size,
      color: accentColor,
      stroke: '#000000',
      strokeThickness: 8,
    };

    this.add.text(
      view.centerX, 
      view.centerY - BootScene.TEXT_OFFSET_Y, 
      'Arnory Intendant', 
      textStyle
    ).setOrigin(0.5);
  }

  private createLoadingBar(view: ViewBounds): void {
    const { centerX, centerY } = view;
    const { width, height, fillHeight, strokeWidth, innerPadding, backgroundColor } = BootScene.LOADING_CONFIG;
    const accentColor = hexStringToNumber(METRICS.color.accent);
    
    const barY = centerY + BootScene.BAR_OFFSET_Y;
    const halfWidth = width / 2;
    const fillStartX = centerX - halfWidth + innerPadding;

    this.loadingBar = {
      bar: this.add.rectangle(centerX, barY, width, height, backgroundColor)
        .setStrokeStyle(strokeWidth, accentColor),
      fill: this.add.rectangle(fillStartX, barY, 0, fillHeight, accentColor)
        .setOrigin(0, 0.5)
    };
  }

  private simulateLoadingSequence(): void {
    this.tweens.add({
      targets: this.loadingBar.fill,
      width: BootScene.LOADING_CONFIG.width - (BootScene.LOADING_CONFIG.innerPadding * 2),
      duration: BootScene.ANIMATION_DURATION_MS,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.transitionToMainMenu();
      }
    });
  }

  private transitionToMainMenu(): void {
    this.scene.start('MainMenuScene');
  }
    */
}