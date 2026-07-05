import Phaser from "phaser";
import { Combatant } from "@/services/CombatSystem";
import { COLORTOKEN } from "@/ui/styles/ColorTokens";
import { anyToColor } from "@/utils/UtilsColor";
import { CombatantView } from "./CombatantView";
import { TYPETOKEN } from "@/ui/styles/TypeTokens";
import { Tooltip } from "@/ui/components/Tooltip";
import { Factions, FactionInfo } from "@/data/Enemies";

interface BarDimensions {
    width: number;
    height: number;
    cornerRadius: number;
}

export class HPBar extends Phaser.GameObjects.Container {

    private readonly combatantView: CombatantView;
    private readonly root: Phaser.GameObjects.Container;

    private target!: Combatant;
    private hpBarType: "hero" | "enemy";
    private hpBarGraphics!: Phaser.GameObjects.Graphics;
    private hpTextStroke: Phaser.GameObjects.Text | null = null;
    private hpText: Phaser.GameObjects.Text | null = null;
    private attackIndicators: Phaser.GameObjects.Arc[] = [];

    private tooltip: Tooltip | null = null;

    constructor(scene: Phaser.Scene, combatantView: CombatantView, type: "hero" | "enemy" | undefined = "enemy", target: Combatant, x: number, y: number) {
        super(scene)
        this.combatantView = combatantView;
        this.root = this.scene.add.container(0, 0);
        this.target = target;
        this.hpBarType = type;

        this.renderHPBar(x, y);
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);

        this.on(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        });
    }

    private renderHPBar(x: number, y: number): void {
        const dimensions = this.getHPBarStyles();
        const { width, height, cornerRadius } = dimensions;
        const spriteHeight = this.combatantView.sprite.height * this.combatantView.sprite.scale;
        this.root.setPosition(x - width / 2, y + spriteHeight / 2);

        this.hpBarGraphics = this.scene.add.graphics().setDepth(40);
        this.root.add(this.hpBarGraphics);
        if (this.hpBarType === "hero") {
            this.renderHPBarText(width, height);
        } else if (this.hpBarType === "enemy") {
            this.renderEnemyFactionIcon(width, height, x, y);
        }

        this.createAttackIndicators(height, this.hpBarType === "hero");
        this.update();
    }

    private renderHpBarBackground(width: number, height: number, cornerRadius: number): void {
        this.hpBarGraphics.fillStyle(anyToColor(COLORTOKEN.Background.Zeroth));
        this.hpBarGraphics.fillRoundedRect(0, 0, width, height, cornerRadius);
    }

    private renderHPBarText(width: number, height: number): void {
        this.hpTextStroke = this.scene.add.text(width / 2, height / 2, '', {
            ...TYPETOKEN.Primary.Tagline,
            color: COLORTOKEN.Background.Zeroth,
            stroke: COLORTOKEN.Background.Zeroth,
            strokeThickness: 10,
        }).setOrigin(0.5).setDepth(0);

        this.hpText = this.scene.add.text(width / 2, height / 2, '', {
            ...TYPETOKEN.Primary.Tagline,
            color: COLORTOKEN.Background.Zeroth,
            stroke: COLORTOKEN.Accent.Red,
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(75);

        this.root.add(this.hpText);
        this.root.addAt(this.hpTextStroke, 0);

        const hpString = `${Math.max(0, Math.ceil(this.target.stats.hp))}/${this.target.stats.maxHp}`;
        this.hpTextStroke.setText(hpString);
        this.hpText.setText(hpString);
    }

    private renderEnemyFactionIcon(width: number, height: number, x: number, y: number): void {
        const factionIconKey = `icon-faction-${this.target.faction}`;
        let factionIcon: Phaser.GameObjects.GameObject;

        if (this.scene.textures.exists(factionIconKey)) {
            factionIcon = this.scene.add.image(-4, height, factionIconKey)
                .setDisplaySize(40, 40)
                .setOrigin(0, 0)
                .setDepth(500);
        } else {
            factionIcon = this.scene.add.circle(
                x - width / 2,
                y + 40,
                15,
                anyToColor(COLORTOKEN.Background.Zeroth)
            ).setStrokeStyle(2, anyToColor(COLORTOKEN.Accent.Red)).setOrigin(0, 0.5);
        }

        factionIcon.setInteractive({ useHandCursor: true });
        const factionData = Factions[this.target.faction as keyof typeof Factions];
        const tooltip = new Tooltip(this.scene);
        tooltip.show(factionIcon, factionData.name, factionData.description, this.target, { width: 390 });

        this.root.add(factionIcon);
    }

    private createAttackIndicators(height: number, isHero: boolean): void {
    this.target.basicAttacks.forEach((attack, index) => {
        const offset = index * (isHero ? 45 : 28);
        const radius = isHero ? 20 : 12;
        const posX = -offset - 4;
        const posY = height / 2 - radius + 1;

        const attackIndicator = this.scene.add.circle(
            posX,
            posY,
            radius,
            anyToColor(COLORTOKEN.Background.Zeroth),
            0
        );
        attackIndicator.setOrigin(1, 0);

        attackIndicator.setInteractive({ useHandCursor: true });

        const tooltip = new Tooltip(this.scene);

        tooltip.show(
            attackIndicator,
            attack.name,
            attack.description,
            { cooldown: attack.cooldown },
            { width: 390 }
        );

        this.root.add(attackIndicator);
        this.attackIndicators.push(attackIndicator);
    });
}

    private renderAttackIndicators(height: number, isHero: boolean): void {
    this.target.basicAttacks.forEach((attack, index) => {
        const offset = index * (isHero ? 45 : 28);
        const padding = isHero ? 4 : 3;
        const posX = -offset - 4;
        const radius = isHero ? 20 : 12;
        const posY = height / 2 - radius;

        this.hpBarGraphics.fillStyle(anyToColor(COLORTOKEN.Background.Zeroth), 1);

        this.hpBarGraphics.fillCircle(
            posX - radius,
            posY + radius,
            radius
        );

        this.hpBarGraphics.slice(
            posX - radius,
            posY + radius,
            radius - padding,
            Phaser.Math.DegToRad(-90),
            Phaser.Math.DegToRad(
                -90 + 360 * Math.min(1, attack.progress / attack.cooldown)
            ),
            false
        );

        this.hpBarGraphics.fillStyle(anyToColor(COLORTOKEN.Accent.Red));
        this.hpBarGraphics.fillPath();
    });
}

    private renderHPBarThumb(width: number, height: number, cornerRadius: number): void {
        const hpRatio = Math.max(0, this.target.stats.hp / this.target.stats.maxHp);
        const fillWidth = (width - 8) * hpRatio;
        if (fillWidth > 0) {
            const fillRadius = Math.min(fillWidth, cornerRadius - 4);
            this.hpBarGraphics.fillStyle(anyToColor(COLORTOKEN.Accent.Red));
            this.hpBarGraphics.fillRoundedRect(4, 4, fillWidth, height - 8, fillRadius);
        }
    }

    private getHPBarStyles(): BarDimensions {
        const isHero = this.hpBarType === "hero";
        return {
            cornerRadius: isHero ? 8 : 4,
            width: isHero ? 248 : 162,
            height: isHero ? 38 : 20
        };
    }

    public update(): void {
        const { width, height, cornerRadius } = this.getHPBarStyles();
        const isHero = this.hpBarType === "hero";
        if (!this.target) return;

        this.hpBarGraphics.clear();

        this.renderHpBarBackground(width, height, cornerRadius);
        this.renderHPBarThumb(width, height, cornerRadius);

        if (isHero && this.hpText && this.hpTextStroke) {
            const hpString = `${Math.max(0, Math.ceil(this.target.stats.hp))}/${this.target.stats.maxHp}`;
            this.hpTextStroke.setText(hpString);
            this.hpText.setText(hpString);
        }

        this.target.basicAttacks.forEach((attack, index) => {
            this.renderAttackIndicators(height, isHero);
        })
    }
}