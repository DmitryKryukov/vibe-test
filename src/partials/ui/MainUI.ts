import Phaser from 'phaser';

import { SquirePanel } from '@/partials/ui/components/SquirePanel';
import { HeroPanel } from '@/partials/ui/components/HeroPanel';
import { CombatSystem } from '@/services/CombatSystem';

import { TYPETOKEN } from '@/partials/styles/TypeTokens';
import { COLORTOKEN } from '@/partials/styles/ColorTokens';
import { anyToColor } from '@/utils/UtilsColor';
import { screenBounds, screenToWorld, screenSpaceScale } from '@/utils/UtilsLayout';

export class MainUI {
    private scene: Phaser.Scene;
    private combatSystem: CombatSystem;
    private heroPanel!: HeroPanel;
    private squirePanel!: SquirePanel;

    constructor(scene: Phaser.Scene, combatSystem: CombatSystem) {
        this.scene = scene;
        this.combatSystem = combatSystem;
    }

    public renderPanels(): void {
        this.heroPanel = new HeroPanel(this.scene);
        this.squirePanel = new SquirePanel(this.scene);
    }

    public renderResultPanel(type: 'victory' | 'defeat'): void {
        const screen = screenBounds(this.scene);
        const dimmer = this.scene.add.rectangle(0, 0, screen.width, screen.height, anyToColor(COLORTOKEN.Background.Zeroth), 0.62)
            .setOrigin(0)
            .setDepth(5000);
        const title = 'Поражение';

        const panelSize = {
            width: 640,
            height: screen.height - 64
        };
        const panelPosition = screenToWorld(this.scene, screen.centerX, screen.centerY);

        const panel = this.scene.add.container(panelPosition.x, panelPosition.y)
            .setScale(screenSpaceScale(this.scene))
            .setDepth(8000);

        const background = this.scene.add.rectangle(0, 0, panelSize.width, panelSize.height, anyToColor(COLORTOKEN.Background.Zeroth), 0.9)
            .setStrokeStyle(2, anyToColor(COLORTOKEN.Foreground.Tertiary));

        const heading = this.scene.add.text(0, -panelSize.height / 2 + 30, title, {
            ...TYPETOKEN.Secondary.Tagline,
            color: COLORTOKEN.Foreground.Secondary
        }).setOrigin(0.5);

        panel.add([background, heading]);
    }
    public renderVictoryPanel(callbackArrowButon: () => void): void {
        const screen = screenBounds(this.scene);
        const position = screenToWorld(this.scene, screen.right - 74, screen.centerY);
        const arrow = this.createExitButton(position.x, position.y, callbackArrowButon);
        this.animateExitButton(arrow, screenToWorld(this.scene, screen.right - 86, screen.centerY).x);
    }

    private createExitButton(x: number, y: number, callbackArrowButon: () => void): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y).setDepth(1900);

        const button = this.scene.add.circle(0, 0, 44, Phaser.Display.Color.HexStringToColor(COLORTOKEN.Background.Primary).color)
            .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(COLORTOKEN.Foreground.Secondary).color);

        const icon = this.scene.add.text(1, -2, '›', { ...TYPETOKEN.Primary.Display, color: COLORTOKEN.Foreground.Secondary })
            .setOrigin(0.5);

        container.add([button, icon]);

        this.setupExitButtonInteraction(container, button, callbackArrowButon);

        return container;
    }

    private setupExitButtonInteraction(container: Phaser.GameObjects.Container, button: Phaser.GameObjects.Arc, callbackArrowButon: () => void): void {
        const defaultColor = Phaser.Display.Color.HexStringToColor(COLORTOKEN.Background.Primary).color;
        const hoverColor = Phaser.Display.Color.HexStringToColor(COLORTOKEN.Background.Tertiary).color;

        button.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                button.setFillStyle(hoverColor);
                container.setScale(1.1);
            })
            .on('pointerout', () => {
                button.setFillStyle(defaultColor);
                container.setScale(1);
            })
            .on('pointerdown', () => {
                callbackArrowButon();
            });
    }

    private animateExitButton(button: Phaser.GameObjects.Container, targetX: number): void {
        this.scene.tweens.add({
            targets: button,
            x: targetX,
            yoyo: true,
            repeat: -1,
            duration: 820,
            ease: 'Sine.easeInOut',
        });
    }
}