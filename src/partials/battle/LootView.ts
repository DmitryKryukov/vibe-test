import { Items } from '@/data/Items';

const LOOT_SIZE = 58;
const ICON_SIZE = 48;
const LOOT_DEPTH = 500;
const THROW_HEIGHT = 96;
const THROW_RISE_DURATION = 220;
const THROW_FALL_DURATION = 320;

export class LootView extends Phaser.GameObjects.Container {
    public static readonly THROW_DURATION = THROW_RISE_DURATION + THROW_FALL_DURATION;

    public readonly item: InventoryItem;
    public readonly itemDefinition: ItemDefinition;

    private readonly visualRoot: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene, item: InventoryItem, x: number, y: number, origin = 'loot') {
        super(scene, x, y);

        const itemDefinition = Items[item.itemId];
        if (!itemDefinition) {
            throw new Error(`Unknown item definition: ${item.itemId}`);
        }

        this.item = item;
        this.itemDefinition = itemDefinition;
        this.visualRoot = this.scene.add.container(0, 0);

        this.scene.add.existing(this);
        this.setDepth(LOOT_DEPTH);
        this.setSize(LOOT_SIZE, LOOT_SIZE);
        this.setData('itemUid', item.uid);
        this.setData('origin', origin);
        this.setData('startX', x);
        this.setData('startY', y);

        this.renderLoot();
    }

    public renderThrowEntrance(): void {
        const targetY = this.y;

        this.setScale(0.65);
        this.setAlpha(0);
        this.setY(targetY);

        this.scene.tweens.chain({
            targets: this,
            tweens: [
                {
                    alpha: 1,
                    scale: 1.1,
                    y: targetY - THROW_HEIGHT,
                    duration: THROW_RISE_DURATION,
                    ease: 'Cubic.Out',
                },
                {
                    scale: 1,
                    y: targetY,
                    duration: THROW_FALL_DURATION,
                    ease: 'Bounce.Out',
                },
            ],
        });
    }

    public renderFloating(delay = 0): void {
        this.scene.tweens.killTweensOf(this.visualRoot);
        this.visualRoot.setY(0);

        this.scene.tweens.add({
            targets: this.visualRoot,
            y: -22,
            yoyo: true,
            repeat: -1,
            duration: 900,
            delay,
        });
    }

    public stopAnimations(): void {
        if (!this.scene) return;

        this.scene.tweens.killTweensOf(this);
        this.scene.tweens.killTweensOf(this.visualRoot);
        this.setAlpha(1);
        this.setScale(1);
        this.visualRoot.setY(0);
    }

    public override destroy(fromScene?: boolean): void {
        if (!this.scene) return;

        this.stopAnimations();
        super.destroy(fromScene);
    }

    private renderLoot(): void {
        const background = this.scene.add
            .rectangle(0, 0, LOOT_SIZE, LOOT_SIZE, this.itemDefinition.color, 1)
            .setStrokeStyle(3, 0x090909);

        this.visualRoot.add([
            background,
            this.renderItemIcon(0, 0, ICON_SIZE),
        ]);
        this.add(this.visualRoot);
    }

    private renderItemIcon(x: number, y: number, size: number): Phaser.GameObjects.GameObject {
        const textureKey = this.resolveItemTextureKey();

        if (this.scene.textures.exists(textureKey)) {
            return this.scene.add.image(x, y, textureKey).setDisplaySize(size, size).setDepth(2);
        }

        return this.scene.add.text(x, y, this.itemDefinition.glyph, {
            resolution: Math.min(window.devicePixelRatio || 1, 2),
            fontSize: `${Math.floor(size * 0.46)}px`,
            color: '#170b08',
        }).setOrigin(0.5);
    }

    private resolveItemTextureKey(): string {
        return `icon-item-${this.item.itemId}`;
    }
}
