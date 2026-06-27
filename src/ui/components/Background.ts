import Phaser from 'phaser';
import { viewBounds } from '@/utils/UtilsLayout';
import { getRandomInt } from '@/utils/UtilsMath';

export class Background {

    private scene: Phaser.Scene;
    private graphic!: Phaser.GameObjects.Graphics

    constructor(scene: Phaser.Scene, kind: 'menu' | 'map' | 'battle' = 'menu') {
        this.scene = scene;
        this.render(kind);
    }

    public render(kind: 'menu' | 'map' | 'battle' = 'menu'): void {
        const view = viewBounds(this.scene);
        let textureKey;
        switch (kind) {
            case 'battle':
                textureKey = `background-battle-${getRandomInt(1, 2)}`;
                break;
            case 'map':
                textureKey = 'background-map';
                break;
            default:
                textureKey = undefined;
        }
        if (textureKey && this.scene.textures.exists(textureKey)) {
            this.drawTexturedBackground(textureKey);
        } else {
            this.drawProceduralBackground();
        }
    }


    private drawProceduralBackground(): void {
        this.graphic = this.scene.add.graphics();
        this.updateBackground();
    }

    private drawTexturedBackground(textureKey: string): void {
        const view = viewBounds(this.scene);
        this.scene.add.image(view.left, view.top, textureKey)
            .setOrigin(0)
            .setDisplaySize(view.width, view.height)
            .setDepth(-100);
    }

    public updateBackground(): void {
        const view = viewBounds(this.scene);
        this.graphic.clear();
        this.graphic.fillGradientStyle(0x070807, 0x10140f, 0x000000, 0x000000, 1).fillRect(view.left, view.top, view.width, view.height);
    }
}