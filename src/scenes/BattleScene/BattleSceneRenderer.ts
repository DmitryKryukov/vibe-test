import Phaser from 'phaser';
import { Background } from '@/ui/components/Background';
import { Combatant, CombatSystem } from '@/services/CombatSystem';
import { CombatantView } from '../Partials/CombatantView';
import { GameState } from '@/store/GameState';
import { Heroes } from '@/data/Heroes';

import { TYPETOKEN } from '@/ui/styles/TypeTokens';
import { COLORTOKEN } from '@/ui/styles/ColorTokens';
import { anyToColor } from '@/utils/UtilsColor';
import { Enemies, EnemyScheme } from '@/data/Enemies';
import { screenBounds, screenToWorld, screenSpaceScale } from '@/utils/UtilsLayout';
import { getEnemySlots, getHeroSlots } from './BattleLayout';
import { StatusInfo } from '@/data/Statuses';
import { BattleUI } from './BattleUI';

export class BattleSceneRenderer {
  private scene: Phaser.Scene;
  private background!: Background;
  private combatSystem: CombatSystem;

  private battleUI: BattleUI;

  private combatantViews = new Map<string, CombatantView>();

  private statusContainers = new Map<string, Phaser.GameObjects.Container>();
  private statusSignatures = new Map<string, string>();

  constructor(scene: Phaser.Scene, combatSystem: CombatSystem) {
    this.scene = scene;
    this.combatSystem = combatSystem;
    this.battleUI = new BattleUI(scene, combatSystem);
  }

  public renderStatic(): void {
    this.sceneClear();
    this.renderBackground();
    this.battleUI.renderPanels();
    this.renderHero();
    this.renderEnemies();

    /*
this.enemyPositions.clear();
this.lootItems = [];
this.bagSlotZones = [];
this.equipZones = [];
this.slotHighlights = [];

 
this.drawInventoryInteractives();
this.drawTopControls();
this.drawFieldLoot();
*/
  }

  private renderBackground(): void {
    this.background = new Background(this.scene, 'battle');
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
      return {x: x, y: y};
    } else {
      console.warn(`CombatantView с id ${id} не найден`);
    }
  }
  public getCombatantSprite(id: string): Phaser.GameObjects.GameObject {
    return this.combatantViews.get(id)?.sprite as Phaser.GameObjects.GameObject
  }

  public syncCombatantViews(): void {
    const hero = this.combatSystem.hero;
    if (!hero.alive) {
      this.removeCombatant(hero.id);
    }

    this.combatSystem.enemies.forEach(enemy => {
      if (!enemy.alive) {
        this.removeCombatant(enemy.id);
      }
    });
  }

  private removeCombatant(id: string, options?: { moveX?: number; fade?: boolean; shrink?: boolean; duration?: number; }): void {
    const {
      moveX = 0,
      fade = true,
      shrink = true,
      duration = 460,
    } = options ?? {};

    const view = this.combatantViews.get(id);

    if (!view) return;

    const sprite = view.sprite;

    view.hpBar?.destroy();

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

  

  public renderVictoryPanel(): void {
    this.battleUI.renderResultPanel('victory');
  }

  public renderDefeatPanel(): void {
    this.battleUI.renderResultPanel('defeat')
  }

  private sceneClear(): void {
    this.scene.children.removeAll();
    this.scene.input.off('drop');
    this.scene.input.off('dragend');

    this.statusContainers.clear();
    this.statusSignatures.clear();
  }

}

/*
import Phaser from 'phaser';
import { ITEMS } from '../data/items';
import { CombatantState, InventoryItem } from '../entities/Types';
import { EnemyContentDefinition, HeroContentDefinition, loadContentPack } from '../content/ContentSystem';
import { STATUS_INFO, ENEMY_SLOTS } from './constants';

export interface FieldLoot {
  item: InventoryItem;
  x: number;
  y: number;
}

export class BattleSceneRenderer {
  private effects: BattleEffects;

  // Карты и коллекции объектов
  private bagZone!: Phaser.GameObjects.Zone;
  private bagSlotZones: Phaser.GameObjects.Zone[] = [];
  private equipZones: Phaser.GameObjects.Zone[] = [];
  private lootItems: Phaser.GameObjects.Container[] = [];
  private slotHighlights: Phaser.GameObjects.Rectangle[] = [];
  public fieldLoot: FieldLoot[] = [];
  private enemyObjects = new Map<string, Phaser.GameObjects.GameObject[]>();
  private enemyPositions = new Map<string, { x: number; y: number }>();
  private combatantPositions = new Map<string, { x: number; y: number }>();
  private removedEnemies = new Set<string>();
  public spawnedRewardItems = 0;
  private statusSignatures = new Map<string, string>();

  constructor(
    scene: Phaser.Scene,
    combat: CombatSystem,
    ui: UIManager,
    effects: BattleEffects,
    backgroundKey: string
  ) {
    this.effects = effects;\
  }

  // ----- Полная перерисовка всей сцены -----
  public renderStatic(): void {
    this.scene.children.removeAll();
    this.scene.input.off('drop');
    this.scene.input.off('dragend');

    this.statusContainers.clear();
    this.enemyObjects.clear();
    this.enemyPositions.clear();
    this.removedEnemies.clear();
    this.drawnEnemies.clear();
    this.lootItems = [];
    this.bagSlotZones = [];
    this.equipZones = [];
    this.slotHighlights = [];
    this.statusSignatures.clear();


    this.drawInventoryInteractives();
    this.drawTopControls();
    this.drawFieldLoot();
    this.ui.drawHeroEmptySlotIconOverlay();
  }

  // ----- Отрисовка героя -----
  
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

  // Создаёт статический предмет (только визуал) – DragManager позже добавит интерактивность
  private createStaticItem(item: InventoryItem, index: number): void {
    const screen = screenBounds(this.scene);
    const pos = screenToWorld(
      this.scene,
      124 + Math.floor(index / 2) * 76,
      screen.bottom - 141 + (index % 2) * 76
    );
    const container = this.createItemContainer(item, pos.x, pos.y);
    container.setData('bagIndex', index);
    container.setData('origin', 'bag');
    // Сразу сохраняем в lootItems для возможности удаления – но это не loot, а инвентарь
    // Можно сохранить отдельно, но для единообразия добавим в массив, если нужно.
    // Однако у нас есть отдельные списки для дропа. Здесь просто добавим на сцену.
  }

  private createStaticEquipmentItem(item: InventoryItem, index: number): void {
    const pos = screenToWorld(this.scene, 10 + 124 + (index % 3) * 76, 10 + 38 + Math.floor(index / 3) * 76);
    const container = this.createItemContainer(item, pos.x, pos.y);
    container.setData('slotIndex', index);
    container.setData('origin', 'equipment');
  }

  // Создаёт контейнер с иконкой предмета (используется и для лута)
  public createItemContainer(item: InventoryItem, x: number, y: number): Phaser.GameObjects.Container {
    const def = ITEMS[item.itemId];
    const c = this.scene.add.container(x, y).setDepth(500);
    c.setData('itemUid', item.uid);
    c.setData('homeX', x);
    c.setData('homeY', y);
    const bg = this.scene.add.rectangle(0, 0, 58, 58, def.color, 0.98).setStrokeStyle(3, 0x090909);
    const icon = this.ui.drawItemIcon(item.itemId, 0, 0, 48);
    c.add([bg, icon]);
    c.setSize(58, 58);
    // Интерактивность будет добавлена позже в DragManager
    return c;
  }

  // ----- Полевой лут -----
  public spawnLoot(itemId: string, x?: number, y?: number): void {
    const posX = x ?? Phaser.Math.Between(720, 940);
    const posY = y ?? Phaser.Math.Between(560, 820);
    const item: InventoryItem = { uid: `${itemId}-loot-${Date.now()}-${Math.random()}`, itemId };
    this.fieldLoot.push({ item, x: posX, y: posY });
    this.createFieldLootObject(item, posX, posY, true);
  }

  private drawFieldLoot(): void {
    this.fieldLoot.forEach((loot) => this.createFieldLootObject(loot.item, loot.x, loot.y, false));
  }

  private createFieldLootObject(item: InventoryItem, x: number, y: number, animateIn: boolean): void {
    const obj = this.createItemContainer(item, x, y);
    this.lootItems.push(obj);
    if (animateIn) {
      obj.setScale(0.2);
      obj.setAlpha(0);
      obj.setY(y - 70);
      this.scene.tweens.add({
        targets: obj,
        alpha: 1,
        scale: 1,
        y,
        duration: 360,
        ease: 'Back.Out',
      });
    }
    // Плавающая анимация
    this.scene.tweens.add({
      targets: obj,
      y: y - 22,
      yoyo: true,
      repeat: -1,
      duration: 900,
      delay: animateIn ? 260 : 0,
    });
  }

  public removeFieldLoot(uid: string): void {
    this.fieldLoot = this.fieldLoot.filter((loot) => loot.item.uid !== uid);
    this.lootItems = this.lootItems.filter((loot) => loot.getData('itemUid') !== uid);
  }

  // ----- Статусы -----
  // ----- Синхронизация врагов (появление/исчезновение) -----
  


  // ----- Выпадающий лут из боёв -----
  public spawnPendingCombatLoot(): void {
    const pending = this.combat.rewards.items.slice(this.spawnedRewardItems);
    const removed = [...this.removedEnemies];
    pending.forEach((itemId, index) => {
      const deadEnemyUid = removed[removed.length - pending.length + index];
      const pos = deadEnemyUid ? this.enemyPositions.get(deadEnemyUid) : undefined;
      this.spawnLoot(
        itemId,
        (pos?.x ?? Phaser.Math.Between(720, 940)) + Phaser.Math.Between(-42, 42),
        (pos?.y ?? Phaser.Math.Between(560, 820)) + Phaser.Math.Between(28, 86)
      );
      this.ui.toast(`Выпал артефакт: ${ITEMS[itemId].name}`);
    });
    this.spawnedRewardItems = this.combat.rewards.items.length;
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