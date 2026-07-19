import Phaser from "phaser"
import { GameState, RunState } from "@/store/GameState";

import { Squires, SquireScheme } from "@/data/Squires";
import { screenToWorld, screenBounds } from "@/utils/UtilsLayout";
import { degreesToRadians, getRandomInt } from "@/utils/UtilsMath";
import { COLORTOKEN } from "../../styles/ColorTokens";
import { anyToColor } from "@/utils/UtilsColor";
import { TYPETOKEN } from "../../styles/TypeTokens";

export class SquirePanel extends Phaser.GameObjects.Container {
    public scene: Phaser.Scene
    private run: RunState;
    private squire: SquireScheme;

    constructor(scene: Phaser.Scene) {
        super(scene);
        this.run = GameState.requireRun();
        this.squire = Squires[this.run.squireId];
        this.scene = scene;
        this.render();
    }

    private renderPortrait(): void {
        const screen = screenBounds(this.scene);
        const pos = screenToWorld(this.scene, 0, screen.bottom);
        const container = this.scene.add.container(pos.x, pos.y);
        const portraitKey = this.squire.content.portraitImage;
        if (portraitKey && this.scene.textures.exists(portraitKey)) {
            const portraitImage = new Phaser.GameObjects.Image(this.scene, 0, 0, portraitKey).setDisplaySize(130, 175).setOrigin(0).setRotation(degreesToRadians(2));
            portraitImage.setOrigin(0, 1);

            container.add([portraitImage]);
        }
    }
    private renderStats(): void {
        const screen = screenBounds(this.scene);
        const maxWeight = this.squire.baseStats.maxWeight;
        const currentWeight = 0;
        this.renderTextWithIcon(0, screen.bottom - 220, `${currentWeight.toFixed(0)}/${maxWeight.toFixed(0)}`, 'icon-weight', { color: COLORTOKEN.Foreground.Quanternary }, -2)
    }

    private renderGold(): void {
        const screen = screenBounds(this.scene);
        const currentGold = this.run.gold;
        this.renderTextWithIcon(0, screen.bottom - 260, `${currentGold.toFixed(0)}`, 'icon-gold', { color: COLORTOKEN.Accent.Gold }, -2)
    }

    private renderTextWithIcon(x: number, y: number, text: string, textureKey: string, textStyle?: any, rotation: number = 0) {
        const container = this.scene.add.container(x, y);
        const icon = new Phaser.GameObjects.Image(this.scene, 8, 3, textureKey);
        icon.setDisplaySize(30, 30).setOrigin(0, 0);
        const textObj = new Phaser.GameObjects.Text(this.scene, 46, 0, text,
            {
                ...TYPETOKEN.Primary.Tagline,
                ...textStyle
            })
        container.add([icon, textObj]);
        container.setRotation(degreesToRadians(rotation) || 0);
    }

    private renderSlots(): void {
        const screen = screenBounds(this.scene);
        const slotWidth = 72;
        const slotHeight = 72;
        const slotGap = 2;
        const startPos = { x: 150, y: screen.bottom};

        this.run.inventory.forEach((item, index) => {
            const col = Math.floor(index % (this.run.inventory.length / 2));
            const row = Math.floor(index / (this.run.inventory.length / 2));
            const x = startPos.x + col * (slotWidth + slotGap);
            const y = startPos.y + slotHeight / 2 + row * (slotHeight + slotGap);
            const container = this.scene.add.container(x, y - slotHeight * 2 - 8);
            const background = new Phaser.GameObjects.Graphics(this.scene);
            const radius = 8;

            background.fillStyle(anyToColor(COLORTOKEN.Background.Primary));
            background.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, radius);
            background.lineStyle(4, anyToColor(COLORTOKEN.Background.Zeroth));
            background.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, radius);
            container.add([background]);
            container.setRotation(degreesToRadians(getRandomInt(5, -5)));
        })
    }

    private render(): void {
        this.renderStats();
        this.renderGold();
        this.renderSlots();
        this.renderPortrait();

    }
}
/*
const run = GameState.requireRun();
    
    run.bag.forEach((item, index) => {
      const x = 124 + Math.floor(index / 2) * 76;
      const y = 34 + (index % 2) * 76;
      const bg = this.scene.add.rectangle(x, y, 68, 68, item ? ITEMS[item.itemId].color : 0x1b211e, item ? 0.96 : 0.82).setStrokeStyle(2, 0x070807);
      c.add(bg);
      if (item) c.add(this.drawItemIcon(item.itemId, x, y, 54));
      this.tooltip(bg, item ? ITEMS[item.itemId].name : 'Пустой слот', item ? this.itemTooltipText(ITEMS[item.itemId]) : 'Перетащите сюда добычу.', item ? this.comparisonForItem(item.itemId) : undefined);
    });
    return c;
*/