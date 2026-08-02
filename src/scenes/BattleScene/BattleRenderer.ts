import { GameState } from '@/store/GameState';

import { CombatSystem } from '@/services/CombatSystem';
import { Enemies } from '@/data/Enemies';
import { Heroes } from '@/data/Heroes';
import { CombatantView } from '@/partials/battle/CombatantView';
import { Combatant } from '@/services/CombatantFactory';
import { getEnemySlots, getHeroSlots } from '@/data/Battleground';

import { ItemsRenderer } from './ItemsRenderer';

import { Background } from '@/partials/ui/components/Background';

import { MainUI } from '@/partials/ui/MainUI';

import { screenBounds } from '@/utils/UtilsLayout';

export class BattleSceneRenderer {
    private scene: Phaser.Scene;
    private combatSystem: CombatSystem;
    private mainUI: MainUI;
    private combatantViews = new Map<string, CombatantView>();
    private defeatedCombatantPositions = new Map<string, Position>();
    public itemRenderer: ItemsRenderer;

    constructor(scene: Phaser.Scene, combatSystem: CombatSystem) {
        this.scene = scene;
        this.combatSystem = combatSystem;
        this.itemRenderer = new ItemsRenderer(
            scene,
            combatSystem,
            (combatantId) => this.getCombatantPosition(combatantId),
        );
        this.mainUI = new MainUI(scene, combatSystem);
    }

    public renderStatic(): void {
        this.itemRenderer.clear();
        this.sceneClear();
        this.renderBackground();
        this.mainUI.renderPanels();
        this.renderHero();
        this.renderEnemies();
        this.itemRenderer.render();

        /* Перенести в UI
    this.drawInventoryInteractives();
    this.drawTopControls(); 
    */
    }

    private renderBackground(): void {
        new Background(this.scene, 'battle');
    }

    private renderHero(): void {
        const hero = this.combatSystem.hero;
        const heroScheme = Heroes[GameState.requireRun().heroId];

        const { x, y } = getHeroSlots();
        const view = new CombatantView(
            this.scene, hero, x, y,
            {
                textureKey:
                    heroScheme.content?.spriteImage ?? '__White',
                width:
                    heroScheme.content?.spriteWidth ?? 390,
                height:
                    heroScheme.content?.spriteHeight ?? 510,
                scale:
                    heroScheme.content?.spriteScale ?? 1,
                offsetX:
                    heroScheme.content?.spriteOffsetX ?? 0,
                offsetY:
                    heroScheme.content?.spriteOffsetY ?? -84,
                statusBarX:
                    heroScheme.content?.statusBarX ?? 0,
                statusBarY:
                    heroScheme.content?.statusBarY ?? -84,
                type: 'hero',
            },
        );
        this.combatantViews.set(hero.id, view);
    }

    private renderEnemies(): void {
        const screen = screenBounds(this.scene);
        const enemies = this.combatSystem.enemies;
        const slots = getEnemySlots(enemies.length, screen)

        this.combatSystem.enemies.forEach((enemy, index) => {
            const position = slots[index] ?? slots[0];
            this.renderEnemy(enemy, position.x, position.y);
        })
    }

    private renderEnemy(enemy: Combatant, x: number, y: number): void {
        if (!enemy.alive) return;
        const enemyScheme = Enemies[enemy.definitionId];
        const view = new CombatantView(
            this.scene, enemy, x, y,
            {
                textureKey:
                    enemyScheme.content?.spriteImage ?? '__White',
                width:
                    enemyScheme.content?.spriteWidth ?? 390,
                height:
                    enemyScheme.content?.spriteHeight ?? 510,
                scale:
                    enemyScheme.content?.spriteScale ?? 1,
                offsetX:
                    enemyScheme.content?.spriteOffsetX ?? 0,
                offsetY:
                    enemyScheme.content?.spriteOffsetY ?? -84,
                statusBarX:
                    enemyScheme.content?.statusBarX ?? 0,
                statusBarY:
                    enemyScheme.content?.statusBarY ?? -84,
                type: 'enemy',
            },
        );
        this.combatantViews.set(enemy.id, view);
    }

    public getCombatantPosition(id: string): { x: number; y: number } | undefined {
        const combatantView = this.combatantViews.get(id);
        if (combatantView) {
            const x = combatantView.sprite.x;
            const y = combatantView.sprite.y;
            return { x: x, y: y };
        }

        return this.defeatedCombatantPositions.get(id);
    }

    public getCombatantSprite(id: string): Phaser.GameObjects.GameObject {
        return this.combatantViews.get(id)?.sprite as Phaser.GameObjects.GameObject
    }

    public update(): void {
        const hero = this.combatSystem.hero;
        if (!this.combatSystem.hero.alive) {
            this.removeCombatantView(hero.id);
        }

        this.combatSystem.enemies.forEach(enemy => {
            if (!enemy.alive) {
                this.removeCombatantView(enemy.id);
            }
        });
    }

    private removeCombatantView(id: string, options?: { moveX?: number; fade?: boolean; shrink?: boolean; duration?: number; }): void {
        const {
            moveX = 0,
            fade = true,
            shrink = true,
            duration = 460,
        } = options ?? {};

        const view = this.combatantViews.get(id);

        if (!view) return;


        const sprite = view.sprite;
        this.defeatedCombatantPositions.set(id, {
            x: sprite.x,
            y: sprite.y,
        });

        view.hpBar?.destroy();
        view.statusBar?.destroy();

        this.scene.tweens.add({
            targets: sprite,

            alpha: fade ? 0 : 1,

            x: sprite.x + moveX,
            y: sprite.y,

            scaleX: shrink ? 0 : sprite.scaleX,
            scaleY: shrink ? 0 : sprite.scaleY,

            duration,

            ease: 'Quint.easeOut',

            onComplete: () => {
                view.destroy();
            },
        });
        this.combatantViews.delete(id);
    }

    public renderVictoryPanel(callbackArrowButon: () => void): void {
        this.mainUI.renderVictoryPanel(callbackArrowButon);
    }

    public renderDefeatPanel(): void {
        this.mainUI.renderResultPanel('defeat')
    }

    private sceneClear(): void {
        this.scene.children.removeAll();
        this.scene.input.off('drop');
        this.scene.input.off('dragend');
    }
}

/*
import { CombatantState, InventoryItem } from '../entities/Types';


export class BattleSceneRenderer {

// Карты и коллекции объектов
  private bagZone!: Phaser.GameObjects.Zone;
  private bagSlotZones: Phaser.GameObjects.Zone[] = [];
  private equipZones: Phaser.GameObjects.Zone[] = [];
  private lootItems: Phaser.GameObjects.Container[] = [];
  private slotHighlights: Phaser.GameObjects.Rectangle[] = [];

  public spawnedRewardItems = 0;

  // ----- Полная перерисовка всей сцены -----
  public renderStatic(): void {
    
    this.bagSlotZones = [];
    this.equipZones = [];
    this.slotHighlights = [];
    this.statusSignatures.clear();

    this.drawInventoryInteractives();
    this.drawTopControls();
    this.ui.drawHeroEmptySlotIconOverlay();
  }
  
  // ----- Инвентарь (только визуальная часть, без drag-обработчиков) -----
  private drawInventoryInteractives(): void {
    const run = GameState.requireRun();
    const screen = screenBounds(this.scene);
    const bagColumns = Math.ceil(run.bag.length / 2);
    const bagRows = 2;
    const bagWidth = bagColumns * 76 + 36;
    const bagHeight = bagRows * 76 + 36;
    const bagCenter = screenToWorld(
      this.scene,
      124 + ((bagColumns - 1) * 76) / 2,
      screen.bottom - 141 + ((bagRows - 1) * 76) / 2
    );
    const uiScale = screenSpaceScale(this.scene);
    this.bagZone = this.scene.add.zone(bagCenter.x, bagCenter.y, bagWidth * uiScale, bagHeight * uiScale)
      .setRectangleDropZone(bagWidth * uiScale, bagHeight * uiScale);

    run.bag.forEach((_, index) => {
      const slotPos = screenToWorld(
        this.scene,
        124 + Math.floor(index / 2) * 76,
        screen.bottom - 141 + (index % 2) * 76
      );
      const zone = this.scene.add.zone(slotPos.x, slotPos.y, 74 * uiScale, 74 * uiScale)
        .setRectangleDropZone(74 * uiScale, 74 * uiScale);
      zone.setData('bagIndex', index);
      this.bagSlotZones.push(zone);
    });

    const slotPositions = HEROES[run.heroId].slots.map((_, index) =>
      screenToWorld(this.scene, 10 + 124 + (index % 3) * 76, 10 + 38 + Math.floor(index / 3) * 76)
    );
    slotPositions.forEach((pos, index) => {
      const zone = this.scene.add.zone(pos.x, pos.y, 74 * uiScale, 74 * uiScale)
        .setRectangleDropZone(74 * uiScale, 74 * uiScale);
      zone.setData('slotIndex', index);
      this.equipZones.push(zone);
    });

    // Создаём предметы (без обработчиков перетаскивания – их добавит DragManager)
    run.bag.forEach((item, index) => {
      if (item) this.createStaticItem(item, index);
    });
    run.equipment.forEach((item, index) => {
      if (item) this.createStaticEquipmentItem(item, index);
    });
  }

  // ----- Верхние кнопки (пауза, ускорение) -----
  private drawTopControls(): void {
    const screen = screenBounds(this.scene);
    this.ui.button(screen.right - 260, screen.top + 36, 66, 46, 'Ⅱ', () => this.openPause?.());
    this.ui.button(screen.right - 184, screen.top + 36, 66, 46, '▶', () => {
      this.scene.time.timeScale = this.scene.time.timeScale === 1 ? 1.7 : 1;
    });
    this.ui.button(screen.right - 108, screen.top + 36, 66, 46, '»', () => {
      this.scene.time.timeScale = this.scene.time.timeScale === 3 ? 1 : 3;
    });
  }

  // Метод для привязки обработчика открытия паузы (будет установлен снаружи)
  public openPause?: () => void;

  // ----- Победа (экран завершения) -----
  // ----- Геттеры для доступа к зонам и объектам (для DragManager) -----
  public getHeroZone(): Phaser.GameObjects.Zone {
    return this.heroZone;
  }

  public getBagZone(): Phaser.GameObjects.Zone {
    return this.bagZone;
  }

  public getBagSlotZones(): Phaser.GameObjects.Zone[] {
    return this.bagSlotZones;
  }

  public getEquipZones(): Phaser.GameObjects.Zone[] {
    return this.equipZones;
  }

  public getEnemyZones(): Map<string, Phaser.GameObjects.Zone> {
    return this.enemyZones;
  }

  public getLootItems(): Phaser.GameObjects.Container[] {
    return this.lootItems;
  }

  public getFieldLoot(): FieldLoot[] {
    return this.fieldLoot;
  }


  public getEnemyPositions(): Map<string, { x: number; y: number }> {
    return this.enemyPositions;
  }

  public clearSlotHighlights(): void {
    this.slotHighlights.forEach((h) => h.destroy());
    this.slotHighlights = [];
  }

  public showSlotHighlights(itemId: string): void {
    this.clearSlotHighlights();
    const slot = ITEMS[itemId].slot;
    if (!slot) return;
    const run = GameState.requireRun();
    HEROES[run.heroId].slots.forEach((candidate, index) => {
      if (candidate !== slot) return;
      const x = 134 + (index % 3) * 76;
      const y = 48 + Math.floor(index / 3) * 76;
      const highlight = this.scene.add.rectangle(x, y, 78, 78, 0xf2cf69, 0.18)
        .setStrokeStyle(4, 0xf2cf69, 0.95)
        .setDepth(850);
      this.slotHighlights.push(highlight);
      this.scene.tweens.add({
        targets: highlight,
        alpha: 0.45,
        yoyo: true,
        repeat: -1,
        duration: 420,
      });
    });
  }

  // ----- Очистка (при уничтожении сцены) -----
  public destroy(): void {
    // Очистка ресурсов (можно добавить при необходимости)
    this.bars.clear();
    this.hpTexts.clear();
    this.statusContainers.clear();
    this.enemyZones.clear();
    this.bodyObjects.clear();
    this.enemyObjects.clear();
    this.enemyPositions.clear();
    this.combatantPositions.clear();
    this.removedEnemies.clear();
    this.drawnEnemies.clear();
    this.lootItems = [];
    this.bagSlotZones = [];
    this.equipZones = [];
    this.slotHighlights = [];
    this.statusSignatures.clear();
    this.fieldLoot = [];
  }
}
*/
