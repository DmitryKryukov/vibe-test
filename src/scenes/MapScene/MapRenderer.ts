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
    private mapContainer!: Phaser.GameObjects.Container;

    private scrollX = 0;

    private isDragging = false;
    private dragStartX = 0;
    private dragStartScrollX = 0;

    private velocityX = 0;
    private lastPointerX = 0;
    private lastPointerTime = 0;

    constructor(scene: MapScene, combatSystem: CombatSystem) {
        this.scene = scene;
        this.mainUI = new MainUI(scene, combatSystem);
        this.render();
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    render(): void {
        this.scene.children.removeAll();
        this.renderBackground();
        this.renderMap();
        this.mainUI.renderPanels();
        //this.ui.button(screen.right - 148, screen.top + 42, 180, 46, 'Пауза', () => this.openPause());
    }

    private renderBackground(): void {
        new Background(this.scene, 'map');
    }

    private renderMap(): void {
        this.mapContainer = this.scene.add.container();
        const run = GameState.requireRun();
        const layout = MapLayout.build(run.map);
        this.renderConnections(run, layout);
        this.renderNodes(run, layout);
        this.setupScrolling();
    }

    private renderNodes(run: RunState, layout: Map<string, Position>) {
        run.map.forEach((node) => {
            const pos = layout.get(node.id);
            if (!pos) return;
            const view = new MapNodeView(this.scene, node, pos.x, pos.y, (node) => this.scene.enterNode(node));
            this.mapContainer.add(view);
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
        this.mapContainer.add(graphic);
    }

    private setupScrolling(): void {
        this.scene.input.on(
            'wheel',
            (
                pointer: Phaser.Input.Pointer,
                gameObjects: Phaser.GameObjects.GameObject[],
                deltaX: number,
                deltaY: number
            ) => {
                this.scrollBy(deltaX + deltaY);
            }
        );
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.isDragging = true;

            this.dragStartX = pointer.x;
            this.dragStartScrollX = this.scrollX;

            this.velocityX = 0;
            this.lastPointerX = pointer.x;
            this.lastPointerTime = performance.now();
        });

        this.scene.input.on('pointerup', () => {
            this.isDragging = false;
        });

        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!this.isDragging) return;

            this.scrollX =
                this.dragStartScrollX +
                (pointer.x - this.dragStartX);

            const now = performance.now();
            const dt = Math.max(1, now - this.lastPointerTime);

            this.velocityX =
                ((pointer.x - this.lastPointerX) / dt) * 16;

            this.lastPointerX = pointer.x;
            this.lastPointerTime = now;

            this.updateScroll();
        });
    }

    private scrollBy(delta: number): void {
        this.scrollX -= delta;
        this.updateScroll();
    }

    public update(dt: number): void {
        if (this.isDragging) return;

        this.scrollX += this.velocityX;

        this.velocityX *= 0.92;

        if (Math.abs(this.velocityX) < 0.05) {
            this.velocityX = 0;
        }

        this.updateScroll();
    }

    private updateScroll(): void {
        const MAP_WIDTH = 3200;
        const screenWidth = this.scene.scale.width;

        const minX = Math.min(0, screenWidth - MAP_WIDTH);
        const maxX = 0;

        this.scrollX = Phaser.Math.Clamp(
            this.scrollX,
            minX,
            maxX
        );

        this.mapContainer.x = this.scrollX;
    }
}