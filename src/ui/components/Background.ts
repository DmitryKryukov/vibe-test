import Phaser from 'phaser';
//import { fitCameraToCanvas, screenBounds, screenSpaceScale, screenToWorld, viewBounds } from '../utils/layout';

export class Background {
    /*
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public render(kind: 'map' | 'battle' | 'menu' = 'map', textureOverride?: string): void {
        const view = viewBounds(this.scene);
        const textureKey = textureOverride ?? (kind === 'battle' ? 'bg-battle' : kind === 'map' ? 'bg-map' : undefined);
        fitCameraToCanvas(this.scene);

        if (textureKey && this.scene.textures.exists(textureKey)) {
            this.drawTexturedBackground(view, textureKey, kind);
        } else {
            this.drawProceduralBackground(view, kind);
        }

        // if (textureKey && this.scene.textures.exists(textureKey)) {
        //   this.scene.add.image(view.left, view.top, textureKey)
        //     .setOrigin(0)
        //     .setDisplaySize(view.width, view.height)
        //     .setDepth(-100);
        //   const overlay = this.scene.add.graphics().setDepth(-90);
        //   overlay.fillStyle(0x000000, kind === 'battle' ? 0.14 : 0.28);
        //   overlay.fillRect(view.left, view.top, view.width, view.height);
        //   overlay.fillStyle(0x000000, 0.58);
        //   overlay.fillRect(view.left, view.top, view.width, 115);
        //   overlay.fillRect(view.left, view.bottom - 190, 540, 190);
        //   overlay.lineStyle(44, 0x000000, 0.42);
        //   overlay.strokeRect(view.left + 12, view.top + 12, view.width - 24, view.height - 24);
        //   return;
        // }

        this.drawProceduralBackground(view, kind);
    }

    private drawTexturedBackground(view: any, textureKey: string, kind: 'map' | 'battle' | 'menu'): void {
        this.scene.add.image(view.left, view.top, textureKey)
            .setOrigin(0)
            .setDisplaySize(view.width, view.height)
            .setDepth(-100);

        const dimmingAlpha = kind === 'battle' ? 0.14 : 0.28;
        const dimmingLayer = this.scene.add.graphics().setDepth(-95);
        dimmingLayer.fillStyle(0x000000, dimmingAlpha);
        dimmingLayer.fillRect(view.left, view.top, view.width, view.height);
    }

    private drawProceduralBackground(view: any, kind: 'map' | 'battle' | 'menu'): void {
        const g = this.scene.add.graphics();
        g.fillGradientStyle(0x070807, 0x10140f, 0x000000, 0x000000, 1).fillRect(view.left, view.top, view.width, view.height);
    }
*/
    }