import Phaser from 'phaser';
import { Heroes } from '@/data/Heroes';
import { Squires } from '@/data/Squires';
import { GameState } from '@/store/GameState';
import { BattleSceneRenderer } from './BattleSceneRenderer';
import { CombatSystem } from '@/services/CombatSystem';
//import { ENEMIES } from '../data/Enemies';
//import { ITEMS } from '../data/items';
//import { CombatantState, EncounterType, InventoryItem, StatusId } from '../entities/Types';
//import { GameState } from '../state/GameState';
//import { SaveSystem } from '../state/SaveSystem';
//import { CombatSystem, CombatVisualEvent } from '../systems/CombatSystem';
//import { itemFromInventory, throwItemAtEnemy, useItemOnHero } from '../systems/ItemSystem';
//import { UIManager } from '../ui/UIManager';
//import { screenBounds, screenSpaceScale, screenToWorld, viewBounds } from '../utils/layout';
//import { EnemyContentDefinition, HeroContentDefinition, loadContentPack } from '../content/ContentSystem';

interface BattleData {
    nodeId: string;
    //nodeType: EncounterType;
    enemyIds: string[];
}

interface FieldLoot {
    //item: InventoryItem;
    x: number;
    y: number;
}
/*
const STATUS_INFO: Record<StatusId, { name: string; description: string }> = {
  poison: { name: 'Яд', description: 'Копится стаками. Каждые 100 стаков дают одну порцию периодического урона.' },
  bleed: { name: 'Кровотечение', description: 'Периодически наносит физический урон. Чем больше стаков, тем сильнее тик.' },
  burn: { name: 'Поджог', description: 'Периодически наносит огненный урон.' },
  chill: { name: 'Окоченение', description: 'Холодный эффект. Используется предметами и способностями для замедляющего давления.' },
  stun: { name: 'Оглушение', description: 'Цель временно не может выполнять свои действия.' },
  blind: { name: 'Ослепление', description: 'Цель с высокой вероятностью промахивается атакой.' },
  dizzy: { name: 'Головокружение', description: 'Делает цель уязвимой к некоторым атакам врагов.' },
  hex: { name: 'Сглаз', description: 'Цель получает больше входящего урона.' },
  madness: { name: 'Безумие', description: 'Ускоряет действия, но мешает нормально учитывать защиту.' },
  antiheal: { name: 'Запрет лечения', description: 'Цель не может восстанавливать здоровье.' },
  shield: { name: 'Щит', description: 'Поглощает часть входящего урона.' },
  slow: { name: 'Замедление', description: 'Замедляет заполнение таймеров действий.' },
  invulnerable: { name: 'Неуязвимость', description: 'Цель временно не получает урон.' }
};
*/

export class BattleScene extends Phaser.Scene {
    private nodeId = '';
    private sceneRenderer!: BattleSceneRenderer;
    private combatSystem!: CombatSystem;

    constructor() {
        super('BattleScene');
    }

    init(data: BattleData): void {
        this.nodeId = data.nodeId;
        this.combatSystem = new CombatSystem();
    }
    create(): void {
    //this.scale.off('resize', this.handleResize);
    //this.scale.on('resize', this.handleResize);
    //this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', this.handleResize));

    this.sceneRenderer = new BattleSceneRenderer(this, this.combatSystem);
    this.sceneRenderer.renderStatic();
  }

    /*
  private ui!: UIManager;
  private combat!: CombatSystem;
  private nodeId = '';
  private nodeType: EncounterType = 'battle';
  private bars = new Map<string, Phaser.GameObjects.Graphics>();
  private hpTexts = new Map<string, Phaser.GameObjects.Text>();
  private statusContainers = new Map<string, Phaser.GameObjects.Container>();
  private enemyZones = new Map<string, Phaser.GameObjects.Zone>();
  private heroZone!: Phaser.GameObjects.Zone;
  private bagZone!: Phaser.GameObjects.Zone;
  private bagSlotZones: Phaser.GameObjects.Zone[] = [];
  private equipZones: Phaser.GameObjects.Zone[] = [];
  private lootItems: Phaser.GameObjects.Container[] = [];
  private slotHighlights: Phaser.GameObjects.Rectangle[] = [];
  private fieldLoot: FieldLoot[] = [];
  private bodyObjects = new Map<string, Phaser.GameObjects.GameObject[]>();
  private enemyObjects = new Map<string, Phaser.GameObjects.GameObject[]>();
  private enemyPositions = new Map<string, { x: number; y: number }>();
  private combatantPositions = new Map<string, { x: number; y: number }>();
  private removedEnemies = new Set<string>();
  private drawnEnemies = new Set<string>();
  private spawnedRewardItems = 0;
  private finishQueued = false;
  private victorySummary: string[] = [];
  private ended = false;
  private battleBackgroundKey = 'bg-battle';
  private statusSignatures = new Map<string, string>();
  private readonly handleResize = (): void => this.renderStatic();

  constructor() {
    super('BattleScene');
  }

  init(data: BattleData): void {
    this.nodeId = data.nodeId;
    this.nodeType = data.nodeType;
    this.combat = new CombatSystem(data.enemyIds);
    this.ended = false;
    this.finishQueued = false;
    this.victorySummary = [];
    this.fieldLoot = [];
    this.lootItems = [];
    this.spawnedRewardItems = 0;
    const backgroundCount = loadContentPack()?.battleBackgrounds?.length ?? 0;
    this.battleBackgroundKey = backgroundCount > 0
      ? `bg-battle-custom-${Phaser.Math.Between(0, backgroundCount - 1)}`
      : 'bg-battle';
  }

  create(): void {
    this.ui = new UIManager(this);
    SaveSystem.startAutosave(this);
    this.scale.off('resize', this.handleResize);
    this.scale.on('resize', this.handleResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', this.handleResize));
    this.input.keyboard?.on('keydown-ESC', () => this.openPause());
    this.renderStatic();
  }

  update(_: number, delta: number): void {
    if (this.ended) return;
    this.combat.update(delta);
    this.playCombatVisuals();
    this.syncEnemyViews();
    this.spawnPendingCombatLoot();
    this.refreshBars();
    this.refreshStatusBadges();
    if (this.combat.ended && !this.finishQueued) {
      const result = this.combat.ended;
      this.finishQueued = true;
      this.time.delayedCall(950, () => this.finishBattle(result));
    }
  }

  renderStatic(): void {
    this.children.removeAll();
    this.input.off('drop');
    this.input.off('dragend');
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
    this.ui.drawBackdrop('battle', this.battleBackgroundKey);
    this.ui.drawHeroPanel();
    this.ui.drawBagPanel();
    this.drawHero();
    this.drawEnemies();
    this.drawInventoryInteractives();
    this.drawTopControls();
    this.drawFieldLoot();
    this.ui.drawHeroEmptySlotIconOverlay();
    if (this.ended && this.combat.ended === 'victory') this.drawVictoryExit();
  }

  drawHero(): void {
    const hero = this.combat.hero;
    const x = 405;
    const y = 430;
    const g = this.createHeroVisual(x, y);
    const name = this.add.text(x, y + 78, hero.name, { resolution: Math.min(window.devicePixelRatio || 1, 2), fontSize: '24px', color: '#e8dfc5', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setDepth(110);
    this.bodyObjects.set(hero.uid, [g, name]);
    this.combatantPositions.set(hero.uid, { x, y: y - 70 });
    this.statusContainers.set(hero.uid, this.add.container(x, y - 292).setDepth(95));
    this.heroZone = this.add.zone(x, y - 70, 260, 360).setRectangleDropZone(260, 360);
    this.drawHpBar(hero, x - 170, y + 112, 285);
  }

  drawEnemies(): void {
    const slots = [
      { x: 1115, y: 360 },
      { x: 1378, y: 550 },
      { x: 1120, y: 825 },
      { x: 1465, y: 790 },
      { x: 1260, y: 250 }
    ];
    this.combat.enemies.forEach((enemy, index) => {
      const pos = slots[index] ?? slots[0];
      this.drawEnemy(enemy, pos.x, pos.y);
    });
  }

  drawEnemy(enemy: CombatantState, x: number, y: number): void {
    if (!enemy.alive || this.drawnEnemies.has(enemy.uid)) return;
    const def = ENEMIES[enemy.definitionId];
    const g = this.createEnemyVisual(enemy, x, y, def.scale);
    const name = this.add.text(x, y + 78, enemy.name, { resolution: Math.min(window.devicePixelRatio || 1, 2), fontSize: '19px', color: '#e8dfc5', stroke: '#000000', strokeThickness: 4, wordWrap: { width: 230 }, align: 'center' }).setOrigin(0.5).setDepth(110);
    const zone = this.add.zone(x, y - 28, 250, 240).setRectangleDropZone(250, 240);
    this.enemyZones.set(enemy.uid, zone);
    const barObjects = this.drawHpBar(enemy, x - 95, y + 108, 210);
    this.enemyObjects.set(enemy.uid, [g, name, zone, ...barObjects]);
    this.bodyObjects.set(enemy.uid, [g, name]);
    this.enemyPositions.set(enemy.uid, { x, y });
    this.combatantPositions.set(enemy.uid, { x, y });
    this.statusContainers.set(enemy.uid, this.add.container(x, y - 178).setDepth(95));
    this.drawnEnemies.add(enemy.uid);
  }

  createHeroVisual(x: number, y: number): Phaser.GameObjects.GameObject {
    const hero = HEROES[GameState.requireRun().heroId] as HeroContentDefinition;
    const key = `sprite-hero-${GameState.requireRun().heroId}`;
    if (this.textures.exists(key)) {
      const width = hero.spriteWidth ?? (GameState.requireRun().heroId === 'beatrice' ? 305 : 285);
      const height = hero.spriteHeight ?? 360;
      const spriteScale = hero.spriteScale ?? 1;
      const offsetY = hero.spriteOffsetY ?? -84;
      return this.add.image(x, y - 84, key)
        .setY(y + offsetY)
        .setDisplaySize(width * spriteScale, height * spriteScale)
        .setDepth(10);
    }
    const g = this.add.graphics();
    g.fillStyle(HEROES[GameState.requireRun().heroId].portraitTint, 1);
    g.fillEllipse(x, y - 155, 92, 120);
    g.fillStyle(0x2d251f, 1);
    g.fillRoundedRect(x - 45, y - 105, 90, 160, 18);
    g.lineStyle(18, 0x5d2620, 1);
    g.lineBetween(x - 20, y - 118, x + 152, y - 210);
    g.setDepth(10);
    return g;
  }

  createEnemyVisual(enemy: CombatantState, x: number, y: number, scale: number): Phaser.GameObjects.GameObject {
    const key = `sprite-enemy-${enemy.definitionId}`;
    if (this.textures.exists(key)) {
      const beast = enemy.faction === 'beast';
      const def = ENEMIES[enemy.definitionId] as EnemyContentDefinition;
      const width = def.spriteWidth ?? (beast ? 250 : 188) * scale;
      const height = def.spriteHeight ?? (beast ? 170 : 250) * scale;
      const spriteScale = def.spriteScale ?? 1;
      const offsetY = def.spriteOffsetY ?? (beast ? -18 : -62);
      return this.add.image(x, y + (beast ? -18 : -62), key)
        .setY(y + offsetY)
        .setDisplaySize(width * spriteScale, height * spriteScale)
        .setDepth(10);
    }
    const def = ENEMIES[enemy.definitionId];
    const g = this.add.graphics();
    g.fillStyle(def.tint, 0.95);
    g.fillRoundedRect(x - 54 * scale, y - 106 * scale, 108 * scale, 150 * scale, 18);
    g.fillEllipse(x, y - 130 * scale, 70 * scale, 72 * scale);
    g.setDepth(10);
    return g;
  }

  drawHpBar(target: CombatantState, x: number, y: number, width: number): Phaser.GameObjects.GameObject[] {
    const g = this.add.graphics().setDepth(40);
    const objects: Phaser.GameObjects.GameObject[] = [g];
    g.setData('target', target);
    g.setData('x', x);
    g.setData('y', y);
    g.setData('w', width);
    this.bars.set(target.uid, g);
    const hpText = this.add.text(x + width / 2, y + 16, '', { resolution: Math.min(window.devicePixelRatio || 1, 2), fontSize: '16px', color: '#ffe4cf', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setDepth(75);
    this.hpTexts.set(target.uid, hpText);
    objects.push(hpText);
    if (target.faction) {
      const factionKey = `icon-faction-${target.faction}`;
      const factionIcon = this.textures.exists(factionKey)
        ? this.add.image(x + 30, y + 58, factionKey).setDisplaySize(46, 46).setDepth(76)
        : this.add.circle(x + 30, y + 58, 19, 0x1b1515, 0.92).setStrokeStyle(2, 0xb44737).setDepth(76);
      objects.push(factionIcon);
      this.ui.tooltip(factionIcon.setInteractive({ useHandCursor: false }), 'Фракция', `Тип врага: ${target.faction}`);
    }
    this.refreshOneBar(g);
    target.abilities.forEach((ability, index) => {
      const cx = x - 24 + index * 42;
      const cy = y + 16;
      const zone = this.add.circle(cx, cy, 18, 0x000000, 0.001).setDepth(70);
      zone.setInteractive({ useHandCursor: true });
      objects.push(zone);
      this.ui.tooltip(
        zone,
        ability.name,
        [
          ability.description,
          `Таймер: ${ability.cooldown} сек.`,
          'Когда круг заполняется, действие срабатывает автоматически и таймер сбрасывается.'
        ].join('\n')
      );
    });
    return objects;
  }

  refreshBars(): void {
    this.bars.forEach((bar) => this.refreshOneBar(bar));
  }

  refreshOneBar(g: Phaser.GameObjects.Graphics): void {
    const target = g.getData('target') as CombatantState;
    const x = g.getData('x') as number;
    const y = g.getData('y') as number;
    const w = g.getData('w') as number;
    g.clear();
    g.fillStyle(0x060606, 0.95);
    g.fillRoundedRect(x, y, w, 32, 5);
    g.fillStyle(0xff1f16, target.alive ? 1 : 0.25);
    g.fillRoundedRect(x + 6, y + 6, Math.max(0, (w - 12) * (target.hp / target.maxHp)), 20, 4);
    const hpText = this.hpTexts.get(target.uid);
    hpText?.setText(`${Math.max(0, Math.ceil(target.hp))}/${target.maxHp}`);
    g.lineStyle(2, 0x000000, 0.8);
    for (let i = 0; i < target.abilities.length; i += 1) {
      const a = target.abilities[i];
      const cx = x - 24 + i * 42;
      const cy = y + 16;
      g.fillStyle(0x090909, 0.95);
      g.fillCircle(cx, cy, 17);
      g.slice(cx, cy, 15, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + 360 * Math.min(1, a.progress / a.cooldown)), false);
      g.fillStyle(a.kind === 'utility' ? 0x38c978 : 0xff5522, 1);
      g.fillPath();
    }
    if (target.shield > 0) {
      g.lineStyle(4, 0x5cc7ff, 0.9);
      g.strokeRoundedRect(x + 2, y + 2, w - 4, 28, 5);
    }
  }

  drawInventoryInteractives(): void {
    const run = GameState.requireRun();
    const screen = screenBounds(this);
    const bagColumns = Math.ceil(run.bag.length / 2);
    const bagRows = 2;
    const bagWidth = bagColumns * 76 + 36;
    const bagHeight = bagRows * 76 + 36;
    const bagCenter = screenToWorld(this, 124 + ((bagColumns - 1) * 76) / 2, screen.bottom - 141 + ((bagRows - 1) * 76) / 2);
    const uiScale = screenSpaceScale(this);
    this.bagZone = this.add.zone(bagCenter.x, bagCenter.y, bagWidth * uiScale, bagHeight * uiScale).setRectangleDropZone(bagWidth * uiScale, bagHeight * uiScale);
    run.bag.forEach((_, index) => {
      const slotPos = screenToWorld(this, 124 + Math.floor(index / 2) * 76, screen.bottom - 141 + (index % 2) * 76);
      const zone = this.add.zone(slotPos.x, slotPos.y, 74 * uiScale, 74 * uiScale).setRectangleDropZone(74 * uiScale, 74 * uiScale);
      zone.setData('bagIndex', index);
      this.bagSlotZones.push(zone);
    });
    const slotPositions = HEROES[run.heroId].slots.map((_, index) => screenToWorld(this, 10 + 124 + (index % 3) * 76, 10 + 38 + Math.floor(index / 3) * 76));
    slotPositions.forEach((pos, index) => {
      const zone = this.add.zone(pos.x, pos.y, 74 * uiScale, 74 * uiScale).setRectangleDropZone(74 * uiScale, 74 * uiScale);
      zone.setData('slotIndex', index);
      this.equipZones.push(zone);
    });
    run.bag.forEach((item, index) => {
      if (item) this.createDraggableInventoryItem(item, index);
    });
    run.equipment.forEach((item, index) => {
      if (item) this.createDraggableEquipmentItem(item, index);
    });
    this.input.on('drop', (_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, zone: Phaser.GameObjects.Zone) => this.handleDrop(obj, zone));
    this.input.on('dragend', (_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, dropped: boolean) => {
      this.clearSlotHighlights();
      if (!dropped) {
        this.tweens.add({
          targets: obj,
          x: obj.getData('homeX') as number,
          y: obj.getData('homeY') as number,
          duration: 160,
          ease: 'Sine.easeOut'
        });
      }
    });
  }

  createDraggableInventoryItem(item: InventoryItem, index: number): void {
    const screen = screenBounds(this);
    const pos = screenToWorld(this, 124 + Math.floor(index / 2) * 76, screen.bottom - 141 + (index % 2) * 76);
    const obj = this.createDraggableItem(item, pos.x, pos.y, 'bag').setScale(screenSpaceScale(this));
    obj.setData('bagIndex', index);
  }

  createDraggableEquipmentItem(item: InventoryItem, index: number): void {
    const pos = screenToWorld(this, 10 + 124 + (index % 3) * 76, 10 + 38 + Math.floor(index / 3) * 76);
    this.createDraggableItem(item, pos.x, pos.y, 'equipment').setScale(screenSpaceScale(this));
  }

  createDraggableItem(item: InventoryItem, x: number, y: number, origin: string): Phaser.GameObjects.Container {
    const def = ITEMS[item.itemId];
    const c = this.add.container(x, y).setDepth(500);
    c.setData('itemUid', item.uid);
    c.setData('origin', origin);
    c.setData('homeX', x);
    c.setData('homeY', y);
    c.setData('lastParticleAt', 0);
    const bg = this.add.rectangle(0, 0, 58, 58, def.color, 0.98).setStrokeStyle(3, 0x090909);
    c.add([bg, this.ui.drawItemIcon(item.itemId, 0, 0, 48)]);
    c.setSize(58, 58);
    c.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(c);
    c.on('dragstart', () => {
      this.tweens.killTweensOf(c);
      c.setScale(1);
      c.setDepth(900);
      this.showSlotHighlights(item.itemId);
    });
    c.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      c.setPosition(dragX, dragY);
      this.emitDragParticle(c);
    });
    this.ui.tooltip(c, def.name, this.ui.itemTooltipText(def), this.ui.comparisonForItem(item.itemId));
    return c;
  }

  showSlotHighlights(itemId: string): void {
    this.clearSlotHighlights();
    const slot = ITEMS[itemId].slot;
    if (!slot) return;
    const run = GameState.requireRun();
    HEROES[run.heroId].slots.forEach((candidate, index) => {
      if (candidate !== slot) return;
      const x = 134 + (index % 3) * 76;
      const y = 48 + Math.floor(index / 3) * 76;
      const highlight = this.add.rectangle(x, y, 78, 78, 0xf2cf69, 0.18).setStrokeStyle(4, 0xf2cf69, 0.95).setDepth(850);
      this.slotHighlights.push(highlight);
      this.tweens.add({ targets: highlight, alpha: 0.45, yoyo: true, repeat: -1, duration: 420 });
    });
  }

  clearSlotHighlights(): void {
    this.slotHighlights.forEach((highlight) => highlight.destroy());
    this.slotHighlights = [];
  }

  spawnLoot(itemId: string, x = Phaser.Math.Between(720, 940), y = Phaser.Math.Between(560, 820)): void {
    const item: InventoryItem = { uid: `${itemId}-loot-${Date.now()}-${Math.random()}`, itemId };
    this.fieldLoot.push({ item, x, y });
    this.createFieldLootObject(item, x, y, true);
  }

  drawFieldLoot(): void {
    this.fieldLoot.forEach((loot) => this.createFieldLootObject(loot.item, loot.x, loot.y, false));
  }

  createFieldLootObject(item: InventoryItem, x: number, y: number, animateIn: boolean): void {
    const obj = this.createDraggableItem(item, x, y, 'loot');
    this.lootItems.push(obj);
    if (animateIn) {
      obj.setScale(0.2);
      obj.setAlpha(0);
      obj.setY(y - 70);
      this.tweens.add({
        targets: obj,
        alpha: 1,
        scale: 1,
        y,
        duration: 360,
        ease: 'Back.Out'
      });
    }
    this.tweens.add({ targets: obj, y: y - 22, yoyo: true, repeat: -1, duration: 900, delay: animateIn ? 260 : 0 });
  }

  emitDragParticle(obj: Phaser.GameObjects.Container): void {
    const now = this.time.now;
    const last = obj.getData('lastParticleAt') as number;
    if (now - last < 38) return;
    obj.setData('lastParticleAt', now);
    const dot = this.add.circle(
      obj.x + Phaser.Math.Between(-18, 18),
      obj.y + Phaser.Math.Between(-18, 18),
      Phaser.Math.Between(3, 6),
      Phaser.Utils.Array.GetRandom([0xffd66b, 0xff6a38, 0x9b5cff]),
      0.85
    ).setDepth(850);
    this.tweens.add({
      targets: dot,
      x: dot.x + Phaser.Math.Between(-14, 14),
      y: dot.y + Phaser.Math.Between(-18, 8),
      alpha: 0,
      scale: 0.25,
      duration: 330,
      ease: 'Sine.easeOut',
      onComplete: () => dot.destroy()
    });
  }

  syncEnemyViews(): void {
    const slots = [
      { x: 1115, y: 360 },
      { x: 1378, y: 550 },
      { x: 1120, y: 825 },
      { x: 1465, y: 790 },
      { x: 1260, y: 250 }
    ];
    this.combat.enemies.forEach((enemy, index) => {
      if (enemy.alive && !this.drawnEnemies.has(enemy.uid)) {
        const pos = slots[index] ?? slots[slots.length - 1];
        this.drawEnemy(enemy, pos.x, pos.y);
      }
      if (!enemy.alive && !this.removedEnemies.has(enemy.uid)) {
        this.removeEnemyView(enemy.uid);
      }
    });
  }

  removeEnemyView(uid: string): void {
    this.removedEnemies.add(uid);
    this.enemyZones.delete(uid);
    const body = this.bodyObjects.get(uid) ?? [];
    body.forEach((object) => {
      const transform = object as Phaser.GameObjects.GameObject & { y?: number };
      const startY = typeof transform.y === 'number' ? transform.y : undefined;
      this.tweens.add({
        targets: object,
        alpha: 0,
        scaleX: 0.55,
        scaleY: 0.55,
        y: typeof startY === 'number' ? startY + 48 : undefined,
        angle: 8,
        duration: 460,
        ease: 'Cubic.easeIn',
        onComplete: () => object.destroy()
      });
    });
    const objects = this.enemyObjects.get(uid) ?? [];
    objects
      .filter((object) => !body.includes(object))
      .forEach((object) => object.destroy());
    this.enemyObjects.delete(uid);
    this.bodyObjects.delete(uid);
    this.bars.delete(uid);
    this.hpTexts.get(uid)?.destroy();
    this.hpTexts.delete(uid);
    this.statusContainers.get(uid)?.destroy();
    this.statusContainers.delete(uid);
  }

  spawnPendingCombatLoot(): void {
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

  playCombatVisuals(): void {
    const events = this.combat.visualEvents.splice(0);
    let impactDelay = 0;
    events.forEach((event) => {
      if (event.type === 'windup') this.playWindupFlash(event.sourceUid);
      if (event.type === 'attack') {
        this.playAttackWindup(event);
        impactDelay = 310;
      }
      if (event.type === 'damage') {
        this.time.delayedCall(impactDelay, () => {
          this.floatNumber(event.targetUid, `-${event.amount}`, '#ff3b24');
          this.playHitImpact(event.targetUid);
        });
      }
      if (event.type === 'heal') this.time.delayedCall(impactDelay, () => this.floatNumber(event.targetUid, `+${event.amount}`, '#5cff83'));
      if (event.type === 'miss') this.time.delayedCall(impactDelay, () => this.floatNumber(event.targetUid, 'Промах', '#f2e7c6'));
    });
  }

  playAttackWindup(event: Extract<CombatVisualEvent, { type: 'attack' }>): void {
    this.playWindupFlash(event.sourceUid);
    this.time.delayedCall(250, () => this.playAttackMotion(event));
  }

  playWindupFlash(sourceUid: string): void {
    const pos = this.combatantPositions.get(sourceUid);
    const objects = this.bodyObjects.get(sourceUid);
    if (!pos || !objects?.length) return;
    const visual = objects.find((object) => !(object instanceof Phaser.GameObjects.Text));
    if (visual instanceof Phaser.GameObjects.Image) {
      const overlay = this.add.image(visual.x, visual.y, visual.texture.key, visual.frame.name)
        .setOrigin(visual.originX, visual.originY)
        .setDisplaySize(visual.displayWidth, visual.displayHeight)
        .setRotation(visual.rotation)
        .setFlip(visual.flipX, visual.flipY)
        .setTintFill(0xffffff)
        .setBlendMode(Phaser.BlendModes.NORMAL)
        .setAlpha(1)
        .setDepth(visual.depth + 120);
      this.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: 250,
        ease: 'Cubic.easeOut',
        onComplete: () => overlay.destroy()
      });
    } else {
      const silhouette = this.add.container(pos.x, pos.y - 50).setDepth(130);
      const body = this.add.rectangle(0, 28, 128, 172, 0xffffff, 1).setOrigin(0.5).setAngle(0);
      const head = this.add.ellipse(0, -78, 98, 108, 0xffffff, 1);
      silhouette.add([body, head]);
      this.tweens.add({
        targets: silhouette,
        alpha: 0,
        duration: 250,
        ease: 'Cubic.easeOut',
        onComplete: () => silhouette.destroy()
      });
    }
    objects.forEach((object) => {
      if (object instanceof Phaser.GameObjects.Text) return;
      const tintable = object as Phaser.GameObjects.GameObject & {
        setTintFill?: (color: number) => void;
        setTint?: (color: number) => void;
        clearTint?: () => void;
      };
      if (tintable.setTintFill) tintable.setTintFill(0xffffff);
      else tintable.setTint?.(0xffffff);
      this.time.delayedCall(250, () => tintable.clearTint?.());
    });
    const flash = this.add.ellipse(pos.x, pos.y - 20, 210, 270, 0xffffff, 0.68).setDepth(125);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 250,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy()
    });
  }

  playAttackMotion(event: Extract<CombatVisualEvent, { type: 'attack' }>): void {
    const source = this.combatantPositions.get(event.sourceUid);
    const target = this.combatantPositions.get(event.targetUid);
    const objects = this.bodyObjects.get(event.sourceUid);
    if (!source || !target || !objects?.length) return;
    const dx = Phaser.Math.Clamp((target.x - source.x) * 0.08, -34, 34);
    const dy = Phaser.Math.Clamp((target.y - source.y) * 0.05, -18, 18);
    this.tweens.add({
      targets: objects,
      x: `+=${dx}`,
      y: `+=${dy}`,
      duration: 85,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
  }

  floatNumber(targetUid: string, text: string, color: string): void {
    const pos = this.combatantPositions.get(targetUid);
    if (!pos) return;
    const label = this.add.text(
      pos.x + Phaser.Math.Between(-28, 28),
      pos.y - 70 + Phaser.Math.Between(-16, 16),
      text,
      { resolution: Math.min(window.devicePixelRatio || 1, 2), fontSize: '30px', color, stroke: '#000000', strokeThickness: 5, fontStyle: 'bold' }
    ).setOrigin(0.5).setDepth(1200);
    this.tweens.add({
      targets: label,
      y: label.y - 62,
      x: label.x + Phaser.Math.Between(-18, 18),
      alpha: 0,
      scale: 1.25,
      duration: 720,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy()
    });
  }

  playHitImpact(targetUid: string): void {
    const pos = this.combatantPositions.get(targetUid);
    const objects = this.bodyObjects.get(targetUid);
    if (!pos || !objects?.length) return;
    objects.forEach((object) => {
      const tintable = object as Phaser.GameObjects.GameObject & { setTint?: (color: number) => void; clearTint?: () => void };
      tintable.setTint?.(0xff2b20);
      this.time.delayedCall(105, () => tintable.clearTint?.());
    });
    this.tweens.add({
      targets: objects,
      x: '+=10',
      duration: 45,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut'
    });
    const flash = this.add.circle(pos.x, pos.y - 45, 72, 0xff1d16, 0.22).setDepth(85);
    this.tweens.add({ targets: flash, alpha: 0, scale: 1.35, duration: 180, onComplete: () => flash.destroy() });
    for (let i = 0; i < 12; i += 1) {
      const drop = this.add.circle(pos.x + Phaser.Math.Between(-24, 24), pos.y - 42 + Phaser.Math.Between(-24, 24), Phaser.Math.Between(3, 7), 0x8f0f0a, Phaser.Math.FloatBetween(0.65, 0.95)).setDepth(1000);
      this.tweens.add({
        targets: drop,
        x: drop.x + Phaser.Math.Between(-72, 72),
        y: drop.y + Phaser.Math.Between(-54, 38),
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(260, 520),
        ease: 'Cubic.easeOut',
        onComplete: () => drop.destroy()
      });
    }
  }

  refreshStatusBadges(): void {
    const targets = [this.combat.hero, ...this.combat.enemies.filter((enemy) => enemy.alive)];
    targets.forEach((target) => {
      const container = this.statusContainers.get(target.uid);
      if (!container) return;
      const compact = new Map<StatusId, { id: StatusId; label: string; stacks: number }>();
      target.statuses.forEach((status) => {
        const prev = compact.get(status.id);
        compact.set(status.id, { id: status.id, label: status.label, stacks: Math.max(status.stacks, prev?.stacks ?? 0) });
      });
      const signature = [...compact.values()].map((status) => `${status.id}:${status.stacks}`).join('|');
      if (this.statusSignatures.get(target.uid) === signature) return;
      this.statusSignatures.set(target.uid, signature);
      container.removeAll(true);
      [...compact.values()].slice(0, 5).forEach((status, index) => {
        const info = STATUS_INFO[status.id];
        const width = Phaser.Math.Clamp(74 + info.name.length * 8 + (status.stacks > 1 ? 30 : 0), 118, 184);
        const x = (index - Math.min(4, compact.size - 1) / 2) * 148;
        const bg = this.add.rectangle(x, 0, width, 30, 0x141414, 0.9).setStrokeStyle(1, 0xb44737, 0.9);
        const iconKey = `icon-status-${status.id}`;
        const icon = this.textures.exists(iconKey)
          ? this.add.image(x - width / 2 + 18, 0, iconKey).setDisplaySize(24, 24)
          : this.add.circle(x - width / 2 + 18, 0, 9, 0xb44737);
        const stackText = status.stacks > 1 ? ` ${status.stacks}` : '';
        const label = this.add.text(x - width / 2 + 36, 0, `${info.name}${stackText}`, {
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          fontSize: '12px',
          color: '#ffd0c6'
        }).setOrigin(0, 0.5);
        const hit = this.add.zone(x, 0, width, 30);
        this.ui.tooltip(
          hit.setInteractive({ useHandCursor: false }),
          info.name,
          [info.description, status.stacks > 1 ? `Стаков: ${status.stacks}` : undefined].filter(Boolean).join('\n')
        );
        container.add([bg, icon, label, hit]);
      });
    });
  }

  handleDrop(obj: Phaser.GameObjects.Container, zone: Phaser.GameObjects.Zone): void {
    const uid = obj.getData('itemUid') as string;
    const origin = obj.getData('origin') as string;
    const originBagIndex = obj.getData('bagIndex') as number | undefined;
    let item = GameState.removeItem(uid);
    if (!item) {
      const loot = this.lootItems.find((entry) => entry.getData('itemUid') === uid);
      if (loot) item = { uid, itemId: uid.split('-loot-')[0] };
    }
    if (!item) {
      this.renderStatic();
      return;
    }
    const def = itemFromInventory(item);
    let consumed = true;
    if (zone === this.heroZone) {
      this.ui.toast(useItemOnHero(def, this.combat.hero));
    } else if (this.bagSlotZones.includes(zone)) {
      consumed = this.placeItemInBagSlot(item, zone.getData('bagIndex') as number, origin, originBagIndex);
    } else if (zone === this.bagZone) {
      if (!GameState.placeInBag(item)) {
        this.ui.toast('Сумка перегружена или заполнена', '#ff8070');
        consumed = false;
      }
    } else if (this.equipZones.includes(zone)) {
      const previous = GameState.equipItem(item, zone.getData('slotIndex') as number);
      if (previous === item) {
        consumed = false;
      } else {
        if (previous) GameState.placeInBag(previous);
        this.combat.hero = this.combat.hero;
      }
    } else {
      const enemy = [...this.enemyZones.entries()].find(([, z]) => z === zone);
      if (enemy) {
        const target = this.combat.enemies.find((candidate) => candidate.uid === enemy[0]);
        if (target && target.alive) this.ui.toast(throwItemAtEnemy(def, target, this.combat.enemies, this.combat.hero, this.combat.remains));
      } else {
        consumed = GameState.placeInBag(item);
      }
    }
    if (!consumed) {
      if (origin !== 'loot') GameState.placeInBag(item);
      this.tweens.add({
        targets: obj,
        x: obj.getData('homeX') as number,
        y: obj.getData('homeY') as number,
        duration: 160,
        ease: 'Sine.easeOut'
      });
      return;
    }
    this.removeFieldLoot(uid);
    obj.destroy();
    SaveSystem.save();
    this.renderStatic();
  }

  placeItemInBagSlot(item: InventoryItem, targetIndex: number, origin: string, originBagIndex?: number): boolean {
    const run = GameState.requireRun();
    if (targetIndex < 0 || targetIndex >= run.bag.length) return false;
    const maxWeight = this.maxBagWeight();
    const currentWeight = GameState.currentWeight();
    const targetItem = run.bag[targetIndex];

    if (!targetItem) {
      if (currentWeight + ITEMS[item.itemId].weight > maxWeight) return false;
      run.bag[targetIndex] = item;
      return true;
    }

    if (origin === 'bag' && typeof originBagIndex === 'number' && originBagIndex >= 0 && originBagIndex < run.bag.length) {
      run.bag[targetIndex] = item;
      run.bag[originBagIndex] = targetItem;
      return true;
    }

    if (currentWeight - ITEMS[targetItem.itemId].weight + ITEMS[item.itemId].weight > maxWeight) return false;
    run.bag[targetIndex] = item;
    if (!GameState.placeInBag(targetItem)) {
      run.bag[targetIndex] = targetItem;
      return false;
    }
    return true;
  }

  maxBagWeight(): number {
    const run = GameState.requireRun();
    return SQUIRES[run.squireId].maxWeight + (GameState.state.meta.buildings.guild ?? 0) * 1.5;
  }

  removeFieldLoot(uid: string): void {
    this.fieldLoot = this.fieldLoot.filter((loot) => loot.item.uid !== uid);
    this.lootItems = this.lootItems.filter((loot) => loot.getData('itemUid') !== uid);
  }

  drawTopControls(): void {
    const screen = screenBounds(this);
    this.ui.button(screen.right - 260, screen.top + 36, 66, 46, 'Ⅱ', () => this.openPause());
    this.ui.button(screen.right - 184, screen.top + 36, 66, 46, '▶', () => this.time.timeScale = this.time.timeScale === 1 ? 1.7 : 1);
    this.ui.button(screen.right - 108, screen.top + 36, 66, 46, '»', () => this.time.timeScale = this.time.timeScale === 3 ? 1 : 3);
  }

  finishBattle(result: 'victory' | 'defeat'): void {
    this.ended = true;
    this.time.timeScale = 1;
    if (result === 'victory') {
      this.combat.applyRewards();
      const run = GameState.requireRun();
      const robertRepair = run.squireId === 'robert' ? run.bag.filter(Boolean).length * 3 : 0;
      run.hp = Math.min(run.maxHp, run.hp + robertRepair);
      const lines = [
        `Золото: +${this.combat.rewards.gold}`,
        `Опыт: +${this.combat.rewards.xp}`,
        `Предметы выпали на поле: ${this.combat.rewards.items.length}`,
        run.trainingPoints > 0 ? 'Герой получил очко обучения.' : ''
      ].filter(Boolean);
      this.victorySummary = lines;
      this.drawVictoryExit();
    } else {
      const reward = GameState.finishRun(false);
      SaveSystem.save();
      this.ui.modal('Поражение', [`Герой пал. Деревня получила: дерево ${reward.wood}, камень ${reward.stone}, чертежи ${reward.blueprints}.`], [
        { label: 'В меню', cb: () => this.scene.start('MainMenuScene') }
      ]);
    }
  }

  drawVictoryExit(): void {
    const screen = screenBounds(this);
    const title = this.nodeType === 'boss' ? 'Супербосс повержен' : 'Победа';
    const panelPos = screenToWorld(this, screen.centerX, screen.top + 108);
    const panel = this.add.container(panelPos.x, panelPos.y).setScale(screenSpaceScale(this)).setDepth(1800);
    const bg = this.add.rectangle(0, 0, 560, 86, 0x070807, 0.84).setStrokeStyle(2, 0xb7a25f);
    const heading = this.add.text(0, -26, title, { resolution: Math.min(window.devicePixelRatio || 1, 2), fontSize: '26px', color: '#ffdf83', align: 'center' }).setOrigin(0.5);
    const body = this.add.text(0, 15, this.victorySummary.join('   '), { resolution: Math.min(window.devicePixelRatio || 1, 2), fontSize: '18px', color: '#e5dcc2', align: 'center', wordWrap: { width: 520 } }).setOrigin(0.5);
    panel.add([bg, heading, body]);

    const arrowPos = screenToWorld(this, screen.right - 74, screen.centerY);
    const arrow = this.add.container(arrowPos.x, arrowPos.y).setScale(screenSpaceScale(this)).setDepth(1900);
    const button = this.add.circle(0, 0, 44, 0x151b16, 0.92).setStrokeStyle(3, 0xf2cf69);
    const icon = this.add.text(2, -2, '›', { resolution: Math.min(window.devicePixelRatio || 1, 2), fontSize: '72px', color: '#ffdf83', fontStyle: 'bold' }).setOrigin(0.5);
    arrow.add([button, icon]);
    button.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        button.setFillStyle(0x263021);
        arrow.setScale(1.08);
      })
      .on('pointerout', () => {
        button.setFillStyle(0x151b16);
        arrow.setScale(1);
      })
      .on('pointerdown', () => this.afterVictory());
    this.ui.tooltip(button, 'Покинуть бой', 'Можно сначала подобрать артефакты с поля. Нажмите стрелку, когда готовы вернуться на карту.');
    const arrowTweenX = screenToWorld(this, screen.right - 86, screen.centerY).x;
    this.tweens.add({ targets: arrow, x: arrowTweenX, yoyo: true, repeat: -1, duration: 820, ease: 'Sine.easeInOut' });

    this.ui.button(screen.right - 116, screen.centerY + 82, 170, 42, 'Подобрать всё', () => this.pickUpAllLoot());
  }

  pickUpAllLoot(): void {
    if (!this.fieldLoot.length) {
      this.ui.toast('Нет предметов');
      return;
    }
    const run = GameState.requireRun();
    const hero = HEROES[run.heroId];
    const remaining: FieldLoot[] = [];

    this.fieldLoot.forEach((loot) => {
      const definition = ITEMS[loot.item.itemId];
      const slotIndex = definition.slot
        ? hero.slots.findIndex((slot, index) => slot === definition.slot && run.equipment[index] === null)
        : -1;
      if (slotIndex >= 0) {
        GameState.equipItem(loot.item, slotIndex);
        return;
      }
      if (GameState.placeInBag(loot.item)) return;
      remaining.push(loot);
    });

    const movedCount = this.fieldLoot.length - remaining.length;
    this.fieldLoot = remaining;
    SaveSystem.save();
    this.renderStatic();
    if (remaining.length > 0) this.ui.toast('Нет места', '#ff8070');
    else if (movedCount > 0) this.ui.toast(`Подобрано: ${movedCount}`);
  }

  afterVictory(): void {
    if (this.nodeType === 'boss') {
      const reward = GameState.finishRun(true);
      SaveSystem.save();
      this.ui.modal('Победа забега', [`Суперсильный босс побеждён.`, `Деревня получила: дерево ${reward.wood}, камень ${reward.stone}, чертежи ${reward.blueprints}.`], [
        { label: 'В меню', cb: () => this.scene.start('MainMenuScene') }
      ]);
      return;
    }
    GameState.completeNode(this.nodeId);
    SaveSystem.save();
    this.scene.start('GlobalMapScene');
  }

  openPause(): void {
    this.ui.modal('Пауза', ['Бой можно продолжить или выйти в меню.'], [
      { label: 'Продолжить', cb: () => undefined },
      { label: 'Меню', cb: () => { SaveSystem.save(); this.scene.start('MainMenuScene'); } }
    ]);
  }
  */
}
