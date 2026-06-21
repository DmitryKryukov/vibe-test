import Phaser from 'phaser';
import { TYPETOKEN } from '../styles/TypeTokens';
import { COLORTOKEN } from '../styles/ColorTokens';
import { anyToColor } from '@/utils/UtilsColor';
import { HeroScheme } from '@/data/Heroes';
import { SquireScheme } from '@/data/Squires';
import { stopTweenSafely } from '@/utils/UtilsTween';
import { parseColor, interpolateColor, interpolateColorToHex } from '@/utils/UtilsColor';
import { createProgressTween } from '@/utils/UtilsTween';
import { interpolateNumber } from '@/utils/UtilsMath';

interface StateConfig {
    name: { color: string };
    class: { color: string };
    portraitBrightness: number;
    background: {
        backgroundColor: string;
        strokeColor: string;
        strokeWidth: number;
        cornerRadius: number;
    }
}

interface SelectorCardState {
    idle: StateConfig;
    hover: StateConfig;
    press: StateConfig;
}

export interface SelectorCardStyleScheme {
    readonly width: number;
    readonly height: number;
    readonly paddings: { x: number; y: number };
    readonly states: SelectorCardState;
    readonly animationDuration: {
        readonly hoverIn: number;
        readonly hoverOut: number;
        readonly pressIn: number;
        readonly pressOut: number;
    };
}

export interface SelectorCardDataScheme<T extends SelectableEntity> {
    entity: T;
}

export interface SelectableEntity {
    id: string;
}

export interface ButtonInteractScheme {
    onClickHandler: () => {}
}

const defaultStyle: SelectorCardStyleScheme = {
    width: 217,
    height: 300,
    paddings: { x: 24, y: 8 },
    states: {
        idle: {
            name: { color: COLORTOKEN.Component.Button.Primary.Idle.Text.Color },
            class: { color: COLORTOKEN.Foreground.Tertiary },
            portraitBrightness: 1,
            background: {
                backgroundColor: COLORTOKEN.Component.SelectorCard.Primary.Unselected.Idle.Background.BackgroundColor,
                strokeColor: COLORTOKEN.Component.Button.Primary.Idle.Background.StrokeColor,
                strokeWidth: 0,
                cornerRadius: 12,
            }
        },
        hover: {
            name: { color: COLORTOKEN.Foreground.Secondary },
            class: { color: COLORTOKEN.Foreground.Secondary },
            portraitBrightness: 1.1,
            background: {
                backgroundColor: COLORTOKEN.Component.SelectorCard.Primary.Unselected.Hover.Background.BackgroundColor,
                strokeColor: COLORTOKEN.Component.Button.Primary.Hover.Background.StrokeColor,
                strokeWidth: 0,
                cornerRadius: 12,
            }
        },
        press: {
            name: { color: COLORTOKEN.Foreground.Primary },
            class: { color: COLORTOKEN.Foreground.Primary },
            portraitBrightness: 1.25,
            background: {
                backgroundColor: COLORTOKEN.Component.SelectorCard.Primary.Unselected.Press.Background.BackgroundColor,
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

export class SelectorCard<T extends SelectableEntity> extends Phaser.GameObjects.Container {
    private selected: boolean;
    private style: SelectorCardStyleScheme;
    private entity: HeroScheme | SquireScheme;
    private maskGraphics!: Phaser.GameObjects.Graphics;
    private tween?: Phaser.Tweens.Tween;
    private fxPlugin!: any;
    private onClickHandler: () => void;

    private GO: {
        name: Phaser.GameObjects.Text | null;
        class: Phaser.GameObjects.Text | null;
        background: Phaser.GameObjects.Shape | null;
        outline: Phaser.GameObjects.Shape | null;
        portrait: Phaser.GameObjects.Image | null;
    } = { name: null, class: null, outline: null, background: null, portrait: null };

    private currentState: keyof SelectorCardState = 'idle';

    constructor(scene: Phaser.Scene, entity: HeroScheme | SquireScheme, selected: boolean, onClick: () => void, style?: SelectorCardStyleScheme) {
        super(scene);
        this.style = { ...defaultStyle, ...style };
        this.setDepth(100);
        this.setPosition(0, 40);
        this.entity = entity;
        this.selected = selected;
        this.onClickHandler = onClick;


        this.render();
        this.setupInteractivity();

        scene.add.existing(this);
       

        this.initFollowMask();
    }

    public setSelected(selected: boolean): void {
        if (this.selected === selected) return;
        this.selected = selected;
        this.applyActiveState();
    }

    private applyActiveState() {
        if (this.selected === true) {
            this.GO.outline?.setStrokeStyle(4, anyToColor(COLORTOKEN.Foreground.Secondary));
            this.style.states.idle = {
                name: { color: COLORTOKEN.Component.Button.Primary.Idle.Text.Color },
                class: { color: COLORTOKEN.Foreground.Tertiary },
                portraitBrightness: 1,
                background: {
                    backgroundColor: COLORTOKEN.Component.SelectorCard.Primary.Selected.Idle.Background.BackgroundColor,
                    strokeColor: COLORTOKEN.Component.Button.Primary.Idle.Background.StrokeColor,
                    strokeWidth: 0,
                    cornerRadius: 12,
                }
            };
            this.style.states.hover = {
                name: { color: COLORTOKEN.Foreground.Secondary },
                class: { color: COLORTOKEN.Foreground.Secondary },
                portraitBrightness: 1.1,
                background: {
                    backgroundColor: COLORTOKEN.Component.SelectorCard.Primary.Selected.Hover.Background.BackgroundColor,
                    strokeColor: COLORTOKEN.Component.Button.Primary.Idle.Background.StrokeColor,
                    strokeWidth: 0,
                    cornerRadius: 12,
                }
            };
            this.style.states.press = {
                name: { color: COLORTOKEN.Foreground.Primary },
                class: { color: COLORTOKEN.Foreground.Primary },
                portraitBrightness: 1.25,
                background: {
                    backgroundColor: COLORTOKEN.Component.SelectorCard.Primary.Selected.Press.Background.BackgroundColor,
                    strokeColor: COLORTOKEN.Component.Button.Primary.Idle.Background.StrokeColor,
                    strokeWidth: 0,
                    cornerRadius: 12,
                }
            };
        }
        else {
            this.style.states.idle = {
                name: { color: COLORTOKEN.Component.Button.Primary.Idle.Text.Color },
                class: { color: COLORTOKEN.Foreground.Tertiary },
                portraitBrightness: 1,
                background: {
                    backgroundColor: COLORTOKEN.Component.Button.Primary.Idle.Background.BackgroundColor,
                    strokeColor: COLORTOKEN.Component.Button.Primary.Idle.Background.StrokeColor,
                    strokeWidth: 0,
                    cornerRadius: 12,
                }
            };
            this.style.states.hover = {
                name: { color: COLORTOKEN.Component.Button.Primary.Idle.Text.Color },
                class: { color: COLORTOKEN.Foreground.Tertiary },
                portraitBrightness: 1,
                background: {
                    backgroundColor: COLORTOKEN.Component.Button.Primary.Idle.Background.BackgroundColor,
                    strokeColor: COLORTOKEN.Component.Button.Primary.Idle.Background.StrokeColor,
                    strokeWidth: 0,
                    cornerRadius: 12,
                }
            };
            this.style.states.press = {
                name: { color: COLORTOKEN.Component.Button.Primary.Idle.Text.Color },
                class: { color: COLORTOKEN.Foreground.Tertiary },
                portraitBrightness: 1,
                background: {
                    backgroundColor: COLORTOKEN.Component.Button.Primary.Idle.Background.BackgroundColor,
                    strokeColor: COLORTOKEN.Component.Button.Primary.Idle.Background.StrokeColor,
                    strokeWidth: 0,
                    cornerRadius: 12,
                }
            };
            
        }

        this.applyState('idle', 0);
    }

    private render() {
        this.renderBackground();
        this.renderPortrait(this.entity);
        this.renderText(this.entity);
        this.applyActiveState();
    }

    private initFollowMask() {
        this.maskGraphics = this.scene.add.graphics();
        this.maskGraphics.setVisible(false);

        const roundedMask = this.maskGraphics.createGeometryMask();
        this.setMask(roundedMask);

        this.scene.events.on(Phaser.Scenes.Events.PRE_RENDER, this.updateMaskPosition, this);

        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            if (this.scene) {
                this.scene.events.off(Phaser.Scenes.Events.PRE_RENDER, this.updateMaskPosition, this);
            }
            if (this.maskGraphics) {
                this.maskGraphics.destroy();
            }
        });
    }

    private updateMaskPosition() {
        if (!this.active || !this.maskGraphics) return;

        const matrix = this.getWorldTransformMatrix();

        this.maskGraphics.clear();
        this.maskGraphics.fillStyle(0xffffff, 1);
        this.maskGraphics.fillRoundedRect(
            matrix.tx,
            matrix.ty,
            this.style.width,
            this.style.height,
            this.style.states.idle.background.cornerRadius
        );
    }

    private renderText(entity: HeroScheme | SquireScheme): void {

        this.GO.name = new Phaser.GameObjects.Text(
            this.scene, 10, this.style.height - 30, entity.name, { ...TYPETOKEN.Tertiary.Lead }
        ).setOrigin(0, 1).setLetterSpacing(1);

        this.GO.class = new Phaser.GameObjects.Text(
            this.scene, 11, this.style.height - 9, entity.class, { ...TYPETOKEN.Secondary.Caption, ...{ color: this.style.states.idle.class.color, } }
        ).setOrigin(0, 1);

        const fadeGraphics = this.scene.add.graphics();
        const fadeHeight = 180;

        fadeGraphics.fillGradientStyle(
            anyToColor(COLORTOKEN.Background.Zeroth), anyToColor(COLORTOKEN.Background.Primary),
            anyToColor(COLORTOKEN.Background.Zeroth), anyToColor(COLORTOKEN.Background.Primary),
            0, 0,
            1, 1
        );

        fadeGraphics.fillRect(0, this.style.height - fadeHeight, this.style.width, fadeHeight);
        this.add(fadeGraphics);

        this.add(this.GO.name);
        this.add(this.GO.class);
        this.GO.outline = new Phaser.GameObjects.Rectangle(
            this.scene, 0, 0, this.style.width, this.style.height)
            .setOrigin(0)
            .setRounded(this.style.states.idle.background.cornerRadius);
        this.add(this.GO.outline);

    }

    private renderPortrait(entity: HeroScheme | SquireScheme): void {
        const portraitKey = `${entity.id}-portrait`;
        if (this.scene.textures.exists(portraitKey)) {
            const source = this.scene.textures.get(portraitKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
            const scale = Math.min(
                this.style.width / source.width,
                this.style.height / source.height
            );
            this.GO.portrait = new Phaser.GameObjects.Image(this.scene, 0, 0, portraitKey)
                .setDisplaySize(source.width * scale, source.height * scale)
                .setOrigin(0);
            this.add(this.GO.portrait);

            this.fxPlugin = this.GO.portrait?.preFX?.addColorMatrix()
            return;
        }
    }

    private renderBackground(): void {
        this.GO.background = new Phaser.GameObjects.Rectangle(
            this.scene, 0, 0, this.style.width, this.style.height, anyToColor(this.style.states.idle.background.backgroundColor)
        ).setOrigin(0).setRounded(this.style.states.idle.background.cornerRadius);
        this.add(this.GO.background);
    }

    private setupInteractivity(): void {
        this.GO.background?.setInteractive({ useHandCursor: true })
            .on('pointerover', this.handlePointerEnter, this)
            .on('pointerout', this.handlePointerOut, this)
            .on('pointerdown', this.handlePointerDown, this)
            .on('pointerup', this.handlePointerUp, this);
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

    private applyState(stateName: keyof SelectorCardState, duration: number): void {
        stopTweenSafely(this.tween);

        const fromState = this.style.states[this.currentState];
        const toState = this.style.states[stateName];
        this.currentState = stateName;

        if (duration === 0) {
            this.applyColorsImmediate(toState);
            return;
        }

        const from = {
            name: parseColor(fromState.name.color),
            class: parseColor(fromState.class.color),
            background: parseColor(fromState.background.backgroundColor),
            stroke: parseColor(fromState.background.strokeColor),
            cornerRadius: fromState.background.cornerRadius,
            portraitBrightness: fromState.portraitBrightness,
        };

        const to = {
            text: parseColor(toState.name.color),
            class: parseColor(toState.class.color),
            background: parseColor(toState.background.backgroundColor),
            stroke: parseColor(toState.background.strokeColor),
            cornerRadius: toState.background.cornerRadius,
            portraitBrightness: toState.portraitBrightness,
        };

        this.tween = createProgressTween(this.scene, {
            duration,
            ease: 'Quint.Out',
            onUpdate: (progress) => {
                this.GO.name?.setColor(interpolateColorToHex(from.name, to.text, progress));
                this.GO.class?.setColor(interpolateColorToHex(from.class, to.class, progress));
                this.GO.background?.setFillStyle(interpolateColor(from.background, to.background, progress));
                this.GO.background?.setStrokeStyle(
                    this.GO.background?.lineWidth,
                    interpolateColor(from.stroke, to.stroke, progress)
                );

                this.fxPlugin.brightness(interpolateNumber(from.portraitBrightness, to.portraitBrightness, progress));
            },
        });
    }

    private applyColorsImmediate(state: StateConfig): void {
        this.GO.name?.setColor(state.name.color);
        this.GO.class?.setColor(state.class.color);
        this.GO.background?.setFillStyle(anyToColor(state.background.backgroundColor));
        this.GO.background?.setStrokeStyle(state.background.strokeWidth, anyToColor(state.background.strokeColor));

        this.fxPlugin?.brightness(state.portraitBrightness);
    }

    public override destroy(fromScene?: boolean): void {
        this.GO.background?.removeAllListeners();
        super.destroy(fromScene);
    }
}

/*

export interface SelectorCardConfig<T extends SelectableEntity> {
attachTooltip?: (target: Phaser.GameObjects.GameObject, entity: T) => void;
}

export class SelectorCard<T extends SelectableEntity> extends Phaser.GameObjects.Container {
 
constructor(scene: Phaser.Scene, x: number, y: number, config: SelectorCardConfig<T>) {
config.attachTooltip?.(this.background, config.entity);
}
}

*/