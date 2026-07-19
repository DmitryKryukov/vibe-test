import Phaser from "phaser";
import { Background } from "@/partials/ui/components/Background";
import { MainUI } from "@/partials/ui/MainUI";
import { CombatSystem } from "@/services/CombatSystem";
import { GameState } from "@/store/GameState";
import { EncounterType, getMapMetrics, getNodeLabel, MapNode } from "@/data/Map";
import { COLORTOKEN } from "@/partials/styles/ColorTokens";
import { anyToColor } from "@/utils/UtilsColor";
import { TYPETOKEN } from "@/partials/styles/TypeTokens";

export class MapRenderer {
    private scene: Phaser.Scene;
    private background!: Background;
    private mainUI: MainUI;
    private combatSystem: CombatSystem;

    constructor(scene: Phaser.Scene, combatSystem: CombatSystem) {
        this.scene = scene;
        this.mainUI = new MainUI(scene, combatSystem);
        this.combatSystem = combatSystem,
            this.mainUI = new MainUI(scene, combatSystem);
        this.render();

    }

    render(): void {
        this.scene.children.removeAll();
        this.renderBackground();
        this.mainUI.renderPanels();
        this.renderMap();
        //this.ui.button(screen.right - 148, screen.top + 42, 180, 46, 'Пауза', () => this.openPause());
    }
    private renderBackground(): void {
        return;
        this.background = new Background(this.scene, 'battle');
    }

    private renderMap(): void {
        const run = GameState.requireRun();
        const positions = new Map<string, { x: number; y: number }>();
        const { startX, startY: baseY, gapX, gapY } = getMapMetrics();

        run.map.forEach((node) => {
            positions.set(node.id, { x: startX + node.column * gapX, y: baseY + node.row * gapY });
        })

        const g = this.scene.add.graphics();

        run.map.forEach((node) => {
            const pos = positions.get(node.id);
            if (!pos) return;
            this.renderNode(node, pos.x, pos.y);
        });

        run.map.forEach((node) => {
            const from = positions.get(node.id);
            if (!from ) return;

            node.links.forEach((id) => {
                const toNode = run.map.find((candidate) => candidate.id === id);
                const to = positions.get(id);
                // if (!to || !toNode?.revealed) return;
                if (!to) return;
                g.lineStyle(node.visited ? 5 : 2, node.visited ? 0xd5c56c : 0x3b4038, node.visited ? 0.8 : 0.35);
                g.lineBetween(from.x, from.y, to.x, to.y);
            });
        });

    }

    renderNode(node: MapNode, x: number, y: number): void {
        const inaccessible = !node.available && !node.visited;
        let color;
        if (node.visited) {
            color = anyToColor(COLORTOKEN.Background.Primary);
        } else if (inaccessible) {
            color = anyToColor(COLORTOKEN.Background.Primary);
        } else {
            color = COLORTOKEN.Node[node.type];
        }

        const alpha = inaccessible ? 0.8 : 1;

        let stroke;
        if (node.available) {
            stroke = 0xf1d871;
        } else if (inaccessible) {
            stroke = 0x7d8580;
        } else {
            stroke = 0x171817;
        }

        let textColor;
        if (inaccessible) {
            textColor = "#c6ccc7"
        }
        else {
            textColor = "#efe6bf"
        }

        const card = this.scene.add.rectangle(x, y, 130, 130, color, alpha).setStrokeStyle(node.available ? 5 : 1, stroke);

        card.setAngle(Phaser.Math.Between(-3, 3));
        const label = this.scene.add.text(x, y + 52, getNodeLabel(node.type), {
            ...TYPETOKEN.Secondary.Caption,
            color: textColor
        }).setOrigin(0.5);

        if (node.available && !node.visited) {
            card.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                alert("Переходим в ноду");
                //     this.enterNode(node)
            });
            this.scene.tweens.add({ targets: [card], scale: 1.06, yoyo: true, repeat: -1, duration: 900 });
        }
        if (node.visited) label.setText('пройдено');
        /*
        this.ui.tooltip(card, this.labelFor(node.type), this.tooltipFor(node));
        */
    }
}