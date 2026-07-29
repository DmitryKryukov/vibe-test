import { Background } from "@/partials/ui/components/Background";
import { MainUI } from "@/partials/ui/MainUI";
import { CombatSystem } from "@/services/CombatSystem";
import { GameState, RunState } from "@/store/GameState";
import { COLORTOKEN } from "@/styles/ColorTokens";
import { MapScene } from "./MapScene";
import { MapLayout } from "./MapLayout";
import { MapNodeView } from "./MapNodeView";

export class MapRenderer {
    private scene: MapScene;
    private mainUI: MainUI;

    constructor(scene: MapScene, combatSystem: CombatSystem) {
        this.scene = scene;
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
        new Background(this.scene, 'map');
    }

    private renderMap(): void {
        const run = GameState.requireRun();
        const layout = MapLayout.build(run.map);
        this.renderConnections(run, layout);
        this.renderNodes(run, layout);
    }

    private renderNodes(run: RunState, layout: Map<string, Position>) {
        run.map.forEach((node) => {
            const pos = layout.get(node.id);
            if (!pos) return;
            new MapNodeView(this.scene, node, pos.x, pos.y, (node) => this.scene.enterNode(node));
        });
    }

    private renderConnections(run: RunState, layout: Map<string, Position>) {
        const graphic = this.scene.add.graphics();
        run.map.forEach((node) => {
            const from = layout.get(node.id);
            if (!from) return;

            node.links.forEach((id: string) => {
                const toNode = run.map.find((candidate) => candidate.id === id);
                const to = layout.get(id);
                if (!to) return;
                graphic.lineStyle(2, node.visited && toNode?.available ? COLORTOKEN.Foreground.Secondary.Numeric : COLORTOKEN.Foreground.Quanternary.Numeric, node.visited && toNode?.available ? 1 : .38);
                graphic.lineBetween(from.x, from.y, to.x, to.y);
            });
        });
    }
}