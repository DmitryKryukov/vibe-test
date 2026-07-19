import Phaser from 'phaser';

import { SquirePanel } from '@/partials/ui/components/SquirePanel';
import { HeroPanel } from '@/partials/ui/components/HeroPanel';
import { CombatSystem } from '@/services/CombatSystem';

import { TYPETOKEN } from '@/partials/ui/styles/TypeTokens';
import { COLORTOKEN } from '@/partials/ui/styles/ColorTokens';
import { anyToColor } from '@/utils/UtilsColor';
import { screenBounds, screenToWorld, screenSpaceScale } from '@/utils/UtilsLayout';

export class BattleUI {
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
        const titles = {
            victory: 'Выпало в бою',
            defeat: 'Поражение'
        };
        const title = titles[type];

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
}