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
    background: {
        backgroundColor: string;
        strokeColor: string;
        strokeWidth: number;
        cornerRadius: number;
    }
}

interface LockedSelectorCardState {
    idle: StateConfig;
}

export interface LockedSelectorCardStyleScheme {
    width: number;
    height: number;
    paddings: { x: number; y: number };
    states: LockedSelectorCardState;
}

export interface LockedSelectorCardDataScheme<T extends SelectableEntity> {
    entity: T;
}

export interface SelectableEntity {
    id: string;
}

export interface LockedSelectorCardInteractScheme {
    onClickHandler: () => {}
}

const defaultStyle: LockedSelectorCardStyleScheme = {
    width: 217,
    height: 300,
    paddings: { x: 24, y: 8 },
    states: {
        idle: {
            background: {
                backgroundColor: COLORTOKEN.Component.SelectorCard.Primary.Unselected.Idle.Background.BackgroundColor,
                strokeColor: COLORTOKEN.Component.Button.Primary.Idle.Background.StrokeColor,
                strokeWidth: 0,
                cornerRadius: 12,
            }
        },
    },
};

export class LockedSelectorCard<T extends SelectableEntity> extends Phaser.GameObjects.Container {
    private style: LockedSelectorCardStyleScheme;
    private maskGraphics!: Phaser.GameObjects.Graphics;

    private GO: {
        name: Phaser.GameObjects.Text | null;
        class: Phaser.GameObjects.Text | null;
        background: Phaser.GameObjects.Shape | null;
        outline: Phaser.GameObjects.Shape | null;
        portrait: Phaser.GameObjects.Image | null;
    } = {
            name: null,
            class: null,
            background: null,
            outline: null,
            portrait: null
        }

    private currentState: keyof LockedSelectorCardState = 'idle';

    constructor(scene: Phaser.Scene, tooltip: any, style?: LockedSelectorCardStyleScheme) {
        super(scene);
        this.style = { ...defaultStyle, ...style };
        this.setDepth(100);
        this.setPosition(0, 40);

        this.render();

        scene.add.existing(this);
        this.initFollowMask();

        tooltip?.(this.GO.background, { name: 'Этот персонаж закрыт', locked: true });
    }

    private render() {
        this.renderBackground();
        this.renderPortrait();
        this.GO.background?.setInteractive({ useHandCursor: false })
    }

    private initFollowMask() {
        this.maskGraphics = this.scene.add.graphics();
        this.maskGraphics.setVisible(false);

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

    private renderPortrait(): void {
        const portraitKey = 'locked-portrait';
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

            return;
        }
    }

    private renderBackground(): void {
        this.GO.background = new Phaser.GameObjects.Rectangle(
            this.scene, 0, 0, this.style.width, this.style.height, anyToColor(this.style.states.idle.background.backgroundColor)
        ).setOrigin(0).setRounded(this.style.states.idle.background.cornerRadius);
        this.add(this.GO.background);
    }

    public override destroy(fromScene?: boolean): void {
        this.GO.background?.removeAllListeners();
        super.destroy(fromScene);
    }
}
