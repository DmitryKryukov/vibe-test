import Phaser from "phaser";
import { Combatant } from "@/services/CombatantFactory";
import { COLORTOKEN } from "@/ui/styles/ColorTokens";
import { anyToColor } from "@/utils/UtilsColor";
import { Tooltip } from "@/ui/components/Tooltip";

export class AbilityIndicator extends Phaser.GameObjects.Container {
    private target: Combatant;
    private isHero: boolean;
    private barWidth: number;
    private graphics: Phaser.GameObjects.Graphics;
    private abilityContainers: Phaser.GameObjects.Container[] = [];
    private tooltips: Tooltip[] = [];
    private root: Phaser.GameObjects.Container;

    constructor(
        scene: Phaser.Scene,
        target: Combatant,
        isHero: boolean,
        x: number,
        y: number,
        height: number,
        barWidth: number,
        root: Phaser.GameObjects.Container,
    ) {
        super(scene, x, y);
        this.target = target;
        this.isHero = isHero;
        this.height = height;
        this.barWidth = barWidth;
        this.root = root;

        this.graphics = this.scene.add.graphics();
        this.add(this.graphics);

        this.createIndicators();
    }

    private createIndicators(): void {
        this.target.activeAbilities.forEach((ability, index) => {
            const offset = index * ((this.isHero ? 24 * 2 : 20 * 2) + 4) + this.barWidth;
            const radius = this.isHero ? 24 : 20;
            const posX = offset + 4;
            const posY = this.height / 2 - radius;
            const size = radius * 2;

            const container = this.scene.add.container(posX, posY);

            const bg = this.scene.add.graphics();
            bg.fillStyle(anyToColor(COLORTOKEN.Background.Zeroth), 1);
            bg.fillRoundedRect(0, 0, size, size, 12);
            container.add(bg);

            const progressGraphics = this.scene.add.graphics();
            container.add(progressGraphics);
            
            const imagePadding = 4;

            const img = this.scene.add.image(imagePadding, imagePadding, ability.id);
            img.setDisplaySize(size - imagePadding * 2, size - imagePadding * 2);
            img.setOrigin(0,0);
            container.add(img);

            const imageMaskGraphics = this.scene.make.graphics();

            imageMaskGraphics.fillStyle(0xffffff);
            imageMaskGraphics.fillRoundedRect(this.root.x + posX + imagePadding, this.root.y + posY + imagePadding, size - imagePadding * 2, size - imagePadding * 2, 12 - imagePadding);
            img.setMask(imageMaskGraphics.createGeometryMask());

            const maskGraphics = this.scene.make.graphics();

            maskGraphics.fillStyle(0xffffff);
            maskGraphics.fillRoundedRect(this.root.x + posX, this.root.y + posY, size, size, 12);

            progressGraphics.setMask(maskGraphics.createGeometryMask());
            
            const circle = this.scene.add.circle(
                0,
                0,
                radius,
                anyToColor('#ff00ff'),
                0
            );

            circle.setOrigin(0, 0);
            circle.setInteractive({ useHandCursor: true });

            container.add(circle);

            // Сохраняем ссылки для обновления
            (container as any).progressGraphics = progressGraphics;
            (container as any).maskGraphics = maskGraphics;
            (container as any).size = size;
            (container as any).radius = radius;

            circle.setInteractive({ useHandCursor: true });
            
            const tooltip = new Tooltip(this.scene);
            // Интерактивность и тултип
            tooltip.show(
                circle,
                ability.name,
                ability.description,
                { cooldown: ability.cooldown },
                { width: 390 }
            );
            this.tooltips.push(tooltip);
            
            this.add(container);
            this.abilityContainers.push(container);
        });
    }

    public update(): void {
        this.abilityContainers.forEach((container, index) => {
            const ability = this.target.activeAbilities[index];
            if (!ability) return;

            const pg = (container as any).progressGraphics as Phaser.GameObjects.Graphics;
            const size = (container as any).size;
            const radius = (container as any).radius;

            pg.clear();
            const progress = Math.min(1, ability.progress / ability.cooldown);
            if (progress > 0) {
                pg.fillStyle(anyToColor(COLORTOKEN.Accent.Red));
                pg.slice(
                    radius,
                    radius,
                    radius * 2 - 4,
                    Phaser.Math.DegToRad(-90),
                    Phaser.Math.DegToRad(-90 + 360 * progress),
                    false
                );
                pg.fillPath();
            }
        });
    }

    public destroy(fromScene?: boolean): void {
        this.tooltips.forEach(t => t.destroy());
        this.tooltips = [];
        this.abilityContainers.forEach(c => c.destroy(true));
        this.abilityContainers = [];
        if (this.graphics) this.graphics.destroy();
        super.destroy(fromScene);
    }
}