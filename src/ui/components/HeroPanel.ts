import Phaser from "phaser"
import { GameState } from "@/store/GameState";
import { Heroes, SlotType } from "@/data/Heroes";
import { screenToWorld, screenSpaceScale } from "@/utils/UtilsLayout";
import { degreesToRadians, getRandomInt } from "@/utils/UtilsMath";
import { COLORTOKEN } from "../styles/ColorTokens";
import { anyToColor } from "@/utils/UtilsColor";

export class HeroPanel extends Phaser.GameObjects.Container {
    public scene: Phaser.Scene
    private run;
    private hero;

    constructor(scene: Phaser.Scene) {
        super(scene);
        this.run = GameState.requireRun();
        this.hero = Heroes[this.run.heroId];
        this.scene = scene;
        this.render();
    }
    private renderPortrait(): void {
        const pos = screenToWorld(this.scene, 10, 10);
        const container = this.scene.add.container(pos.x, pos.y).setScale(screenSpaceScale(this.scene)).setDepth(50);
        const portraitKey = this.hero.content?.portraitImage;

        if (portraitKey && this.scene.textures.exists(portraitKey)) {
            const backdrop = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 100, 144, anyToColor(COLORTOKEN.Background.Zeroth)).setOrigin(0).setRotation(degreesToRadians(2));
            const portraitImage = new Phaser.GameObjects.Image(this.scene, 0, 0, portraitKey).setDisplaySize(100, 144).setOrigin(0).setRotation(degreesToRadians(2));
            container.add(backdrop);
            container.add(portraitImage);
        }
    }
    private renderSlots(): void {
        this.hero.slots.forEach((slot, index) => {
            const slotWidth = 72;
            const slotHeight = 72;
            const slotGap = 2;
            const startPos = { x: 150, y: 10 };

            const col = Math.floor(index % (this.hero.slots.length / 2));
            const row = Math.floor(index / (this.hero.slots.length / 2));

            const x = startPos.x + col * (slotWidth + slotGap);
            const y = startPos.y + slotHeight / 2 + row * (slotHeight + slotGap);

            const container = this.scene.add.container(x, y);

            const background = new Phaser.GameObjects.Graphics(this.scene);
            const radius = 8;

            background.fillStyle(anyToColor(COLORTOKEN.Background.Primary));
            background.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, radius);
            background.lineStyle(4, anyToColor(COLORTOKEN.Background.Zeroth));
            background.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, radius);

            /*
            const text = new Phaser.GameObjects.Text(this.scene, 0, 0, slot + "\n" + col + "/" + row, { align: 'center' })
                .setOrigin(0.5).setDepth(400);
                */
            
            const icon = this.renderEmptySlotIcon(slot, x, y, slotWidth, slotHeight);


            container.add([background, icon]);
            container.setRotation(degreesToRadians(getRandomInt(4, -4)));
            /*
      const item = run.equipment[index];
      c.add(bg);
      if (item) {
        c.add(this.drawItemIcon(item.itemId, x, y, 54));
      } else {
        c.add(this.drawEmptySlotIcon(slot, x, y));
      }
      this.tooltip(bg, item ? ITEMS[item.itemId].name : GameState.slotLabel(slot), item ? this.itemTooltipText(ITEMS[item.itemId]) : 'Перетащите подходящий предмет.', item ? this.comparisonForItem(item.itemId) : undefined);
    });
               */

        })
    }

    private renderEmptySlotIcon(slot: SlotType, x:number, y:number, width: number, height: number): Phaser.GameObjects.Image {
        const textureKey = slot +'-slot-empty'
        const GO = new Phaser.GameObjects.Image(this.scene,0,0,textureKey);
        GO.setDisplaySize(width, height)
        return GO;

        /*  
  this.tooltip(bg, GameState.slotLabel(slot), 'Перетащите подходящий предмет.');
});
*/


    }

    private render(): void {
        this.renderPortrait();
        this.renderSlots();

    }
}