import { interpolateColor, interpolateColorToHex } from '@/utils/UtilsColor';
import { createProgressTween, stopTweenSafely } from '@/utils/UtilsTween';

export interface BaseStateConfig {
    background: {
        backgroundColor: Color;
        strokeColor: Color;
        strokeWidth: number;
        cornerRadius: number;
    };
}

export interface BaseStyleScheme {
    width: number;
    height: number;
    paddings: { x: number; y: number };
    states: {
        idle: BaseStateConfig;
        hover: BaseStateConfig;
        press: BaseStateConfig;
    };
    animationDuration: {
        hoverIn: number;
        hoverOut: number;
        pressIn: number;
        pressOut: number;
    };
}

/**
 * Абстрактный базовый класс для интерактивных карточек/кнопок.
 * Управляет состояниями, анимацией переходов и интерактивностью.
 * @template TState - конкретный тип состояния (расширяет BaseStateConfig)
 * @template TStyle - конкретный тип стиля (расширяет BaseStyleScheme)
 */
export abstract class InteractiveCard<
    TState extends BaseStateConfig,
    TStyle extends BaseStyleScheme
> extends Phaser.GameObjects.Container {
    protected style: TStyle;
    protected tween?: Phaser.Tweens.Tween;
    protected currentState: keyof TStyle['states'] = 'idle';

    protected GO: {
        background: Phaser.GameObjects.Shape | null;
        textObjects: Phaser.GameObjects.Text[];
    } = { background: null, textObjects: [] };

    constructor(scene: Phaser.Scene, style: TStyle) {
        super(scene);
        this.style = style;
        scene.add.existing(this);
        this.render();
        this.setupInteractivity();
    }

    protected render(): void {
        this.renderBackground();
        this.renderContent();
    }

    protected renderBackground(): void {
        const state = this.style.states.idle;
        this.GO.background = new Phaser.GameObjects.Rectangle(
            this.scene,
            0,
            0,
            this.style.width,
            this.style.height,
            state.background.backgroundColor.Numeric
        )
            .setOrigin(0)
            .setRounded(state.background.cornerRadius)
            .setStrokeStyle(
                state.background.strokeWidth,
                state.background.strokeColor.Numeric
            );
        this.add(this.GO.background);
    }

    protected abstract renderContent(): void;

    protected abstract getTextObjects(): Phaser.GameObjects.Text[];

    protected abstract getStateTextColors(state: TState): string[];

    protected abstract applyExtraStateTransition(
        fromState: TState,
        toState: TState,
        progress: number
    ): void;

    protected abstract applyExtraStateImmediate(state: TState): void;

    protected setupInteractivity(): void {
        this.GO.background?.setInteractive({ useHandCursor: true })
            .on('pointerover', this.handlePointerEnter, this)
            .on('pointerout', this.handlePointerOut, this)
            .on('pointerdown', this.handlePointerDown, this)
            .on('pointerup', this.handlePointerUp, this);

        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.tween?.stop();
            this.GO.background?.removeAllListeners();
        });
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
        this.handleClick(); // абстрактный метод для обработки клика
    }

    /** Должен быть переопределён в наследнике для вызова переданного onClick. */
    protected abstract handleClick(): void;

    protected applyState(stateName: keyof TStyle['states'], duration: number): void {
        stopTweenSafely(this.tween);

        const fromState = (this.style.states as any)[this.currentState] as TState;
        const toState = (this.style.states as any)[stateName] as TState;
        this.currentState = stateName;

        if (duration === 0) {
            this.applyColorsImmediate(toState);
            return;
        }

        const fromTextColors = this.getStateTextColors(fromState);
        const toTextColors = this.getStateTextColors(toState);

        const fromBg = fromState.background;
        const toBg = toState.background;
        const fromBgColor = Phaser.Display.Color.HexStringToColor(fromBg.backgroundColor.Hex);
        const toBgColor = Phaser.Display.Color.HexStringToColor(toBg.backgroundColor.Hex);
        const fromStrokeColor = Phaser.Display.Color.HexStringToColor(fromBg.strokeColor.Hex);
        const toStrokeColor = Phaser.Display.Color.HexStringToColor(toBg.strokeColor.Hex);

        this.tween = createProgressTween(this.scene, {
            duration,
            ease: 'Quint.Out',
            onUpdate: (progress) => {
                const texts = this.getTextObjects();
                for (let i = 0; i < texts.length; i++) {
                    const color = interpolateColorToHex(
                        Phaser.Display.Color.HexStringToColor(fromTextColors[i]),
                        Phaser.Display.Color.HexStringToColor(toTextColors[i]),
                        progress
                    );
                    texts[i].setColor(color);
                }

                const bgColor = interpolateColor(fromBgColor, toBgColor, progress);
                this.GO.background?.setFillStyle(bgColor);
                const strokeColor = interpolateColor(fromStrokeColor, toStrokeColor, progress);
                this.GO.background?.setStrokeStyle(
                    this.GO.background?.lineWidth || 0,
                    strokeColor
                );

                this.applyExtraStateTransition(fromState, toState, progress);
            },
        });
    }

    protected applyColorsImmediate(state: TState): void {
        const texts = this.getTextObjects();
        const colors = this.getStateTextColors(state);
        for (let i = 0; i < texts.length; i++) {
            texts[i].setColor(colors[i]);
        }

        const bg = state.background;
        this.GO.background?.setFillStyle(bg.backgroundColor.Numeric);
        this.GO.background?.setStrokeStyle(bg.strokeWidth, bg.strokeColor.Numeric);

        this.applyExtraStateImmediate(state);
    }
}