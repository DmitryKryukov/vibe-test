import Phaser from "phaser";
import { Combatant } from "@/services/CombatantFactory";
import { COLORTOKEN } from "@/partials/ui/styles/ColorTokens";
import { anyToColor } from "@/utils/UtilsColor";
import { Tooltip } from "@/partials/ui/components/Tooltip";

export class AttackIndicator extends Phaser.GameObjects.Container {
    private target: Combatant;
    private isHero: boolean;
    private graphics: Phaser.GameObjects.Graphics;
    private circles: Phaser.GameObjects.Arc[] = [];
    private tooltips: Tooltip[] = [];

    constructor(scene: Phaser.Scene, target: Combatant, isHero: boolean, x: number, y: number, height: number) {
        super(scene, x, y);
        this.target = target;
        this.isHero = isHero;
        this.height = height;

        this.graphics = this.scene.add.graphics();
        this.add(this.graphics);

        this.createIndicators();
    }

    private createIndicators(): void {
        this.target.basicAttacks.forEach((attack, index) => {
            const offset = index * (this.isHero ? 45 : 28);
            const radius = this.isHero ? 20 : 12;
            const posX = -offset - 4;
            const posY = this.height / 2 - radius + 1;

            const circle = this.scene.add.circle(
                posX,
                posY,
                radius,
                anyToColor('#ff00ff'),
                0
            );

            circle.setOrigin(1, 0);
            circle.setInteractive({ useHandCursor: true });

            const tooltip = new Tooltip(this.scene);
            tooltip.show(
                circle,
                attack.name,
                attack.description,
                { cooldown: attack.cooldown },
                { width: 390 }
            );
            this.tooltips.push(tooltip);

            this.add(circle);
            this.circles.push(circle);
        });
    }

    public update(): void {
        this.graphics.clear();
        this.target.basicAttacks.forEach((attack, index) => {
            const offset = index * (this.isHero ? 45 : 28);
            const radius = this.isHero ? 20 : 12;
            const padding = this.isHero ? 4 : 3;
            const posX = -offset - 4;
            const posY = this.height / 2 - radius;

            this.graphics.fillStyle(anyToColor(COLORTOKEN.Background.Zeroth));
            this.graphics.fillCircle(
                posX - radius,
                posY + radius,
                radius
            )
            this.graphics.fillStyle(anyToColor(COLORTOKEN.Accent.Red));
            this.graphics.slice(
                posX - radius,
                posY + radius,
                radius - padding,
                Phaser.Math.DegToRad(-90),
                Phaser.Math.DegToRad(
                    -90 + 360 * Math.min(1, attack.progress / attack.cooldown)
                ),
                false
            );
            this.graphics.fillPath();
        });
    }

    public destroy(fromScene?: boolean): void {
        this.tooltips.forEach(t => t.destroy());
        this.tooltips = [];
        this.circles = [];
        if (this.graphics) this.graphics.destroy();
        super.destroy(fromScene);
    }
}