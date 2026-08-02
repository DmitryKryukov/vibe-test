import { Items } from '@/data/Items';
import { CombatSystem } from '@/services/CombatSystem';
import { screenBounds, screenToWorld } from '@/utils/UtilsLayout';
import { BattleSceneRenderer } from './BattleRenderer';
import { Tooltip } from '@/partials/ui/components/Tooltip';

export class ItemsRenderer {
    public fieldLoot: FieldLoot[] = [];
    private scene: Phaser.Scene;
    private sceneRenderer: BattleSceneRenderer;
    private lootItems: Phaser.GameObjects.Container[] = [];
    private combatSystem: CombatSystem;
    private spawnedRewardItems = 0;

    constructor(scene: Phaser.Scene, combatSystem: CombatSystem, sceneRenderer: BattleSceneRenderer) {
        this.scene = scene;
        this.combatSystem = combatSystem;
        this.sceneRenderer = sceneRenderer;
    }

    render() {
    }

    clear() {
        this.lootItems = [];
        //this.bagSlotZones = [];
        //this.equipZones = [];
        //this.slotHighlights = [];
    }

    /*
        private renderStaticItem(item: InventoryItem, index: number): void {
            const screen = screenBounds(this.scene);
            const pos = screenToWorld(
                this.scene,
                124 + Math.floor(index / 2) * 76,
                screen.bottom - 141 + (index % 2) * 76
            );
            const container = this.renderItem(item, pos.x, pos.y);
            //container.setData('bagIndex', index);
            //container.setData('origin', 'bag');
        }
    */
    public renderItem(item: InventoryItem, x: number, y: number): Phaser.GameObjects.Container {
        const itemData = Items[item.itemId];
        const container = this.scene.add.container(x, y).setDepth(500);
        container.setData('itemUid', item.uid);
        container.setData('startX', x);
        container.setData('startY', y);
        const background = this.scene.add.rectangle(0, 0, 58, 58, itemData.color, 0.98).setStrokeStyle(3, 0x090909);
        const icon = this.drawItemIcon(item.itemId, 0, 0, 48);
        container.add([background, icon]);
        container.add([background, icon]);
        container.setSize(58, 58);
        return container;
    }

    /*
    private renderStaticEquipmentItem(item: InventoryItem, index: number): void {
        const pos = screenToWorld(this.scene, 10 + 124 + (index % 3) * 76, 10 + 38 + Math.floor(index / 3) * 76);
        const container = this.renderItem(item, pos.x, pos.y);
        container.setData('slotIndex', index);
        container.setData('origin', 'equipment');
    }
    */



    /*
    private drawFieldLoot(): void {
        this.fieldLoot.forEach((loot) => this.createFieldLootObject(loot.item, loot.x, loot.y, false));
    }
        */


    /*
        public removeFieldLoot(uid: string): void {
            this.fieldLoot = this.fieldLoot.filter((loot) => loot.item.uid !== uid);
            this.lootItems = this.lootItems.filter((loot) => loot.getData('itemUid') !== uid);
        }
    */

    public spawnPendingCombatLoot(): void {
        const pending = this.combatSystem.rewards.items.slice(this.spawnedRewardItems);
        const removed = [...this.sceneRenderer.removedEnemies];
        pending.forEach((itemId, index) => {
            //const deadEnemyId = removed[removed.length - pending.length + index];
            this.spawnLoot(
                itemId,
                (Phaser.Math.Between(720, 940)) + Phaser.Math.Between(-42, 42),
                (Phaser.Math.Between(560, 820)) + Phaser.Math.Between(28, 86)
            );

            //this.ui.toast(`Выпал артефакт: ${ITEMS[itemId].name}`);
        });

        this.spawnedRewardItems = this.combatSystem.rewards.items.length;
    }

    public spawnLoot(itemId: string, x?: number, y?: number): void {
        const posX = x ?? Phaser.Math.Between(720, 940);
        const posY = y ?? Phaser.Math.Between(560, 820);
        const item: InventoryItem = { uid: `${itemId}-loot-${Date.now()}-${Math.random()}`, itemId };
        this.fieldLoot.push({ item, x: posX, y: posY });
        this.renderFieldLootObject(item, posX, posY, true);
    }

    private renderFieldLootObject(item: InventoryItem, x: number, y: number, animateIn: boolean): void {
        const Loot = this.renderDraggableItem(item, x, y, "");
        this.lootItems.push(Loot);
        if (animateIn) {
            Loot.setScale(0.2);
            Loot.setAlpha(0);
            Loot.setY(y - 70);
            this.scene.tweens.add({
                targets: Loot,
                alpha: 1,
                scale: 1,
                y,
                duration: 360,
                ease: 'Back.Out',
            });
        }

        this.scene.tweens.add({
            targets: Loot,
            y: y - 22,
            yoyo: true,
            repeat: -1,
            duration: 900,
            delay: animateIn ? 260 : 0,
        });
    }

    renderDraggableItem(item: InventoryItem, x: number, y: number, origin: string): Phaser.GameObjects.Container {
        const data = Items[item.itemId];
        const container = this.scene.add.container(x, y).setDepth(500);
        container.setData('itemUid', item.uid);
        container.setData('origin', origin);
        container.setData('startX', x);
        container.setData('startY', y);
        container.setData('lastParticleAt', 0);
        const background = this.scene.add.rectangle(0, 0, 58, 58, data.color, 0.98).setStrokeStyle(3, 0x090909);
        container.add([background, this.drawItemIcon(item.itemId, 0, 0, 48)]);
        container.setSize(58, 58);
        container.setInteractive({ draggable: true, useHandCursor: true });
        this.scene.input.setDraggable(container);
        container.on('dragstart', () => {
            this.scene.tweens.killTweensOf(container);
            container.setScale(1);
            container.setDepth(900);
            //this.showSlotHighlights(item.itemId);
        });

        container.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            container.setPosition(dragX, dragY);
            //this.scene.emitDragParticle(container);
        });
        const tooltip = new Tooltip(this.scene); const description = [
            data.bagText,
            data.equipText,
            data.throwText,
        ]
            .filter(Boolean)
            .join('\n');

        tooltip.show(container, data.name, description, item, { width: 300 });

        return container;
    }

    drawItemIcon(itemId: string, x: number, y: number, size: number): Phaser.GameObjects.GameObject {
        const key = this.itemTextureKey(itemId);
        if (this.scene.textures.exists(key)) {
            return this.scene.add.image(x, y, key).setDisplaySize(size, size).setDepth(2);
        }
        return this.scene.add.text(x, y, Items[itemId].glyph, { resolution: Math.min(window.devicePixelRatio || 1, 2), fontSize: `${Math.floor(size * 0.46)}px`, color: '#170b08' }).setOrigin(0.5);
    }

    itemTextureKey(itemId: string): string {
        return `icon-item-${itemId}`;
    }
}