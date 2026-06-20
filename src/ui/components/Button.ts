import Phaser from 'phaser';
import { COLORTOKEN } from '@/ui/styles/ColorTokens';
import { anyToColor } from '@/utils/UtilsColor';
import { TYPETOKEN } from '../styles/TypeTokens';

export interface ButtonStyleScheme {
    width: number;
    height: number;
    paddings: { x: number; y: number };
    minWidth: number;
    minHeight: number;
    state: {
        idle: {
            text: { color: string | CanvasGradient | CanvasPattern };
            background: {
                backgroundColor: number | string;
                strokeColor: number | string;
                strokeWidth: number;
            }
        };
        hover: {
            text: { color: string | CanvasGradient | CanvasPattern };
            background: {
                backgroundColor: number | string;
                strokeColor: number | string;
                strokeWidth: number;
            }
        };
        press: {
            text: { color: string | CanvasGradient | CanvasPattern };
            background: {
                backgroundColor: number | string;
                strokeColor: number | string;
                strokeWidth: number;
            }
        };
    }
}

export interface ButtonLayoutScheme {
    x: number;
    y: number;
}

export interface ButtonInteractScheme {
    onClickHandler: () => {}
}

const defaultStyle: ButtonStyleScheme = {
    width: 250,
    height: 40,
    paddings: { x: 24, y: 8 },
    minWidth: 48,
    minHeight: 48,
    state: {
        idle: {
            text: { color: COLORTOKEN.Foreground.Primary },
            background: {
                backgroundColor: '#ff00ff',
                strokeColor: COLORTOKEN.Foreground.Secondary,
                strokeWidth: 0,
            }
        },
        hover: {
            text: { color: '#ff00ff' },
            background: {
                backgroundColor: '#ff0000',
                strokeColor: COLORTOKEN.Foreground.Secondary,
                strokeWidth: 0,
            }
        },
        press: {
            text: { color: '#ff0000' },
            background: {
                backgroundColor: '#ff00ff',
                strokeColor: COLORTOKEN.Foreground.Secondary,
                strokeWidth: 0,
            }
        },
    }
};

const defaultLayout: ButtonLayoutScheme = { x: 0, y: 0 };

export class Button extends Phaser.GameObjects.Container {
    public scene: Phaser.Scene;
    private style: ButtonStyleScheme;
    private layout: ButtonLayoutScheme;
    private buttonText: string;
    private onClickHandler: () => void;

    private GO: {
        background: Phaser.GameObjects.Rectangle | null;
        text: Phaser.GameObjects.Text | null;
    } = { background: null, text: null };

    constructor(
        scene: Phaser.Scene,
        text: string,
        onClick: () => void,
        layout?: Partial<ButtonLayoutScheme>,
        style?: Partial<ButtonStyleScheme>
    ) {
        super(scene);

        this.scene = scene;
        this.style = { ...defaultStyle, ...style };
        this.layout = { ...defaultLayout, ...layout };
        this.buttonText = text;

        this.onClickHandler = onClick;

        this.setDepth(100);
        
        this.setPosition(this.layout.x, this.layout.y);
        
        scene.add.existing(this);
        this.render();
        this.setupInteractivity();
    }

    private render(): void {
        this.GO.text = new Phaser.GameObjects.Text(
            this.scene,
            0,
            0,
            this.buttonText,
            {
                ...TYPETOKEN.Secondary.Lead,
                color: this.style.state.idle.text.color,
            }
        ).setOrigin(0.5);

        const textWidth = this.GO.text.width;
        const textHeight = this.GO.text.height;

        const buttonWidth = Math.max(textWidth + this.style.paddings.x * 2, this.style.minWidth);
        const buttonHeight = Math.max(textHeight + this.style.paddings.y * 2, this.style.minHeight);

        this.GO.background = new Phaser.GameObjects.Rectangle(
            this.scene,
            0,
            0,
            buttonWidth,
            buttonHeight,
            anyToColor(this.style.state.idle.background.backgroundColor)
        )
            .setStrokeStyle(
                this.style.state.idle.background.strokeWidth,
                anyToColor(this.style.state.idle.background.strokeColor)
            )
            .setOrigin(0.5);

        this.add(this.GO.background);
        this.add(this.GO.text);

        this.setSize(buttonWidth, buttonHeight);
    }

    private setupInteractivity(): void {
        this.GO.background?.setInteractive({ useHandCursor: true })
            .on('pointerover', this.onPointerEnter, this)
            .on('pointerout', this.onPointerOut, this)
            .on('pointerdown', this.onPointerDown, this)
            .on('pointerup', this.onPointerUp, this);
    }

    private onPointerEnter(): void {
        this.GO.text?.setColor(this.style.state.hover.text.color);
        this.GO.background?.setFillStyle(anyToColor(this.style.state.hover.background.backgroundColor));
        this.GO.background?.setStrokeStyle(this.style.state.idle.background.strokeWidth, anyToColor(this.style.state.idle.background.strokeColor));
    }

    private hoverTween?: Phaser.Tweens.Tween;

    private onPointerOut(): void {
        this.hoverTween?.stop();
        const textFrom = Phaser.Display.Color.HexStringToColor(this.style.state.hover.text.color as string);
        const textTo = Phaser.Display.Color.HexStringToColor(this.style.state.idle.text.color as string);
        const backgroundFrom = Phaser.Display.Color.HexStringToColor(this.style.state.hover.background.backgroundColor as string);
        const backgroundTo = Phaser.Display.Color.HexStringToColor(this.style.state.idle.background.backgroundColor as string);
        const strokeFrom = Phaser.Display.Color.HexStringToColor(this.style.state.hover.background.strokeColor as string);
        const strokeTo = Phaser.Display.Color.HexStringToColor(this.style.state.idle.background.strokeColor as string);
        const tweenState = { value: 0, };
        this.hoverTween = this.scene.tweens.add({
            targets: tweenState,
            value: 100,
            duration: 300,
            ease: 'Quint.Out',

            onUpdate: () => {
                const textColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                    textFrom,
                    textTo,
                    100,
                    tweenState.value
                );

                const bgColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                    backgroundFrom,
                    backgroundTo,
                    100,
                    tweenState.value
                );

                const strokeColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                    strokeFrom,
                    strokeTo,
                    100,
                    tweenState.value
                );
                this.GO.text?.setColor(Phaser.Display.Color.RGBToString(textColor.r, textColor.g, textColor.b, 255, '#'));
                this.GO.background?.setFillStyle(Phaser.Display.Color.GetColor(bgColor.r, bgColor.g, bgColor.b));
                this.GO.background?.setStrokeStyle(this.style.state.idle.background.strokeWidth, Phaser.Display.Color.GetColor(strokeColor.r, strokeColor.g, strokeColor.b));
            },
        });
    }

    private onPointerDown(): void {
        this.GO.text?.setColor(this.style.state.press.text.color);
        this.GO.background?.setFillStyle(anyToColor(this.style.state.press.background.backgroundColor));
        this.GO.background?.setStrokeStyle(this.style.state.press.background.strokeWidth, anyToColor(this.style.state.press.background.strokeColor));
    }

    private onPointerUp(): void {
        this.hoverTween?.stop();
        const textFrom = Phaser.Display.Color.HexStringToColor(this.style.state.press.text.color as string);
        const textTo = Phaser.Display.Color.HexStringToColor(this.style.state.hover.text.color as string);
        const backgroundFrom = Phaser.Display.Color.HexStringToColor(this.style.state.press.background.backgroundColor as string);
        const backgroundTo = Phaser.Display.Color.HexStringToColor(this.style.state.hover.background.backgroundColor as string);
        const strokeFrom = Phaser.Display.Color.HexStringToColor(this.style.state.press.background.strokeColor as string);
        const strokeTo = Phaser.Display.Color.HexStringToColor(this.style.state.idle.background.strokeColor as string);
        const tweenState = { value: 0, };
        this.hoverTween = this.scene.tweens.add({
            targets: tweenState,
            value: 100,
            duration: 100,
            ease: 'Quint.Out',

            onUpdate: () => {
                const textColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                    textFrom,
                    textTo,
                    100,
                    tweenState.value
                );

                const bgColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                    backgroundFrom,
                    backgroundTo,
                    100,
                    tweenState.value
                );

                const strokeColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                    strokeFrom,
                    strokeTo,
                    100,
                    tweenState.value
                );
                this.GO.text?.setColor(Phaser.Display.Color.RGBToString(textColor.r, textColor.g, textColor.b, 255, '#'));
                this.GO.background?.setFillStyle(Phaser.Display.Color.GetColor(bgColor.r, bgColor.g, bgColor.b));
                this.GO.background?.setStrokeStyle(this.style.state.idle.background.strokeWidth, Phaser.Display.Color.GetColor(strokeColor.r, strokeColor.g, strokeColor.b));
            }
        })
        this.onClickHandler();
    }
}