import Phaser from "phaser";
import { Combatant } from "@/services/CombatantFactory";
import { COLORTOKEN } from "@/partials/styles/ColorTokens";
import { anyToColor } from "@/utils/UtilsColor";
import { CombatantView } from "./CombatantView";
import { TYPETOKEN } from "@/partials/styles/TypeTokens";
import { Tooltip } from "@/partials/ui/components/Tooltip";
import { Factions } from "@/data/Enemies";
import { AttackIndicator } from "./AttackIndicator";
import { AbilityIndicator } from "./AbilityIndicator";

interface BarDimensions {
    width: number;
    height: number;
    cornerRadius: number;
}

export class HPBar extends Phaser.GameObjects.Container {
    private readonly combatantView: CombatantView;
    private readonly root: Phaser.GameObjects.Container;
    private target: Combatant;
    private hpBarType: "hero" | "enemy";
    private hpBarGraphics!: Phaser.GameObjects.Graphics;
    private hpTextStroke: Phaser.GameObjects.Text | null = null;
    private hpText: Phaser.GameObjects.Text | null = null;
    private factionIcon: Phaser.GameObjects.GameObject | null = null;
    private attackIndicator: AttackIndicator | null = null;
    private abilityIndicator: AbilityIndicator | null = null;
    private tooltips: Tooltip[] = [];

    constructor(
        scene: Phaser.Scene,
        combatantView: CombatantView,
        type: "hero" | "enemy" = "enemy",
        target: Combatant,
        x: number,
        y: number
    ) {
        super(scene);
        this.combatantView = combatantView;
        this.root = this.scene.add.container(0, 0);
        this.target = target;
        this.hpBarType = type;

        this.renderHPBar(x, y);
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);

        this.on(Phaser.GameObjects.Events.DESTROY, () => {
            this.cleanup();
        });
    }

    private renderHPBar(x: number, y: number): void {
        const dims = this.getHPBarStyles();
        const { width, height, cornerRadius } = dims;
        const spriteHeight = this.combatantView.sprite.height * this.combatantView.sprite.scale;
        this.root.setPosition(x - width / 2, y + spriteHeight / 2);

        this.hpBarGraphics = this.scene.add.graphics().setDepth(40);
        this.root.add(this.hpBarGraphics);

        if (this.hpBarType === "hero") {
            this.renderHPBarText(width, height);
        } else {
            this.renderEnemyFactionIcon(width, height, x, y);
        }

        const isHero = this.hpBarType === "hero";
        this.attackIndicator = new AttackIndicator(
            this.scene,
            this.target,
            isHero,
            0, 0,
            height
        );
        this.abilityIndicator = new AbilityIndicator(
            this.scene,
            this.target,
            isHero,
            0, 0,
            height,
            width,
            this.root
        );

        this.root.add(this.attackIndicator);
        this.root.add(this.abilityIndicator);

        this.update();
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

        this.updateHPText();
    }

    private renderEnemyFactionIcon(width: number, height: number, x: number, y: number): void {
        const factionIconKey = `icon-faction-${this.target.faction}`;

        if (this.scene.textures.exists(factionIconKey)) {
            this.factionIcon = this.scene.add.image(-4, height, factionIconKey)
                .setDisplaySize(40, 40)
                .setOrigin(0, 0)
                .setDepth(500);
        } else {
            this.factionIcon = this.scene.add.circle(
                x - width / 2,
                y + 40,
                15,
                anyToColor(COLORTOKEN.Background.Zeroth)
            ).setStrokeStyle(2, anyToColor(COLORTOKEN.Accent.Red)).setOrigin(0, 0.5);
        }

        this.factionIcon.setInteractive({ useHandCursor: true });
        const factionData = Factions[this.target.faction as keyof typeof Factions];
        const tooltip = new Tooltip(this.scene);
        tooltip.show(
            this.factionIcon,
            factionData.name,
            factionData.description,
            this.target,
            { width: 390 }
        );
        this.tooltips.push(tooltip);
        this.root.add(this.factionIcon);
    }

    private renderHpBarBackground(width: number, height: number, cornerRadius: number): void {
        this.hpBarGraphics.fillStyle(anyToColor(COLORTOKEN.Background.Zeroth));
        this.hpBarGraphics.fillRoundedRect(0, 0, width, height, cornerRadius);
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
            height: isHero ? 38 : 20,
        };
    }

    private updateHPText(): void {
        if (this.hpText && this.hpTextStroke) {
            const hpString = `${Math.max(0, Math.ceil(this.target.stats.hp))}/${this.target.stats.maxHp}`;
            this.hpTextStroke.setText(hpString);
            this.hpText.setText(hpString);
        }
    }

    public update(): void {
        if (!this.target) return;

        const { width, height, cornerRadius } = this.getHPBarStyles();

        this.hpBarGraphics.clear();
        this.renderHpBarBackground(width, height, cornerRadius);
        this.renderHPBarThumb(width, height, cornerRadius);

        this.updateHPText();

        this.attackIndicator?.update();
        this.abilityIndicator?.update();
    }

    private cleanup(): void {
        this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);

        this.tooltips.forEach(t => t.destroy(true));
        this.tooltips = [];

        if (this.attackIndicator) {
            this.attackIndicator.destroy(true);
            this.attackIndicator = null;
        }
        if (this.abilityIndicator) {
            this.abilityIndicator.destroy(true);
            this.abilityIndicator = null;
        }

        if (this.root) {
            this.root.destroy(true);
        }

        this.hpText = null;
        this.hpTextStroke = null;
        this.factionIcon = null;
    }

    public destroy(fromScene?: boolean): void {
        this.cleanup();
    }
}
