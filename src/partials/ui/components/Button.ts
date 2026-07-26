import { COLORTOKEN } from '@/styles/ColorTokens';
import { interpolateColor, interpolateColorToHex } from '@/utils/UtilsColor';
import { createProgressTween, stopTweenSafely } from '@/utils/UtilsTween';
import { TYPETOKEN } from '../../../styles/TypeTokens';

interface StateConfig {
    text: { color: Color };
    background: {
        backgroundColor: Color;
        strokeColor: Color;
        strokeWidth: number;
        cornerRadius: number;
    }
}

interface ButtonState {
    readonly idle: StateConfig;
    readonly hover: StateConfig;
    readonly press: StateConfig;
}

export interface ButtonStyleScheme {
    readonly width: number;
    readonly height: number;
    readonly paddings: { x: number; y: number };
    readonly minWidth: number;
    readonly minHeight: number;
    readonly states: ButtonState;
    readonly animationDuration: {
        readonly hoverIn: number;
        readonly hoverOut: number;
        readonly pressIn: number;
        readonly pressOut: number;
    };
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
    states: {
        idle: {
            text: { color: COLORTOKEN.Component.Button.Primary.Idle.Text.Color },
            background: {
                backgroundColor: COLORTOKEN.Component.Button.Primary.Idle.Background.BackgroundColor,
                strokeColor: COLORTOKEN.Component.Button.Primary.Idle.Background.StrokeColor,
                strokeWidth: 0,
                cornerRadius: 12,
            }
        },
        hover: {
            text: { color: COLORTOKEN.Component.Button.Primary.Hover.Text.Color },
            background: {
                backgroundColor: COLORTOKEN.Component.Button.Primary.Hover.Background.BackgroundColor,
                strokeColor: COLORTOKEN.Component.Button.Primary.Hover.Background.StrokeColor,
                strokeWidth: 0,
                cornerRadius: 12,
            }
        },
        press: {
            text: { color: COLORTOKEN.Component.Button.Primary.Press.Text.Color },
            background: {
                backgroundColor: COLORTOKEN.Component.Button.Primary.Press.Background.BackgroundColor,
                strokeColor: COLORTOKEN.Component.Button.Primary.Press.Background.StrokeColor,
                strokeWidth: 0,
                cornerRadius: 12,
            }
        },
    },
    animationDuration: {
        hoverIn: 0,
        hoverOut: 300,
        pressIn: 0,
        pressOut: 300,
    }
};

const defaultLayout: ButtonLayoutScheme = { x: 0, y: 0 };

export class Button extends Phaser.GameObjects.Container {
    public scene: Phaser.Scene;
    private style: ButtonStyleScheme;
    private layout: ButtonLayoutScheme;
    private buttonText: string;
    private onClickHandler: () => void;
    private tween?: Phaser.Tweens.Tween;
    private currentState: keyof ButtonState = 'idle';

    private GO: {
        background: Phaser.GameObjects.Shape | null;
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
                color: this.style.states.idle.text.color.Hex,
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
            this.style.states.idle.background.backgroundColor.Numeric
        )
            .setStrokeStyle(
                this.style.states.idle.background.strokeWidth,
                this.style.states.idle.background.strokeColor.Numeric
            )
            .setOrigin(0.5)
            .setRounded(this.style.states.idle.background.cornerRadius)

        this.add(this.GO.background);
        this.add(this.GO.text);

        this.setSize(buttonWidth, buttonHeight);
    }

    private setupInteractivity(): void {
        this.GO.background?.setInteractive({ useHandCursor: true })
            .on('pointerover', this.handlePointerEnter, this)
            .on('pointerout', this.handlePointerOut, this)
            .on('pointerdown', this.handlePointerDown, this)
            .on('pointerup', this.handlePointerUp, this);

        this.once(Phaser.GameObjects.Events.DESTROY, this.cleanup, this);
    }
    private cleanup(): void {
        this.tween?.stop();
    }

    private handlePointerEnter(): void {
        this.applyState('hover', this.style.animationDuration.hoverIn);
    }

    private handlePointerOut(): void {
        this.applyState('idle', this.style.animationDuration.hoverOut);
    }

    private handlePointerDown(): void {
        this.applyState('press', this.style.animationDuration.pressIn);
    }
    private handlePointerUp(): void {
        this.applyState('hover', this.style.animationDuration.pressOut);
        this.onClickHandler();
    }


    private applyState(stateName: keyof ButtonState, duration: number): void {
        stopTweenSafely(this.tween);

        const fromState = this.style.states[this.currentState];
        const toState = this.style.states[stateName];
        this.currentState = stateName;

        if (duration === 0) {
            this.applyColorsImmediate(toState);
            return;
        }

        const from = {
            text: Phaser.Display.Color.HexStringToColor(fromState.text.color.Hex),
            background: Phaser.Display.Color.HexStringToColor(fromState.background.backgroundColor.Hex),
            stroke: Phaser.Display.Color.HexStringToColor(fromState.background.strokeColor.Hex),
            cornerRadius: fromState.background.cornerRadius,
        };

        const to = {
            text: Phaser.Display.Color.HexStringToColor(toState.text.color.Hex),
            background: Phaser.Display.Color.HexStringToColor(toState.background.backgroundColor.Hex),
            stroke: Phaser.Display.Color.HexStringToColor(toState.background.strokeColor.Hex),
            cornerRadius: toState.background.cornerRadius,
        };

        this.tween = createProgressTween(this.scene, {
            duration,
            ease: 'Quint.Out',
            onUpdate: (progress) => {
                this.GO.text?.setColor(interpolateColorToHex(from.text, to.text, progress));
                this.GO.background?.setFillStyle(interpolateColor(from.background, to.background, progress));
                this.GO.background?.setStrokeStyle(
                    this.GO.background?.lineWidth,
                    interpolateColor(from.stroke, to.stroke, progress)
                );
            },
        });
    }

    private applyColorsImmediate(state: StateConfig): void {
        this.GO.text?.setColor(state.text.color.Hex);
        this.GO.background?.setFillStyle(state.background.backgroundColor.Numeric);
        this.GO.background?.setStrokeStyle(state.background.strokeWidth, state.background.strokeColor.Numeric);
    }
}