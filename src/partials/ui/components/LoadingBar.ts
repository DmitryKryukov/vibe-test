import Phaser from 'phaser';
import { COLORTOKEN } from '@/styles/ColorTokens';
import { anyToColor } from '@/utils/UtilsColor';

export interface LoadingBarStyleScheme {
    width: number;
    height: number;
    paddings: number;
    bar: {
        backgroundColor: Color,
        strokeColor: Color,
        strokeWidth: number,
    }
    fill: {
        backgroundColor: Color,
        strokeColor: Color,
        strokeWidth: number,
    }
}

export interface LoadingBarLayoutScheme {
    x: number,
    y: number,
}

const defaultStyle: LoadingBarStyleScheme = {
    width: 250,
    height: 40,
    paddings: 2,
    bar: {
        backgroundColor: COLORTOKEN.Background.Zeroth,
        strokeColor: COLORTOKEN.Background.Accent.Primary,
        strokeWidth: 2,
    },
    fill: {
        backgroundColor: COLORTOKEN.Background.Accent.Primary,
        strokeColor: COLORTOKEN.Utility.Transparent,
        strokeWidth: 0,
    }
}

const defaultLayout: LoadingBarLayoutScheme = {
    x: 0,
    y: 0,
}

export class LoadingBar {
    private scene: Phaser.Scene;
    private style: LoadingBarStyleScheme;
    private layout: LoadingBarLayoutScheme;

    private GO!: {
        bar: Phaser.GameObjects.Rectangle;
        fill: Phaser.GameObjects.Rectangle;
    };

    constructor(scene: Phaser.Scene, layout?: LoadingBarLayoutScheme, style?: LoadingBarStyleScheme) {
        this.scene = scene;
        this.style = { ...defaultStyle, ...style };
        this.layout = { ...defaultLayout, ...layout };
        this.render();
    }

    public render(): void {
        const fillStartX = this.layout.x - this.style.width / 2 + this.style.paddings;
        const fillHeight = this.style.height - this.style.paddings * 2;

        this.GO = {
            bar: this.scene.add.rectangle(this.layout.x, this.layout.y, this.style.width, this.style.height, this.style.bar.backgroundColor.Numeric).setStrokeStyle(this.style.bar.strokeWidth, this.style.bar.strokeColor.Numeric),
            fill: this.scene.add.rectangle(fillStartX, this.layout.y, 0, fillHeight, this.style.fill.backgroundColor.Numeric).setStrokeStyle(this.style.fill.strokeWidth, this.style.fill.strokeColor.Numeric).setOrigin(0, 0.5),
        }
    }

    public animateFill(
        percentage: number,
        callback?: () => void,
        duration: number = 350,
        ease: string = 'Sine.easeInOut'
    ): void {
        this.scene.tweens.add({
            targets: this.GO.fill,
            width: this.calculateWidth(percentage),
            duration,
            ease,
            onComplete: () => callback?.()
        });
    }

    private calculateWidth(percentage: number): number {
        return this.style.width * percentage - this.style.paddings * 2;
    }
}