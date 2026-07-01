import Phaser from 'phaser';
import { Background } from '@/ui/components/Background';
import { Combatant, CombatSystem } from '@/services/CombatSystem';
import { GameState } from '@/store/GameState';
import { Heroes } from '@/data/Heroes';

import { SquirePanel } from '@/ui/components/SquirePanel';
import { HeroPanel } from '@/ui/components/HeroPanel';

import { TYPETOKEN } from '@/ui/styles/TypeTokens';
import { COLORTOKEN } from '@/ui/styles/ColorTokens';
import { anyToColor } from '@/utils/UtilsColor';
import { Enemies, EnemyScheme } from '@/data/Enemies';
import { screenBounds, screenToWorld, screenSpaceScale } from '@/utils/UtilsLayout';
import { getEnemySlots, getHeroSlots } from './BattleLayout';

const StatusInfo: Record<string, { name: string; description: string }> = {
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

export class BattleSceneRenderer {
  private scene: Phaser.Scene;
  private background!: Background;
  private combatSystem: CombatSystem;
  private heroPanel!: HeroPanel;
  private squirePanel!: SquirePanel;

  private heroZone!: Phaser.GameObjects.Zone;
  private enemyZones = new Map<string, Phaser.GameObjects.Zone>();

  private hpBarCollection = new Map<string, Phaser.GameObjects.Graphics>();
  private hpTextCollection = new Map<string, Phaser.GameObjects.Text>();
  private statusContainers = new Map<string, Phaser.GameObjects.Container>();
  private statusSignatures = new Map<string, string>();

  private heroObjects = new Map<string, Phaser.GameObjects.GameObject[]>();
  private enemiesCollection = new Set<string>();
  private enemiesObjects = new Map<string, Phaser.GameObjects.GameObject[]>();
  private removedEnemies = new Set<string>();

  private combatantPositions = new Map<string, { x: number; y: number }>();
  private spriteObjects = new Map<string, Phaser.GameObjects.GameObject[]>;

  constructor(scene: Phaser.Scene, combatSystem: CombatSystem) {
    this.scene = scene;
    this.combatSystem = combatSystem;
  }

  public renderStatic(): void {
    this.scene.children.removeAll();
    this.scene.input.off('drop');
    this.scene.input.off('dragend');

    this.hpBarCollection.clear();
    this.hpTextCollection.clear();
    this.statusContainers.clear();
    this.statusSignatures.clear();

    this.heroObjects.clear();
    this.enemiesCollection.clear();
    this.enemiesObjects.clear();
    this.enemyZones.clear();
    this.removedEnemies.clear();

    this.combatantPositions.clear();
    this.spriteObjects.clear();

    this.renderBackground();
    this.renderSquirePanel();
    this.renderHeroPanel();
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

  private renderHeroPanel(): void {
    this.heroPanel = new HeroPanel(this.scene);
  }

  private renderSquirePanel(): void {
    this.squirePanel = new SquirePanel(this.scene);
  }

  private renderHero(): void {
    const { x, y } = getHeroSlots();
    const hero = this.combatSystem.hero;

    const graphics = this.renderHeroSprite(x, y);
    const hpBar = this.renderHPBar("hero", hero, x, y, 248);

    const Data = [graphics, ...hpBar];
    this.heroObjects.set(hero.id, Data);
    this.statusContainers.set(hero.id, this.scene.add.container(x, y - 292).setDepth(95));
  }

  private renderHeroSprite(x: number, y: number): Phaser.GameObjects.GameObject {
    const hero = Heroes[GameState.requireRun().heroId];
    const textureKey = hero.content?.spriteImage;

    const width = hero.content?.spriteWidth ?? 390;
    const height = hero.content?.spriteHeight ?? 510;
    const spriteScale = hero.content?.spriteScale ?? 1;
    const offsetX = hero.content?.spriteOffsetX ?? 0;
    const offsetY = hero.content?.spriteOffsetY ?? -84;
    const sprite = this.scene.add.image(x, y, textureKey ?? "__White")
      .setDisplaySize(width * spriteScale, height * spriteScale)
      .setX(x + offsetX)
      .setY(y + offsetY)
      .setDepth(10)
      .setOrigin(0.5, 1);
    this.heroZone = this.scene.add.zone(x + offsetX, y + offsetY, width, height).setRectangleDropZone(width, height);

    this.combatantPositions.set(hero.id, { x: x + offsetX, y: y - height / 2 + offsetY });
    this.spriteObjects.set(hero.id, [sprite]);
    return sprite as Phaser.GameObjects.GameObject;
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
    if (!enemy.alive || this.enemiesCollection.has(enemy.id)) return;
    const enemyDefinition = Enemies[enemy.definitionId];

    const graphics = this.renderEnemySprite(enemy, x, y);

    this.enemiesCollection.add(enemy.id);

    const enemyHpBar = this.renderHPBar("enemy", enemy, x, y + enemyDefinition.content.spriteHeight / 2 - 20, 162);

    let currentData = this.enemiesObjects.get(enemy.id);
    if (currentData) {
      let updatedData = [...currentData, graphics, ...enemyHpBar];
      this.enemiesObjects.set(enemy.id, updatedData);
    }
    this.statusContainers.set(enemy.id, this.scene.add.container(x, y - 178).setDepth(95));
    /*
    this.enemyPositions.set(enemy.uid, { x, y });
    */
  }

  private renderEnemySprite(enemy: Combatant, x: number, y: number): Phaser.GameObjects.GameObject {
    const enemyObj = Enemies[enemy.definitionId];
    let textureKey = enemyObj.content?.spriteImage;

    if (!textureKey || !this.scene.textures.exists(textureKey)) {
      textureKey = 'default_texture_key';
    }

    const width = enemyObj.content?.spriteWidth ?? 390;
    const height = enemyObj.content?.spriteHeight ?? 390;
    const spriteScale = enemyObj.content?.spriteScale ?? 1;
    const offsetX = enemyObj.content?.spriteOffsetX ?? 0;
    const offsetY = enemyObj.content?.spriteOffsetY ?? -84;

    const sprite = this.scene.add.image(0, 0, textureKey);

    sprite.setDisplaySize(width * spriteScale, height * spriteScale)
      .setX(x + offsetX)
      .setY(y + offsetY - height / 2)
      .setDepth(10)
      .setOrigin(0.5, 0.5);

    const zone = this.scene.add.zone(x + offsetX, y + offsetY - height / 2, width, height)
      .setRectangleDropZone(width, height);

    this.enemyZones.set(enemy.id, zone);
    this.enemiesObjects.set(enemy.id, [zone]);

    this.combatantPositions.set(enemy.id, { x: x + offsetX, y: y + offsetY - height / 2 });
    this.spriteObjects.set(enemy.id, [sprite]);

    return sprite;
  }

  private renderCombatantSprite(
  combatant: Combatant,
  definition: { content: any }, // или интерфейс
  x: number,
  y: number,
  isHero: boolean = false
): { sprite: Phaser.GameObjects.Image; zone: Phaser.GameObjects.Zone } {
  const { spriteImage, spriteWidth, spriteHeight, spriteScale, spriteOffsetX, spriteOffsetY } = definition.content;
  const textureKey = spriteImage ?? '__White';
  
  const sprite = this.scene.add.image(0, 0, textureKey)
    .setDisplaySize(spriteWidth * spriteScale, spriteHeight * spriteScale)
    .setPosition(x + spriteOffsetX, y + spriteOffsetY - (isHero ? 0 : spriteHeight / 2))
    .setDepth(10)
    .setOrigin(0.5, isHero ? 1 : 0.5);

  const zone = this.scene.add.zone(sprite.x, sprite.y, spriteWidth, spriteHeight)
    .setRectangleDropZone(spriteWidth, spriteHeight);

  this.combatantPositions.set(combatant.id, { x: sprite.x, y: sprite.y });
  this.spriteObjects.set(combatant.id, [sprite]);

  return { sprite, zone };
}


  private renderHPBar(type: "hero" | "enemy", target: Combatant, x: number, y: number, width: number): Phaser.GameObjects.GameObject[] {
    const graphics = this.scene.add.graphics().setDepth(40);
    const GO: Phaser.GameObjects.GameObject[] = [graphics];
    const height: number = type === "hero" ? 38 : 20;
    const cornerRadius: number = type === "hero" ? 8 : 4;

    graphics.setData('target', target);
    graphics.setData('type', type);
    graphics.setData('x', x);
    graphics.setData('y', y);
    graphics.setData('width', width);
    graphics.setData('height', height);
    graphics.setData('cornerRadius', cornerRadius);
    this.hpBarCollection.set(target.id, graphics);

    graphics.clear();
    graphics.fillStyle(anyToColor(COLORTOKEN.Background.Zeroth));
    graphics.fillRoundedRect(x - width / 2, y, width, height, cornerRadius);

    if (type == "hero") {
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

      graphics.setData('hpTextStroke', hpTextStroke);
      graphics.setData('hpText', hpText);

      GO.push(hpTextStroke);
      GO.push(hpText);

      hpTextStroke?.setText(`${Math.max(0, Math.ceil(target.stats.hp))}/${target.stats.maxHp}`);
      hpText?.setText(`${Math.max(0, Math.ceil(target.stats.hp))}/${target.stats.maxHp}`);
    }
    graphics.fillStyle(anyToColor(COLORTOKEN.Accent.Red));
    graphics.fillRoundedRect(x - width / 2 + 4, y + 4, Math.max(0, (width - 8) * (target.stats.hp / target.stats.maxHp)), height - 8, Math.min((width - 8) * (target.stats.hp / target.stats.maxHp), cornerRadius - 4));

    if (type == "enemy") {
      const factionIconKey = `icon-faction-${target.faction}`;
      const factionIcon = this.scene.textures.exists(factionIconKey)
        ? this.scene.add.image(x - 5 - width / 2, y + 40, factionIconKey).setDisplaySize(40, 40).setOrigin(0, 0.5).setDepth(500)
        : this.scene.add.circle(x - width / 2, y + 40, 15, anyToColor(COLORTOKEN.Background.Zeroth)).setStrokeStyle(2, anyToColor(COLORTOKEN.Accent.Red)).setOrigin(0, 0.5);

      GO.push(factionIcon);

      //this.ui.tooltip(factionIcon.setInteractive({ useHandCursor: false }), 'Фракция', `Тип врага: ${target.faction}`);
    }

    this.updateBar(graphics)

    target.basicAttacks.forEach((attack, index) => {
      const attackIconScheme = type === "hero"
        ? {
          posX: x - width / 2 - 4 - index * 45,
          posY: y - 2,
          radius: 21,
        }
        : {
          posX: x - width / 2 - 4 - index * 28,
          posY: y - 3,
          radius: 13,
        }
      const zone = this.scene.add.circle(attackIconScheme.posX, attackIconScheme.posY, attackIconScheme.radius, anyToColor(COLORTOKEN.Background.Zeroth));
      zone.setOrigin(1, 0);
      zone.setInteractive({ useHandCursor: true });
      /*
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
  return objects;*/
      GO.push(zone);
    })

    return GO;
  }

  private updateBar(bar: Phaser.GameObjects.Graphics) {
    const target = bar.getData('target') as Combatant;
    const x = bar.getData('x') as number;
    const y = bar.getData('y') as number;
    const width = bar.getData('width') as number;
    const height = bar.getData('height') as number;
    const cornerRadius = bar.getData('cornerRadius');
    const hpTextStroke = bar.getData('hpTextStroke');
    const hpText = bar.getData('hpText');
    const type = bar.getData('type');

    bar.clear();
    bar.fillStyle(anyToColor(COLORTOKEN.Background.Zeroth));
    bar.fillRoundedRect(x - width / 2, y, width, height, cornerRadius);
    if (hpText && hpTextStroke) {
      hpTextStroke.setText(`${Math.max(0, Math.ceil(target.stats.hp))}/${target.stats.maxHp}`);
      hpText.setText(`${Math.max(0, Math.ceil(target.stats.hp))}/${target.stats.maxHp}`);
    }

    bar.fillStyle(anyToColor(COLORTOKEN.Accent.Red));
    bar.fillRoundedRect(x - width / 2 + 4, y + 4, Math.max(0, (width - 8) * (target.stats.hp / target.stats.maxHp)), height - 8, Math.min((width - 8) * (target.stats.hp / target.stats.maxHp), cornerRadius - 4));

    target.basicAttacks.forEach((attack, index) => {
      const attackIconScheme = type === "hero"
        ? {
          posX: x - width / 2 - 4 - index * 45,
          posY: y - 2,
          radius: 21,
          radiusOffset: 4,
        }
        : {
          posX: x - width / 2 - 4 - index * 28,
          posY: y - 3,
          radius: 13,
          radiusOffset: 3,
        }

      bar.fillStyle(0x090909, 0.95);
      bar.fillCircle(attackIconScheme.posX - attackIconScheme.radius, attackIconScheme.posY + attackIconScheme.radius, attackIconScheme.radius);
      bar.slice(attackIconScheme.posX - attackIconScheme.radius, attackIconScheme.posY + attackIconScheme.radius, attackIconScheme.radius - attackIconScheme.radiusOffset, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + 360 * Math.min(1, attack.progress / attack.cooldown)), false);
      bar.fillStyle(anyToColor(COLORTOKEN.Accent.Red));
      bar.fillPath();

    })
  }

  public updateBars(): void {
    this.hpBarCollection.forEach((bar) => this.updateBar(bar));
  }

  public getCombatantPositions(): Map<string, { x: number; y: number }> {
    return this.combatantPositions;
  }

  public getSpriteObjects(): Map<string, Phaser.GameObjects.GameObject[]> {
    return this.spriteObjects;
  }
  public syncHeroViews(): void {
    const hero = this.combatSystem.hero;
    if (!hero.alive) {
      this.removeHero(hero.id);
    }
    /*
  if (enemy.alive && !this.drawnEnemies.has(enemy.uid)) {
    const pos = ENEMY_SLOTS[index] ?? ENEMY_SLOTS[ENEMY_SLOTS.length - 1];
    this.drawEnemy(enemy, pos.x, pos.y);
  }
    */
  };

  public syncEnemyViews(): void {
    this.combatSystem.enemies.forEach((enemy, index) => {
      if (!enemy.alive && !this.removedEnemies.has(enemy.id)) {
        this.removeEnemy(enemy.id);
      }
      /*
    if (enemy.alive && !this.drawnEnemies.has(enemy.uid)) {
      const pos = ENEMY_SLOTS[index] ?? ENEMY_SLOTS[ENEMY_SLOTS.length - 1];
      this.drawEnemy(enemy, pos.x, pos.y);
    }
      */
    });

  }
  private removeHero(id: string): void {
    const sprites = this.spriteObjects.get(id) ?? [];
    sprites.forEach((sprite) => {
      const position = (sprite as Phaser.GameObjects.GameObject & { x: number, y: number });
      this.scene.tweens.add({
        targets: sprite,
        alpha: 0,
        x: position.x - 50,
        y: position.y,
        duration: 460,
        ease: 'Quint.easeOut',
        onComplete: () => sprite.destroy(),
      });

      const objects = this.heroObjects.get(id) ?? [];
      objects
        .filter((obj) => !sprites.includes(obj))
        .forEach((obj) => obj.destroy());
      this.enemiesObjects.delete(id);
      this.spriteObjects.delete(id);
      this.hpBarCollection.delete(id);
      this.statusContainers.get(id)?.destroy();
      this.statusContainers.delete(id);
    })
  }

  private removeEnemy(id: string): void {
    this.removedEnemies.add(id);
    this.enemyZones.delete(id);
    const sprites = this.spriteObjects.get(id) ?? [];

    sprites.forEach((sprite) => {
      const position = (sprite as Phaser.GameObjects.GameObject & { x?: number, y?: number });
      this.scene.tweens.add({
        targets: sprite,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        x: position.x,
        y: position.y,
        duration: 460,
        ease: 'Quint.easeOut',
        onComplete: () => sprite.destroy(),
      });
    });
    const objects = this.enemiesObjects.get(id) ?? [];
    objects
      .filter((obj) => !sprites.includes(obj))
      .forEach((obj) => obj.destroy());
    this.enemiesObjects.delete(id);
    this.spriteObjects.delete(id);
    this.hpBarCollection.delete(id);
    this.statusContainers.get(id)?.destroy();
    this.statusContainers.delete(id);

  }

  public updateStatusBadges(): void {
    const targets = [this.combatSystem.hero, ...this.combatSystem.enemies.filter((enemy) => enemy.alive)];
    targets.forEach((target) => {
      const container = this.statusContainers.get(target.id);
      const compact = new Map<string, { id: string; label: string; stacks: number }>();
      if (!container) return;

      target.statuses.forEach((status) => {
        const prev = compact.get(status.id);
        compact.set(status.id, {
          id: status.id,
          label: status.label,
          stacks: Math.max(status.stacks, prev?.stacks ?? 0),
        });
      });

      const signature = [...compact.values()].map((s) => `${s.id}:${s.stacks}`).join('|');
      if (this.statusSignatures.get(target.id) === signature) return;

      container.removeAll(true);
      [...compact.values()].slice(0, 5).forEach((status, index) => {
        const info = StatusInfo[status.id as keyof typeof StatusInfo];
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
        /*
        this.ui.tooltip(
          hit.setInteractive({ useHandCursor: false }),
          info.name,
          [info.description, status.stacks > 1 ? `Стаков: ${status.stacks}` : undefined]
            .filter(Boolean)
            .join('\n')
        );
        */
        container.add([bg, icon, label, hit]);
      });
    })
  }


  //public drawVictoryExit(victorySummary: string[], nodeType: string, onPickUpAll: () => void, onContinue: () => void): void {

  public renderVictoryPanel(): void {
    const screen = screenBounds(this.scene);

    const dimmer = this.scene.add.rectangle(0, 0, screen.width, screen.height, anyToColor(COLORTOKEN.Background.Zeroth), 0.62).setOrigin(0).setDepth(5000);

    const title = 'Выпало в бою';
    const panelSize = {
      width: 640,
      height: screen.height - 64
    };
    const panelPosition = screenToWorld(this.scene, screen.centerX, screen.centerY);

    const panel = this.scene.add.container(panelPosition.x, panelPosition.y)
      .setScale(screenSpaceScale(this.scene))
      .setDepth(8000);

    const background = this.scene.add.rectangle(0, 0, panelSize.width, panelSize.height, anyToColor(COLORTOKEN.Background.Zeroth), 0.9).setStrokeStyle(2, anyToColor(COLORTOKEN.Foreground.Tertiary));
    const heading = this.scene.add.text(0, -panelSize.height / 2 + 30, title, { ...TYPETOKEN.Secondary.Tagline, color: COLORTOKEN.Foreground.Secondary }).setOrigin(0.5);
    panel.add([background, heading]);
    /*
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
    const body = this.scene.add.text(0, 15, victorySummary.join('   '), {
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      fontSize: '18px',
      color: '#e5dcc2',
      align: 'center',
      wordWrap: { width: 520 },
    }).setOrigin(0.5);
 
    // Стрелка для продолжения
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
    */

  }

  public renderDefeatPanel(): void {
    const screen = screenBounds(this.scene);

    const dimmer = this.scene.add.rectangle(0, 0, screen.width, screen.height, anyToColor(COLORTOKEN.Background.Zeroth), 0.62).setOrigin(0).setDepth(5000);

    const title = 'Поражение';
    const panelSize = {
      width: 640,
      height: screen.height - 64
    };
    const panelPosition = screenToWorld(this.scene, screen.centerX, screen.centerY);

    const panel = this.scene.add.container(panelPosition.x, panelPosition.y)
      .setScale(screenSpaceScale(this.scene))
      .setDepth(8000);

    const background = this.scene.add.rectangle(0, 0, panelSize.width, panelSize.height, anyToColor(COLORTOKEN.Background.Zeroth), 0.9).setStrokeStyle(2, anyToColor(COLORTOKEN.Foreground.Tertiary));
    const heading = this.scene.add.text(0, -panelSize.height / 2 + 30, title, { ...TYPETOKEN.Secondary.Tagline, color: COLORTOKEN.Foreground.Secondary }).setOrigin(0.5);
    panel.add([background, heading]);
    /*
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
    const body = this.scene.add.text(0, 15, victorySummary.join('   '), {
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      fontSize: '18px',
      color: '#e5dcc2',
      align: 'center',
      wordWrap: { width: 520 },
    }).setOrigin(0.5);
 
    // Стрелка для продолжения
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
    */
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