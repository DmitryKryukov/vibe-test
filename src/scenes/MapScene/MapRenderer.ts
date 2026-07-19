import Phaser from "phaser";
import { Background } from "@/partials/ui/components/Background";
import { MainUI } from "@/partials/ui/MainUI";
import { CombatSystem } from "@/services/CombatSystem";
import { GameState } from "@/store/GameState";
import { EncounterType, getMapMetrics, getNodeLabel, MapNode, getNodeDescription} from "@/data/Map";
import { COLORTOKEN } from "@/partials/styles/ColorTokens";
import { anyToColor } from "@/utils/UtilsColor";
import { TYPETOKEN } from "@/partials/styles/TypeTokens";
import { Tooltip } from "@/partials/ui/components/Tooltip";

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
        this.background = new Background(this.scene, 'map');
        return;
    }

    private renderMap(): void {
        const run = GameState.requireRun();
        const positions = new Map<string, { x: number; y: number }>();
        const { startX, startY: baseY, gapX, gapY, randomX, randomY } = getMapMetrics();

        run.map.forEach((node) => {
            positions.set(node.id, { x: startX + Phaser.Math.Between(-randomX, randomX) + node.column * gapX, y: baseY + Phaser.Math.Between(-randomY, randomY) + node.row * gapY });
        })

        const graphic = this.scene.add.graphics();

        run.map.forEach((node) => {
            const pos = positions.get(node.id);
            if (!pos) return;
            this.renderNode(node, pos.x, pos.y);
        });

        run.map.forEach((node) => {
            const from = positions.get(node.id);
            if (!from) return;

            node.links.forEach((id) => {
                const toNode = run.map.find((candidate) => candidate.id === id);
                const to = positions.get(id);
                // if (!to || !toNode?.revealed) return;
                if (!to) return;
                graphic.lineStyle(node.visited ? 2 : 2, node.visited ? anyToColor(COLORTOKEN.Foreground.Secondary) : anyToColor(COLORTOKEN.Foreground.Quanternary), node.visited ? 1 : .38);
                graphic.lineBetween(from.x, from.y, to.x, to.y);
            });
        });

    }

    renderNode(node: MapNode, x: number, y: number): void {
        const root = this.scene.add.container(x, y);
        const isAvailableNotVisited = node.available && !node.visited;
        const isInaccessible = !node.available && !node.visited;

        const styles = this.getNodeStyles(node, isInaccessible);
        let angle: number = 0
        if (node.type !== EncounterType.Start) {
            angle = Phaser.Math.Between(-3, 3);
        }
        root.setData('originalAngle', angle);

        const cardGraphics = this.createCardGraphics(styles, angle, node.available);
        const cardHit = this.createHitArea(angle, isAvailableNotVisited);
        const label = this.createLabel(node, styles.textColor);
        const image = this.createImage(node, angle);

        root.add([cardGraphics, image, cardHit, label]);
        const tooltip = new Tooltip(this.scene);

        tooltip.show(cardHit, getNodeLabel(node.type), getNodeDescription(node.type), {}, { width: 320 });

        if (isAvailableNotVisited) {
            this.addNodeInteractions(node, cardHit, root, isAvailableNotVisited);
        }
    }

    private getNodeStyles(node: MapNode, isInaccessible: boolean) {
        const backgroundColor = node.visited
            ? anyToColor(COLORTOKEN.Background.Zeroth)
            : isInaccessible
                ? anyToColor(COLORTOKEN.Background.Zeroth)
                : COLORTOKEN.Node[node.type];

        const strokeColor = node.visited
            ? anyToColor(COLORTOKEN.Background.Zeroth)
            : anyToColor(COLORTOKEN.Foreground.Secondary);

        const textColor = isInaccessible
            ? COLORTOKEN.Foreground.Quanternary
            : COLORTOKEN.Foreground.Primary;

        return { backgroundColor, strokeColor, textColor };
    }

    private createCardGraphics(styles: any, angle: number, isAvailable: boolean): Phaser.GameObjects.Graphics {
        const graphics = this.scene.add.graphics();
        graphics.setAngle(angle);

        graphics.fillStyle(styles.backgroundColor, 1);
        graphics.fillRoundedRect(-65, -65, 130, 130, 20);

        graphics.lineStyle(isAvailable ? 3 : 0, styles.strokeColor, 1);
        graphics.strokeRoundedRect(-65, -65, 130, 130, 20);

        return graphics;
    }

    private createHitArea(angle: number, isInteractive: boolean): Phaser.GameObjects.Rectangle {
        const hit = this.scene.add.rectangle(0, 0, 130, 130, 0xffffff, 0);
        hit.setAngle(angle);

        if (isInteractive) {
            hit.setInteractive({ useHandCursor: true });
        }
        return hit;
    }

    private createLabel(node: MapNode, textColor: string): Phaser.GameObjects.Text {
        const textContent = node.visited ? '' : getNodeLabel(node.type);

        return this.scene.add.text(0, 48, textContent, {
            ...TYPETOKEN.Secondary.Caption,
            color: textColor,

            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: COLORTOKEN.Background.Zeroth,
                blur: 0,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
    }

    private createImage(node: MapNode, angle: number): Phaser.GameObjects.Image {
        const size = 130;
        let textureKey: string | undefined = this.getNodeTextureKey(node);
        let image = this.scene.add.image(0, 0, "");
        if (textureKey) {
            image.setTexture(textureKey);
            image.setDisplaySize(size, size);
            image.setAngle(angle);
        }
        else {
            image.setDisplaySize(0, 0);
        }
        if (!node.available) {
            const fx = image.postFX?.addColorMatrix();
            fx.saturate(-.8);
            image.setTint(0x555555)
        }
        return image;
    }
    private getNodeTextureKey(node: MapNode) {
        if (node.type === EncounterType.Start) return "map-node-start"
        if (node.type === EncounterType.Battle) return "map-node-battle-" + Phaser.Math.Between(1, 7);
        if (node.type === EncounterType.Camp) return "map-node-camp";
    }

    private addNodeInteractions(node: MapNode, hitArea: Phaser.GameObjects.Rectangle, rootContainer: Phaser.GameObjects.Container, isAvailableNotVisited: boolean): void {

        const originalAngle = rootContainer.getData('originalAngle') as number || 0;

        const pulseTween = this.scene.tweens.add({
            targets: rootContainer,
            scale: 1.06,
            yoyo: true,
            repeat: -1,
            duration: 500,
        });
        rootContainer.setData('pulseTween', pulseTween);

        hitArea.on('pointerdown', () => {
            this.enterNode(node)
        });

        hitArea.on('pointerover', () => {
            const pulse = rootContainer.getData('pulseTween');
            if (pulse) {
                pulse.stop();
            }

            const hoverTween = rootContainer.getData('hoverTween');
            if (hoverTween) {
                hoverTween.stop();
            }
            const tween = this.scene.tweens.add({
                targets: rootContainer,
                scale: 1.25,
                angle: -originalAngle,
                duration: 200,
                ease: 'Quint.easeOut',
            });
            rootContainer.setData('hoverTween', tween);

            
        });

        hitArea.on('pointerout', () => {
            const hoverTween = rootContainer.getData('hoverTween');
            if (hoverTween) {
                hoverTween.stop();
            }
            const tween = this.scene.tweens.add({
                targets: rootContainer,
                scale: 1,
                angle: originalAngle,
                duration: 200,
                ease: 'Quint.easeOut',
                onComplete: () => {
                    if (isAvailableNotVisited) {
                        const newPulse = this.scene.tweens.add({
                            targets: rootContainer,
                            scale: 1.06,
                            yoyo: true,
                            repeat: -1,
                            duration: 500,
                        });
                        rootContainer.setData('pulseTween', newPulse);
                    }
                }
            });
            rootContainer.setData('hoverTween', tween);
        });
    }

    enterNode(node: MapNode): void {
        if (node.type === EncounterType.Battle || node.type === EncounterType.Elite || node.type === EncounterType.Boss) {
            const enemies = GameState.getEncounterEnemies(node.type);
            this.scene.scene.start('BattleScene', { nodeId: node.id, nodeType: node.type, enemyIds: enemies });
            return;
        }
        /*
    if (node.type === 'merchant') this.openMerchant(node.id);
    if (node.type === 'camp') this.openCamp(node.id);
    if (node.type === 'event') this.openEvent(node.id);
    */
    }

    /*
    this.ui.tooltip(card, this.labelFor(node.type), this.tooltipFor(node));
    */
}