import { Items } from '@/data/Items';
import { DraggableItemBehavior } from '@/partials/battle/DraggableItemBehavior';
import { LootView } from '@/partials/battle/LootView';
import { Tooltip } from '@/partials/ui/components/Tooltip';
import { CombatSystem } from '@/services/CombatSystem';

interface RenderedLoot {
    view: LootView;
    dragBehavior: DraggableItemBehavior;
    detachTooltip: () => void;
}

interface LootPosition {
    x: number;
    y: number;
}

type LootPositionResolver = (combatantId: string) => LootPosition | undefined;

export class ItemsRenderer {
    private readonly scene: Phaser.Scene;
    private readonly combatSystem: CombatSystem;
    private readonly resolveLootPosition: LootPositionResolver;
    private readonly tooltip: Tooltip;
    private readonly renderedLoot = new Map<string, RenderedLoot>();
    private fieldLoot: FieldLoot[] = [];
    private spawnedRewardItems = 0;
    private destroyed = false;

    constructor(
        scene: Phaser.Scene,
        combatSystem: CombatSystem,
        resolveLootPosition: LootPositionResolver,
    ) {
        this.scene = scene;
        this.combatSystem = combatSystem;
        this.resolveLootPosition = resolveLootPosition;
        this.tooltip = new Tooltip(scene);

        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown);
    }

    public render(): void {
        this.fieldLoot.forEach((loot) => {
            if (!this.renderedLoot.has(loot.item.uid)) {
                this.renderLootView(loot, false);
            }
        });
    }

    public clear(): void {
        this.tooltip.hide();

        this.renderedLoot.forEach(({ view, dragBehavior, detachTooltip }) => {
            detachTooltip();
            dragBehavior.destroy();
            view.destroy(true);
        });
        this.renderedLoot.clear();
    }

    public destroy(): void {
        if (this.destroyed) return;

        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown);
        this.clear();
        this.tooltip.destroy(true);
        this.fieldLoot = [];
        this.spawnedRewardItems = 0;
        this.destroyed = true;
    }

    public getFieldLoot(): ReadonlyArray<FieldLoot> {
        return this.fieldLoot.map(({ item, x, y }) => ({
            item: { ...item },
            x,
            y,
        }));
    }

    public spawnPendingCombatLoot(): void {
        while (this.spawnedRewardItems < this.combatSystem.rewards.items.length) {
            const reward = this.combatSystem.rewards.items[this.spawnedRewardItems];
            const position = this.resolveLootPosition(reward.sourceCombatantId);

            if (!position) return;

            this.spawnLoot(reward.itemId, position);
            this.spawnedRewardItems += 1;
        }
    }

    public spawnLoot(itemId: string, position: LootPosition): void {
        if (!Items[itemId]) {
            throw new Error(`Unknown item definition: ${itemId}`);
        }

        const loot: FieldLoot = {
            item: {
                uid: this.generateLootUid(itemId),
                itemId,
            },
            x: position.x,
            y: position.y,
        };

        this.fieldLoot.push(loot);
        this.renderLootView(loot, true);
    }

    private renderLootView(loot: FieldLoot, animateIn: boolean): void {
        const view = new LootView(this.scene, loot.item, loot.x, loot.y);
        const dragBehavior = new DraggableItemBehavior(this.scene, view, {
            dragDepth: 900,
            onDragStart: () => view.stopAnimations(),
        });
        const description = [
            view.itemDefinition.bagText,
            view.itemDefinition.equipText,
            view.itemDefinition.throwText,
        ]
            .filter(Boolean)
            .join('\n');
        const detachTooltip = this.tooltip.show(
            view,
            view.itemDefinition.name,
            description,
            loot.item,
            { width: 300 },
        );

        this.renderedLoot.set(loot.item.uid, {
            view,
            dragBehavior,
            detachTooltip,
        });

        if (animateIn) {
            view.renderThrowEntrance();
            // this.scene.audio.playSFX('replace-with-loot-sfx-key');
        }
        view.renderFloating(animateIn ? LootView.THROW_DURATION : 0);
    }

    private generateLootUid(itemId: string): string {
        return `${itemId}-loot-${Date.now()}-${Math.random()}`;
    }

    private readonly handleSceneShutdown = (): void => {
        this.destroy();
    };
}
