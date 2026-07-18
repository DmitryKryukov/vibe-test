import Phaser from "phaser";
import { Combatant } from "@/services/CombatantFactory";
import { CombatantView } from "./CombatantView";
import { StatusEffect } from "@/services/StatusSystem";
import { Tooltip } from "@/ui/components/Tooltip";
import { anyToColor } from "@/utils/UtilsColor";
import { COLORTOKEN } from "@/ui/styles/ColorTokens";
import { StatusInfo } from "@/data/Statuses";
import { TYPETOKEN } from "@/ui/styles/TypeTokens";

export class StatusBar extends Phaser.GameObjects.Container {
    private readonly combatantView: CombatantView;

    private static readonly GAP = 4;
    private static readonly PADDING_H = 2;
    private static readonly PADDING_V = 2;

    private readonly root: Phaser.GameObjects.Container;

    private target!: Combatant;

    private tooltips: Tooltip[] = [];
    private tooltipProxy: Tooltip;

    constructor(scene: Phaser.Scene, combatantView: CombatantView, target: Combatant) {
        super(scene)
        this.combatantView = combatantView;
        this.root = this.scene.add.container(0, 0);
        this.target = target;
        this.root.setPosition(combatantView.statusBarAnchor.x, combatantView.statusBarAnchor.y);

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.tooltipProxy = new Tooltip(this.scene);

        this.on(Phaser.GameObjects.Events.DESTROY, () => {
            this.cleanup();
        });
    }

    public update(): void {
        const compactMap = new Map<string, { id: string; label: string; stacks: number }>();
        this.root.removeAll(true);

        this.target.statuses.forEach((status, index) => {
            const existing = compactMap.get(status.id);
            compactMap.set(status.id, {
                id: status.id,
                label: status.label,
                stacks: Math.max(status.stacks, existing?.stacks ?? 0),
            });
            this.renderStatusBar(status, compactMap, index);
        })
    }

    private renderStatusBar(status: StatusEffect, compact: Map<string, { id: string; label: string; stacks: number }>, index: number) {
        const { PADDING_H, PADDING_V, GAP } = StatusBar;
        const info = StatusInfo[status.id as keyof typeof StatusInfo];
        const y = index * 40;

        const background = this.scene.add.rectangle(0, 0, 0, 0, anyToColor(COLORTOKEN.Background.Zeroth));
        const iconSize = 32;

        const iconKey = `icon-status-${status.id}`;
        const icon = this.scene.textures.exists(iconKey)
            ? this.scene.add.image(0 + PADDING_H + iconSize / 2,PADDING_V + iconSize / 2, iconKey).setDisplaySize(iconSize , iconSize )
            : this.scene.add.circle(0 + PADDING_H + iconSize / 2,PADDING_V + iconSize / 2, iconSize / 2, anyToColor(info.color));

        const stackText = status.stacks > 1 ? `: ${status.stacks}` : '';
        const label = this.scene.add.text(0 + icon.displayWidth + PADDING_H + GAP, PADDING_V + icon.displayHeight / 2, `${info.name}${stackText}`, { ...TYPETOKEN.Secondary.Body, color: info.color }).setOrigin(0, .5);
        background.width = PADDING_H + icon.displayWidth + GAP + label.width + PADDING_H * 4;
        background.height = icon.displayHeight + PADDING_V * 2;

        const offsetX = background.width / 2;
        const offsetY = background.height / 2;

        background.setPosition(-offsetX, -offsetY - y);
        icon.setPosition(PADDING_H + iconSize / 2 - offsetX,PADDING_V + iconSize / 2 - offsetY - y);
        label.setPosition(PADDING_H + icon.displayWidth + GAP - offsetX,PADDING_V + icon.displayHeight / 2 - offsetY - y);

        this.root.add([background, icon, label]);

        //Эта штука уничтожается и не успевается сработать, нужно будет как-то перепилить на событии, видимо
        
        background.setInteractive({ useHandCursor: true })

        this.tooltipProxy.show(
            background,
            info.name,
            info.description,
            this.target,
            { width: 390 }
        );
    }

    private cleanup(): void {
        this.root.removeAll(true);
        this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    public destroy(): void {
         this.cleanup();
         super.destroy(true);
    }
}

