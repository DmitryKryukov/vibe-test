import Phaser from "phaser";
import { CombatantView } from "./CombatantView";
import { Combatant, StatusEffect } from "@/services/CombatSystem";
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
    constructor(scene: Phaser.Scene, combatantView: CombatantView, target: Combatant) {
        super(scene)
        this.combatantView = combatantView;
        this.root = this.scene.add.container(0, 0);
        this.target = target;
        this.root.setPosition(combatantView.statusBarAnchor.x, combatantView.statusBarAnchor.y);

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);

        this.on(Phaser.GameObjects.Events.DESTROY, () => {
            this.cleanup();
        });
    }
    private initStatusBar(): void {
        /*
        container.removeAll(true);
        [...compact.values()].slice(0, 5).forEach((status, index) => {
            const info = StatusInfo[status.id as keyof typeof StatusInfo];
            const width = Phaser.Math.Clamp(74 + info.name.length * 8 + (status.stacks > 1 ? 30 : 0), 118, 184);
            const x = (index - Math.min(4, compact.size - 1) / 2) * 148;
            const bg = this.scene.add.rectangle(x, 0, width, 30, 0x141414, 0.9).setStrokeStyle(1, 0xb44737, 0.9);
            const iconKey = `icon-status-${status.id}`;
            const icon = this.scene.textures.exists(iconKey)
                ? this.scene.add.image(x - width / 2 + 18, 0, iconKey).setDisplaySize(24, 24)
                : this.scene.add.circle(x - width / 2 + 18, 0, 9, 0xb44737);
            const stackText = status.stacks > 1 ? ` ${status.stacks}` : '';
            const label = this.scene.add.text(x - width / 2 + 36, 0, `${info.name}${stackText}`, {
                resolution: Math.min(window.devicePixelRatio || 1, 2),
                fontSize: '12px',
                color: '#ffd0c6',
            }).setOrigin(0, 0.5);
            const hit = this.scene.add.zone(x, 0, width, 30);
            
            this.ui.tooltip(
              hit.setInteractive({ useHandCursor: false }),
              info.name,
              [info.description, status.stacks > 1 ? `Стаков: ${status.stacks}` : undefined]
                .filter(Boolean)
                .join('\n')
            );
            container.add([bg, icon, label, hit]);
        });
    })
    */
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
            this.root.removeAll(true);
            this.renderStatusBar(status, compactMap, index);
        })
        /*
        const targets = [this.combatSystem.hero, ...this.combatSystem.enemies.filter((enemy) => enemy.alive)];
        const container = this.statusContainers.get(target.id);
        targets.forEach((target) => {
          if (!container) return;
    
          target.statuses.forEach((status) => {
          });
    
          const signature = [...compact.values()].map((s) => `${s.id}:${s.stacks}`).join('|');
          if (this.statusSignatures.get(target.id) === signature) return;
    
          container.removeAll(true);
          [...compact.values()].slice(0, 5).forEach((status, index) => {
            
            const stackText = status.stacks > 1 ? ` ${status.stacks}` : '';
            const label = this.scene.add.text(x - width / 2 + 36, 0, `${info.name}${stackText}`, {
              resolution: Math.min(window.devicePixelRatio || 1, 2),
              fontSize: '12px',
              color: '#ffd0c6',
            }).setOrigin(0, 0.5);
            const hit = this.scene.add.zone(x, 0, width, 30);
            /*
            this.ui.tooltip(
              hit.setInteractive({ useHandCursor: false }),
              info.name,
              [info.description, status.stacks > 1 ? `Стаков: ${status.stacks}` : undefined]
                .filter(Boolean)
                .join('\n')
            );
            container.add([bg, icon, label, hit]);
        });
    })
    */
    }

    private renderStatusBar(status: StatusEffect, compact: Map<string, { id: string; label: string; stacks: number }>, index: number) {
        const { PADDING_H, PADDING_V, GAP } = StatusBar;
        const info = StatusInfo[status.id as keyof typeof StatusInfo];
        const x = (index - Math.min(4, compact.size - 1) / 2) * 148;

        const background = this.scene.add.rectangle(0, 0, 0, 0, anyToColor(COLORTOKEN.Background.Zeroth));
        const iconSize = 32;

        const iconKey = `icon-status-${status.id}`;
        const icon = this.scene.textures.exists(iconKey)
            ? this.scene.add.image(x + PADDING_H + iconSize / 2,PADDING_V + iconSize / 2, iconKey).setDisplaySize(iconSize , iconSize )
            : this.scene.add.circle(x + PADDING_H + iconSize / 2,PADDING_V + iconSize / 2, iconSize / 2, anyToColor(info.color));

        const stackText = status.stacks > 1 ? `: ${status.stacks}` : '';
        const label = this.scene.add.text(x + icon.displayWidth + PADDING_H + GAP, PADDING_V + icon.displayHeight / 2, `${info.name}${stackText}`, { ...TYPETOKEN.Secondary.Body, color: info.color }).setOrigin(0, .5);
        background.width = PADDING_H + icon.displayWidth + GAP + label.width + PADDING_H * 4;
        background.height = icon.displayHeight + PADDING_V * 2;

        const offsetX = background.width / 2;
        const offsetY = background.height / 2;

        background.setPosition(-offsetX, -offsetY);
        icon.setPosition(PADDING_H + iconSize / 2 - offsetX,PADDING_V + iconSize / 2 - offsetY);
        label.setPosition(PADDING_H + icon.displayWidth + GAP - offsetX,PADDING_V + icon.displayHeight / 2 - offsetY);

        this.root.add([background, icon, label]);
    }

    private cleanup(): void {
        this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
    }
}

