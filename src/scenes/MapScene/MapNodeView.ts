import { EncounterType, getNodeDescription, getNodeLabel, getNodeStyles } from '@/data/Map';
import { Tooltip } from '@/partials/ui/components/Tooltip';
import { COLORTOKEN } from '@/styles/ColorTokens';
import { TYPETOKEN } from '@/styles/TypeTokens';

export class MapNodeView extends Phaser.GameObjects.Container {
    private static readonly SIZE = 130;
    private static readonly RADIUS = 20;
    private static readonly PULSE_SCALE = 1.06;
    private static readonly HOVER_SCALE = 1.25;

    private pulseTween?: Phaser.Tweens.Tween;
    private hoverTween?: Phaser.Tweens.Tween;

    private readonly originalAngle: number;

    constructor(
        scene: Phaser.Scene,
        private readonly node: MapNode,
        x: number,
        y: number,
        private readonly onClick: (node: MapNode) => void,
    ) {
        super(scene, x, y);

        this.originalAngle =
            node.type === EncounterType.Start
                ? 0
                : Phaser.Math.Between(-3, 3);

        scene.add.existing(this);

        this.render();
    }

    private render(): void {
        const isAvailableNotVisited = this.node.available && !this.node.visited;
        const isInaccessible = !this.node.available && !this.node.visited;

        const styles = getNodeStyles(this.node, isInaccessible);

        const card = this.renderCard(styles);
        const image = this.createImage();
        const hitArea = this.renderHitArea(isAvailableNotVisited);
        const label = this.renderLabel(styles.textColor);

        this.add([card, image, hitArea, label]);

        const tooltip = new Tooltip(this.scene);

        tooltip.show(
            hitArea,
            getNodeLabel(this.node.type),
            getNodeDescription(this.node.type),
            {},
            { width: 320 },
        );

        if (isAvailableNotVisited) {
            this.setupInteractions(hitArea);
        }
    }

    private renderCard(styles: ReturnType<typeof getNodeStyles>) {
        const half = MapNodeView.SIZE / 2;

        const graphics = this.scene.add.graphics();
        graphics.setAngle(this.originalAngle);

        graphics.fillStyle(styles.backgroundColor);
        graphics.fillRoundedRect(
            -half,
            -half,
            MapNodeView.SIZE,
            MapNodeView.SIZE,
            MapNodeView.RADIUS,
        );

        graphics.lineStyle(3, styles.strokeColor);
        graphics.strokeRoundedRect(
            -half,
            -half,
            MapNodeView.SIZE,
            MapNodeView.SIZE,
            MapNodeView.RADIUS,
        );

        return graphics;
    }

    private renderHitArea(interactive: boolean) {
        const hit = this.scene.add.rectangle(
            0,
            0,
            MapNodeView.SIZE,
            MapNodeView.SIZE,
            0xffffff,
            0,
        );

        hit.setAngle(this.originalAngle);

        if (interactive) {
            hit.setInteractive({ useHandCursor: true });
        }

        return hit;
    }

    private renderLabel(textColor: string) {
        return this.scene.add.text(
            0,
            48,
            this.node.visited ? '' : getNodeLabel(this.node.type),
            {
                ...TYPETOKEN.Secondary.Caption,
                color: textColor,
                shadow: {
                    offsetX: 0,
                    offsetY: 4,
                    color: COLORTOKEN.Background.Zeroth.Hex,
                    blur: 0,
                    stroke: true,
                    fill: true,
                },
            },
        ).setOrigin(0.5);
    }

    private createImage() {
        const texture = this.getTextureKey();

        const image = this.scene.add.image(0, 0, texture ?? '');

        if (!texture) {
            image.setVisible(false);
            return image;
        }

        image.setDisplaySize(MapNodeView.SIZE, MapNodeView.SIZE);
        image.setAngle(this.originalAngle);

        if (!this.node.available) {
            image.postFX?.addColorMatrix()?.saturate(-0.8);
            image.setTint(0x555555);
        }

        return image;
    }

    private getTextureKey(): string | undefined {
        switch (this.node.type) {
            case EncounterType.Start:
                return 'map-node-start';

            case EncounterType.Battle:
                return `map-node-battle-${Phaser.Math.Between(1, 7)}`;

            case EncounterType.Camp:
                return 'map-node-camp';
        }
    }

    private setupInteractions(hitArea: Phaser.GameObjects.Rectangle): void {
        this.startPulse();

        hitArea.on('pointerdown', () => {
            this.onClick(this.node);
        });

        hitArea.on('pointerover', () => {
            this.stopPulse();
            this.hoverTween?.stop();

            this.hoverTween = this.scene.tweens.add({
                targets: this,
                scale: MapNodeView.HOVER_SCALE,
                angle: -this.originalAngle,
                duration: 200,
                ease: 'Quint.easeOut',
            });
        });

        hitArea.on('pointerout', () => {
            this.hoverTween?.stop();

            this.hoverTween = this.scene.tweens.add({
                targets: this,
                scale: 1,
                angle: this.originalAngle,
                duration: 200,
                ease: 'Quint.easeOut',
                onComplete: () => this.startPulse(),
            });
        });
    }

    private startPulse(): void {
        if (this.pulseTween?.isPlaying()) {
            return;
        }

        this.pulseTween = this.scene.tweens.add({
            targets: this,
            scale: MapNodeView.PULSE_SCALE,
            yoyo: true,
            repeat: -1,
            duration: 500,
        });
    }

    private stopPulse(): void {
        this.pulseTween?.stop();
        this.pulseTween = undefined;
    }

    override destroy(fromScene?: boolean): void {
        this.pulseTween?.destroy();
        this.hoverTween?.destroy();

        super.destroy(fromScene);
    }
}