import Phaser from 'phaser';
import { Background } from '@/ui/components/Background';
import { Combatant, CombatSystem } from '@/services/CombatSystem';
import { TYPETOKEN } from '@/ui/styles/TypeTokens';
import { COLORTOKEN } from '@/ui/styles/ColorTokens';
import { anyToColor } from '@/utils/UtilsColor';
import { Heroes } from '@/data/Heroes';
import { GameState } from '@/store/GameState';

export class BattleSceneRenderer {
    private scene: Phaser.Scene;
    private background!: Background;
    private combatSystem: CombatSystem;

    private characterSlot = {
        Hero: {
            x: 450,
            y: 600,
        }
    }

    constructor(scene: Phaser.Scene, combatSystem: CombatSystem) {
        this.scene = scene;
        this.combatSystem = combatSystem;
    }

    public renderStatic(): void {
        this.scene.children.removeAll();
        this.scene.input.off('drop');
        this.scene.input.off('dragend');
        this.renderBackground();
        this.renderHero();
        /*
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
    */
    }
    private renderBackground(): void {
        this.background = new Background(this.scene, 'battle');
    }

    private renderHero(): void {
        const { x, y } = this.characterSlot.Hero;
        const hero = this.combatSystem.hero;

        this.renderHeroSprite(x, y);
        this.renderHPBar(hero, x, y, 248);


        /*
       this.heroZone = this.scene.add.zone(x, y - 70, 260, 360).setRectangleDropZone(260, 360);
       this.bodyObjects.set(hero.uid, [g, name]);
       this.combatantPositions.set(hero.uid, { x, y: y - 70 });
       this.statusContainers.set(hero.uid, this.scene.add.container(x, y - 292).setDepth(95));
     }
       */
    }

    private renderHeroSprite(x: number, y: number): void {
        const hero = Heroes[GameState.requireRun().heroId];
        const textureKey = hero.content?.spriteImage;

        if (textureKey && this.scene.textures.exists(textureKey)) {
            const width = hero.content?.spriteWidth ?? 390;
            const height = hero.content?.spriteHeight ?? 510;
            const spriteScale = hero.content?.spriteScale ?? 1;
            const offsetX = hero.content?.spriteOffsetX ?? 0;
            const offsetY = hero.content?.spriteOffsetY ?? -84;
            this.scene.add.image(x, y, textureKey)
                   .setDisplaySize(width * spriteScale, height * spriteScale)
                   .setX(x + offsetX)
                   .setY(y + offsetY)
                   .setDepth(10)
                   .setOrigin(0.5, 1);
        }
    }

    private renderHPBar(target: Combatant, x: number, y: number, width: number): Phaser.GameObjects.GameObject[] {
        const graphics = this.scene.add.graphics().setDepth(40);
        const GO: Phaser.GameObjects.GameObject[] = [graphics];
       
        /*
        const nameText = this.scene.add.text(x, y + 48, target.name, {
            ...TYPETOKEN.Tertiary.Lead, ...{
                stroke: '#000000',
                strokeThickness: 8,
            }
        }).setOrigin(0.5).setDepth(110).setLetterSpacing(2);
        
        GO.push(nameText);
        */

        graphics.setData('target', target);
        graphics.setData('x', x);
        graphics.setData('y', y);
        graphics.setData('w', width);

        const hpTextStroke = this.scene.add.text(x, y + 20, '', {
            ...TYPETOKEN.Primary.Tagline, ...{
                color: COLORTOKEN.Background.Zeroth,
                stroke: COLORTOKEN.Background.Zeroth,
                strokeThickness: 10,
            }
        }).setOrigin(0.5).setDepth(0);

        const hpText = this.scene.add.text(x, y + 20, '', {
            ...TYPETOKEN.Primary.Tagline, ...{
                color: COLORTOKEN.Background.Zeroth,
                stroke: COLORTOKEN.Accent.Red,
                strokeThickness: 4,
            }
        }).setOrigin(0.5).setDepth(75);


        //this.hpTexts.set(target.uid, hpText);
        GO.push(hpText);

        graphics.clear();
        graphics.fillStyle(anyToColor(COLORTOKEN.Background.Zeroth));
        graphics.fillRoundedRect(x - width / 2, y, width, 38, 8);

        hpTextStroke?.setText(`${Math.max(0, Math.ceil(target.hp))}/${target.maxHp}`);
        hpText?.setText(`${Math.max(0, Math.ceil(target.hp))}/${target.maxHp}`);

        graphics.fillStyle(anyToColor(COLORTOKEN.Accent.Red));
        graphics.fillRoundedRect(x - width / 2 + 4, y + 4, Math.max(0, (width - 8) * (target.hp / target.maxHp)), 30, 4);

        /*
        const hpText = this.hpTexts.get(target.uid);
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


*/
        return GO;
    }

    /*
const g = this.scene.add.graphics().setDepth(40);
const objects: Phaser.GameObjects.GameObject[] = [g];
g.setData('target', target);
g.setData('x', x);
g.setData('y', y);
g.setData('w', width);
this.bars.set(target.uid, g);

const hpText = this.scene.add.text(x + width / 2, y + 16, '', {
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  fontSize: '16px',
  color: '#ffe4cf',
  stroke: '#000',
  strokeThickness: 3,
}).setOrigin(0.5).setDepth(75);
this.hpTexts.set(target.uid, hpText);
objects.push(hpText);

if (target.faction) {
  const factionKey = `icon-faction-${target.faction}`;
  const factionIcon = this.scene.textures.exists(factionKey)
    ? this.scene.add.image(x + 30, y + 58, factionKey).setDisplaySize(46, 46).setDepth(76)
    : this.scene.add.circle(x + 30, y + 58, 19, 0x1b1515, 0.92).setStrokeStyle(2, 0xb44737).setDepth(76);
  objects.push(factionIcon);
  this.ui.tooltip(factionIcon.setInteractive({ useHandCursor: false }), 'Фракция', `Тип врага: ${target.faction}`);
}

target.abilities.forEach((ability, index) => {
  const cx = x - 24 + index * 42;
  const cy = y + 16;
  const zone = this.scene.add.circle(cx, cy, 18, 0x000000, 0.001).setDepth(70);
  zone.setInteractive({ useHandCursor: true });
  objects.push(zone);
  this.ui.tooltip(
    zone,
    ability.name,
    [
      ability.description,
      `Таймер: ${ability.cooldown} сек.`,
      'Когда круг заполняется, действие срабатывает автоматически и таймер сбрасывается.',
    ].join('\n')
  );
});
}
*/

}

/*
// BattleSceneRenderer.ts
import Phaser from 'phaser';
import { ENEMIES } from '../data/Enemies';
import { ITEMS } from '../data/items';
import { HEROES } from '../data/heroes';
import { SQUIRES } from '../data/squires';
import { CombatantState, InventoryItem } from '../entities/Types';
import { GameState } from '../state/GameState';
import { UIManager } from '../ui/UIManager';
import { screenBounds, screenSpaceScale, screenToWorld } from '../utils/layout';
import { EnemyContentDefinition, HeroContentDefinition, loadContentPack } from '../content/ContentSystem';
import { BattleEffects } from './BattleEffects';
import { STATUS_INFO, ENEMY_SLOTS } from './constants';
import { CombatSystem } from '../systems/CombatSystem';

export interface FieldLoot {
  item: InventoryItem;
  x: number;
  y: number;
}

/**
 * Класс отвечает за отрисовку всех визуальных элементов сцены боя.
 * Хранит ссылки на все созданные объекты, предоставляет методы для их обновления.
 */
/*
export class BattleSceneRenderer {
  private scene: Phaser.Scene;
  private combat: CombatSystem;
  private ui: UIManager;
  private effects: BattleEffects;

  // Карты и коллекции объектов
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
  public fieldLoot: FieldLoot[] = [];
  private bodyObjects = new Map<string, Phaser.GameObjects.GameObject[]>();
  private enemyObjects = new Map<string, Phaser.GameObjects.GameObject[]>();
  private enemyPositions = new Map<string, { x: number; y: number }>();
  private combatantPositions = new Map<string, { x: number; y: number }>();
  private removedEnemies = new Set<string>();
  private drawnEnemies = new Set<string>();
  public spawnedRewardItems = 0;
  private statusSignatures = new Map<string, string>();

  private battleBackgroundKey: string;

  constructor(
    scene: Phaser.Scene,
    combat: CombatSystem,
    ui: UIManager,
    effects: BattleEffects,
    backgroundKey: string
  ) {
    this.scene = scene;
    this.combat = combat;
    this.ui = ui;
    this.effects = effects;
    this.battleBackgroundKey = backgroundKey;
  }

  // ----- Полная перерисовка всей сцены -----
  public renderStatic(): void {
    this.scene.children.removeAll();
    this.scene.input.off('drop');
    this.scene.input.off('dragend');

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
  }

  // ----- Отрисовка героя -----
  private drawHero(): void {
    const hero = this.combat.hero;
    const x = 405;
    const y = 430;
    const g = this.createHeroVisual(x, y);
    const name = this.scene.add.text(x, y + 78, hero.name, {
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      fontSize: '24px',
      color: '#e8dfc5',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(110);
    this.bodyObjects.set(hero.uid, [g, name]);
    this.combatantPositions.set(hero.uid, { x, y: y - 70 });
    this.statusContainers.set(hero.uid, this.scene.add.container(x, y - 292).setDepth(95));
    this.heroZone = this.scene.add.zone(x, y - 70, 260, 360).setRectangleDropZone(260, 360);
    this.drawHpBar(hero, x - 170, y + 112, 285);
  }

  private createHeroVisual(x: number, y: number): Phaser.GameObjects.GameObject {
    const hero = HEROES[GameState.requireRun().heroId] as HeroContentDefinition;
    const key = `sprite-hero-${GameState.requireRun().heroId}`;
    if (this.scene.textures.exists(key)) {
      const width = hero.spriteWidth ?? (GameState.requireRun().heroId === 'beatrice' ? 305 : 285);
      const height = hero.spriteHeight ?? 360;
      const spriteScale = hero.spriteScale ?? 1;
      const offsetY = hero.spriteOffsetY ?? -84;
      return this.scene.add.image(x, y - 84, key)
        .setY(y + offsetY)
        .setDisplaySize(width * spriteScale, height * spriteScale)
        .setDepth(10);
    }
    const g = this.scene.add.graphics();
    g.fillStyle(HEROES[GameState.requireRun().heroId].portraitTint, 1);
    g.fillEllipse(x, y - 155, 92, 120);
    g.fillStyle(0x2d251f, 1);
    g.fillRoundedRect(x - 45, y - 105, 90, 160, 18);
    g.lineStyle(18, 0x5d2620, 1);
    g.lineBetween(x - 20, y - 118, x + 152, y - 210);
    g.setDepth(10);
    return g;
  }

  // ----- Отрисовка врагов -----
  private drawEnemies(): void {
    this.combat.enemies.forEach((enemy, index) => {
      const pos = ENEMY_SLOTS[index] ?? ENEMY_SLOTS[0];
      this.drawEnemy(enemy, pos.x, pos.y);
    });
  }

  private drawEnemy(enemy: CombatantState, x: number, y: number): void {
    if (!enemy.alive || this.drawnEnemies.has(enemy.uid)) return;
    const def = ENEMIES[enemy.definitionId];
    const g = this.createEnemyVisual(enemy, x, y, def.scale);
    const name = this.scene.add.text(x, y + 78, enemy.name, {
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      fontSize: '19px',
      color: '#e8dfc5',
      stroke: '#000000',
      strokeThickness: 4,
      wordWrap: { width: 230 },
      align: 'center',
    }).setOrigin(0.5).setDepth(110);
    const zone = this.scene.add.zone(x, y - 28, 250, 240).setRectangleDropZone(250, 240);
    this.enemyZones.set(enemy.uid, zone);
    const barObjects = this.drawHpBar(enemy, x - 95, y + 108, 210);
    this.enemyObjects.set(enemy.uid, [g, name, zone, ...barObjects]);
    this.bodyObjects.set(enemy.uid, [g, name]);
    this.enemyPositions.set(enemy.uid, { x, y });
    this.combatantPositions.set(enemy.uid, { x, y });
    this.statusContainers.set(enemy.uid, this.scene.add.container(x, y - 178).setDepth(95));
    this.drawnEnemies.add(enemy.uid);
  }

  private createEnemyVisual(enemy: CombatantState, x: number, y: number, scale: number): Phaser.GameObjects.GameObject {
    const key = `sprite-enemy-${enemy.definitionId}`;
    if (this.scene.textures.exists(key)) {
      const beast = enemy.faction === 'beast';
      const def = ENEMIES[enemy.definitionId] as EnemyContentDefinition;
      const width = def.spriteWidth ?? (beast ? 250 : 188) * scale;
      const height = def.spriteHeight ?? (beast ? 170 : 250) * scale;
      const spriteScale = def.spriteScale ?? 1;
      const offsetY = def.spriteOffsetY ?? (beast ? -18 : -62);
      return this.scene.add.image(x, y + (beast ? -18 : -62), key)
        .setY(y + offsetY)
        .setDisplaySize(width * spriteScale, height * spriteScale)
        .setDepth(10);
    }
    const def = ENEMIES[enemy.definitionId];
    const g = this.scene.add.graphics();
    g.fillStyle(def.tint, 0.95);
    g.fillRoundedRect(x - 54 * scale, y - 106 * scale, 108 * scale, 150 * scale, 18);
    g.fillEllipse(x, y - 130 * scale, 70 * scale, 72 * scale);
    g.setDepth(10);
    return g;
  }

  // ----- Полоски HP и способности -----
  private drawHpBar(target: CombatantState, x: number, y: number, width: number): Phaser.GameObjects.GameObject[] {
    const g = this.scene.add.graphics().setDepth(40);
    const objects: Phaser.GameObjects.GameObject[] = [g];
    g.setData('target', target);
    g.setData('x', x);
    g.setData('y', y);
    g.setData('w', width);
    this.bars.set(target.uid, g);

    const hpText = this.scene.add.text(x + width / 2, y + 16, '', {
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      fontSize: '16px',
      color: '#ffe4cf',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(75);
    this.hpTexts.set(target.uid, hpText);
    objects.push(hpText);

    if (target.faction) {
      const factionKey = `icon-faction-${target.faction}`;
      const factionIcon = this.scene.textures.exists(factionKey)
        ? this.scene.add.image(x + 30, y + 58, factionKey).setDisplaySize(46, 46).setDepth(76)
        : this.scene.add.circle(x + 30, y + 58, 19, 0x1b1515, 0.92).setStrokeStyle(2, 0xb44737).setDepth(76);
      objects.push(factionIcon);
      this.ui.tooltip(factionIcon.setInteractive({ useHandCursor: false }), 'Фракция', `Тип врага: ${target.faction}`);
    }

    target.abilities.forEach((ability, index) => {
      const cx = x - 24 + index * 42;
      const cy = y + 16;
      const zone = this.scene.add.circle(cx, cy, 18, 0x000000, 0.001).setDepth(70);
      zone.setInteractive({ useHandCursor: true });
      objects.push(zone);
      this.ui.tooltip(
        zone,
        ability.name,
        [
          ability.description,
          `Таймер: ${ability.cooldown} сек.`,
          'Когда круг заполняется, действие срабатывает автоматически и таймер сбрасывается.',
        ].join('\n')
      );
    });
    return objects;
  }

  public updateBars(): void {
    this.bars.forEach((bar) => this.updateOneBar(bar));
  }

  private updateOneBar(g: Phaser.GameObjects.Graphics): void {
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
  public updateStatusBadges(): void {
    const targets = [this.combat.hero, ...this.combat.enemies.filter((e) => e.alive)];
    targets.forEach((target) => {
      const container = this.statusContainers.get(target.uid);
      if (!container) return;
      const compact = new Map<string, { id: string; label: string; stacks: number }>();
      target.statuses.forEach((status) => {
        const prev = compact.get(status.id);
        compact.set(status.id, {
          id: status.id,
          label: status.label,
          stacks: Math.max(status.stacks, prev?.stacks ?? 0),
        });
      });
      const signature = [...compact.values()].map((s) => `${s.id}:${s.stacks}`).join('|');
      if (this.statusSignatures.get(target.uid) === signature) return;
      this.statusSignatures.set(target.uid, signature);
      container.removeAll(true);
      [...compact.values()].slice(0, 5).forEach((status, index) => {
        const info = STATUS_INFO[status.id as keyof typeof STATUS_INFO];
        const width = Phaser.Math.Clamp(74 + info.name.length * 8 + (status.stacks > 1 ? 30 : 0), 118, 184);
        const x = (index - Math.min(4, compact.size - 1) / 2) * 148;
        const bg = this.scene.add.rectangle(x, 0, width, 30, 0x141414, 0.9).setStrokeStyle(1, 0xb44737, 0.9);
        const iconKey = `icon-status-${status.id}`;
        const icon = this.scene.textures.exists(iconKey)
          ? this.scene.add.image(x - width / 2 + 18, 0, iconKey).setDisplaySize(24, 24)
          : this.scene.add.circle(x - width / 2 + 18, 0, 9, 0xb44737);
        const stackText = status.stacks > 1 ? ` ${status.stacks}` : '';
        const label = this.scene.add.text(x - width / 2 + 36, 0, `${info.name}${stackText}`, {
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          fontSize: '12px',
          color: '#ffd0c6',
        }).setOrigin(0, 0.5);
        const hit = this.scene.add.zone(x, 0, width, 30);
        this.ui.tooltip(
          hit.setInteractive({ useHandCursor: false }),
          info.name,
          [info.description, status.stacks > 1 ? `Стаков: ${status.stacks}` : undefined]
            .filter(Boolean)
            .join('\n')
        );
        container.add([bg, icon, label, hit]);
      });
    });
  }

  // ----- Синхронизация врагов (появление/исчезновение) -----
  public syncEnemyViews(): void {
    this.combat.enemies.forEach((enemy, index) => {
      if (enemy.alive && !this.drawnEnemies.has(enemy.uid)) {
        const pos = ENEMY_SLOTS[index] ?? ENEMY_SLOTS[ENEMY_SLOTS.length - 1];
        this.drawEnemy(enemy, pos.x, pos.y);
      }
      if (!enemy.alive && !this.removedEnemies.has(enemy.uid)) {
        this.removeEnemyView(enemy.uid);
      }
    });
  }

  private removeEnemyView(uid: string): void {
    this.removedEnemies.add(uid);
    this.enemyZones.delete(uid);
    const body = this.bodyObjects.get(uid) ?? [];
    body.forEach((object) => {
      const startY = (object as Phaser.GameObjects.GameObject & { y?: number }).y;
      this.scene.tweens.add({
        targets: object,
        alpha: 0,
        scaleX: 0.55,
        scaleY: 0.55,
        y: typeof startY === 'number' ? startY + 48 : undefined,
        angle: 8,
        duration: 460,
        ease: 'Cubic.easeIn',
        onComplete: () => object.destroy(),
      });
    });
    const objects = this.enemyObjects.get(uid) ?? [];
    objects
      .filter((obj) => !body.includes(obj))
      .forEach((obj) => obj.destroy());
    this.enemyObjects.delete(uid);
    this.bodyObjects.delete(uid);
    this.bars.delete(uid);
    this.hpTexts.get(uid)?.destroy();
    this.hpTexts.delete(uid);
    this.statusContainers.get(uid)?.destroy();
    this.statusContainers.delete(uid);
  }

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
  public drawVictoryExit(victorySummary: string[], nodeType: string, onPickUpAll: () => void, onContinue: () => void): void {
    const screen = screenBounds(this.scene);
    const title = nodeType === 'boss' ? 'Супербосс повержен' : 'Победа';
    const panelPos = screenToWorld(this.scene, screen.centerX, screen.top + 108);
    const panel = this.scene.add.container(panelPos.x, panelPos.y)
      .setScale(screenSpaceScale(this.scene))
      .setDepth(1800);
    const bg = this.scene.add.rectangle(0, 0, 560, 86, 0x070807, 0.84).setStrokeStyle(2, 0xb7a25f);
    const heading = this.scene.add.text(0, -26, title, {
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      fontSize: '26px',
      color: '#ffdf83',
      align: 'center',
    }).setOrigin(0.5);
    const body = this.scene.add.text(0, 15, victorySummary.join('   '), {
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      fontSize: '18px',
      color: '#e5dcc2',
      align: 'center',
      wordWrap: { width: 520 },
    }).setOrigin(0.5);
    panel.add([bg, heading, body]);

    // Стрелка для продолжения
    const arrowPos = screenToWorld(this.scene, screen.right - 74, screen.centerY);
    const arrow = this.scene.add.container(arrowPos.x, arrowPos.y)
      .setScale(screenSpaceScale(this.scene))
      .setDepth(1900);
    const button = this.scene.add.circle(0, 0, 44, 0x151b16, 0.92).setStrokeStyle(3, 0xf2cf69);
    const icon = this.scene.add.text(2, -2, '›', {
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      fontSize: '72px',
      color: '#ffdf83',
      fontStyle: 'bold',
    }).setOrigin(0.5);
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
      .on('pointerdown', () => onContinue());
    this.ui.tooltip(button, 'Покинуть бой', 'Можно сначала подобрать артефакты с поля. Нажмите стрелку, когда готовы вернуться на карту.');
    const arrowTweenX = screenToWorld(this.scene, screen.right - 86, screen.centerY).x;
    this.scene.tweens.add({
      targets: arrow,
      x: arrowTweenX,
      yoyo: true,
      repeat: -1,
      duration: 820,
      ease: 'Sine.easeInOut',
    });

    // Кнопка "Подобрать всё"
    this.ui.button(screen.right - 116, screen.centerY + 82, 170, 42, 'Подобрать всё', () => onPickUpAll());
  }

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

  public getCombatantPositions(): Map<string, { x: number; y: number }> {
    return this.combatantPositions;
  }

  public getBodyObjects(): Map<string, Phaser.GameObjects.GameObject[]> {
    return this.bodyObjects;
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