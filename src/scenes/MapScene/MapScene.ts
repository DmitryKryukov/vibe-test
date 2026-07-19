import Phaser from 'phaser';
import AudioManager from '@/services/AudioManager';
import { MapRenderer } from './MapRenderer';
import { CombatSystem } from '@/services/CombatSystem';


export class MapScene extends Phaser.Scene {
    private mapRender!: MapRenderer
    private combatSystem!: CombatSystem;
    public audio!: AudioManager;

    constructor() {
        super('MapScene');
        
    }
    create(): void {
        this.audio = this.plugins.get('AudioManager') as AudioManager;
        this.combatSystem = new CombatSystem(this, [], this.audio);
        this.mapRender = new MapRenderer(this, this.combatSystem);
        /*
    this.ui = new UIManager(this);
    SaveSystem.startAutosave(this);
    
    this.input.keyboard?.on('keydown-ESC', () => this.openPause());
    */
    }

}
/*
import { ITEMS } from '../data/items';
import { EncounterType, MapNodeState } from '../entities/Types';
import { GameState } from '../state/GameState';
import { SaveSystem } from '../state/SaveSystem';
import { UIManager } from '../ui/UIManager';
import { screenBounds } from '../utils/layout';

const NODE_COLORS: Record<EncounterType, number> = {
  start: 0x5b6f52,
  battle: 0x725034,
  elite: 0x8c2222,
  merchant: 0xb28a38,
  event: 0x7561a3,
  camp: 0x4f875f,
  boss: 0xc41f1f
};

const NODE_GLYPHS: Record<EncounterType, string> = {
  start: '◆',
  battle: '☠',
  elite: '☠',
  merchant: '●',
  event: '?',
  camp: '✚',
  boss: '♛'
};

export class GlobalMapScene extends Phaser.Scene {
  private ui!: UIManager;
  private readonly handleResize = (): void => this.render();


  

  render(): void {
    this.children.removeAll();
    this.ui.drawBackdrop('map');
    this.ui.drawHeroPanel();
    this.ui.drawBagPanel();
    this.drawMap();
    const screen = screenBounds(this);
    this.ui.button(screen.right - 148, screen.top + 42, 180, 46, 'Пауза', () => this.openPause());
    this.ui.drawHeroEmptySlotIconOverlay();
  }

  drawMap(): void {
    const run = GameState.requireRun();
    const startX = 245;
    const gapX = 178;
    const baseY = 255;
    const gapY = 162;
    const positions = new Map<string, { x: number; y: number }>();
    run.map.forEach((node) => {
      positions.set(node.id, { x: startX + node.column * gapX, y: baseY + node.row * gapY });
    });
    const g = this.add.graphics();
    run.map.forEach((node) => {
      const from = positions.get(node.id);
      if (!from || !node.revealed) return;
      node.links.forEach((id) => {
        const toNode = run.map.find((candidate) => candidate.id === id);
        const to = positions.get(id);
        if (!to || !toNode?.revealed) return;
        g.lineStyle(5, node.visited ? 0xd5c56c : 0x3b4038, node.visited ? 0.8 : 0.35);
        g.lineBetween(from.x, from.y, to.x, to.y);
      });
    });
    run.map.forEach((node) => {
      const pos = positions.get(node.id);
      if (!pos || !node.revealed) return;
      this.drawNode(node, pos.x, pos.y);
    });
  }

  drawNode(node: MapNodeState, x: number, y: number): void {
    const inaccessible = !node.available && !node.visited;
    const color = node.visited ? 0x394236 : inaccessible ? 0x555b58 : NODE_COLORS[node.type];
    const alpha = inaccessible ? 0.72 : 1;
    const stroke = node.available ? 0xf1d871 : inaccessible ? 0x7d8580 : 0x171817;
    const card = this.add.rectangle(x, y, 130, 130, color, alpha).setStrokeStyle(node.available ? 5 : 3, stroke);
    card.setAngle(Phaser.Math.Between(-3, 3));
    const glyphColor = inaccessible ? '#a7afaa' : node.type === 'start' ? '#e9e2c5' : '#ff2d1f';
    const glyph = this.add.text(x, y - 4, NODE_GLYPHS[node.type], { resolution: Math.min(window.devicePixelRatio || 1, 2), fontSize: node.type === 'boss' ? '58px' : '52px', color: glyphColor, stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
    const label = this.add.text(x, y + 52, this.labelFor(node.type), { resolution: Math.min(window.devicePixelRatio || 1, 2), fontSize: '15px', color: inaccessible ? '#c6ccc7' : '#efe6bf' }).setOrigin(0.5);
    this.ui.tooltip(card, this.labelFor(node.type), this.tooltipFor(node));
    if (node.available) {
      card.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.enterNode(node));
      this.tweens.add({ targets: [card, glyph], scale: 1.06, yoyo: true, repeat: -1, duration: 900 });
    }
    if (node.visited) label.setText('пройдено');
  }

  enterNode(node: MapNodeState): void {
    if (node.type === 'battle' || node.type === 'elite' || node.type === 'boss') {
      const enemies = GameState.getEncounterEnemies(node.type);
      this.scene.start('BattleScene', { nodeId: node.id, nodeType: node.type, enemyIds: enemies });
      return;
    }
    if (node.type === 'merchant') this.openMerchant(node.id);
    if (node.type === 'camp') this.openCamp(node.id);
    if (node.type === 'event') this.openEvent(node.id);
  }

  openMerchant(nodeId: string): void {
    const run = GameState.requireRun();
    const stock = Phaser.Utils.Array.Shuffle(Object.keys(ITEMS)).slice(0, 3);
    this.ui.modal('Бродячий торговец', stock.map((id, index) => `${index + 1}. ${ITEMS[id].name} — ${this.priceFor(ITEMS[id].rarity)} золота`), [
      {
        label: 'Купить',
        cb: () => {
          const itemId = stock[0];
          const price = this.priceFor(ITEMS[itemId].rarity);
          if (run.gold >= price && GameState.addItemToBag(itemId)) {
            run.gold -= price;
            GameState.completeNode(nodeId);
            SaveSystem.save();
            this.render();
          } else {
            this.ui.toast('Не хватает золота, места или грузоподъёмности', '#ff8070');
          }
        }
      },
      { label: 'Продать', cb: () => {
        const item = run.bag.find(Boolean);
        if (item) {
          GameState.removeItem(item.uid);
          run.gold += 22;
        }
        GameState.completeNode(nodeId);
        SaveSystem.save();
        this.render();
      } },
      { label: 'Уйти', cb: () => { GameState.completeNode(nodeId); SaveSystem.save(); this.render(); } }
    ]);
  }

  openCamp(nodeId: string): void {
    const run = GameState.requireRun();
    const hasTorch = run.bag.some((item) => item?.itemId === 'old_torch');
    const robert = run.squireId === 'robert';
    const healFactor = 0.35 * (hasTorch ? 1.1 : 1) * (robert ? 1.15 : 1);
    const goldBonus = run.squireId === 'clavridius' ? Math.ceil(run.gold * 0.1) : 0;
    this.ui.modal('Лагерь', [`Герой восстановит ${Math.ceil(run.maxHp * healFactor)} HP.`, goldBonus ? `Клавридий найдёт ${goldBonus} золота.` : 'Костёр чадит, но держит ночь на расстоянии.'], [
      { label: 'Отдохнуть', cb: () => {
        run.hp = Math.min(run.maxHp, run.hp + run.maxHp * healFactor);
        run.gold += goldBonus;
        GameState.completeNode(nodeId);
        SaveSystem.save();
        this.render();
      } }
    ]);
  }

  openEvent(nodeId: string): void {
    const run = GameState.requireRun();
    const hasMask = run.bag.some((item) => item?.itemId === 'blind_judge_mask');
    const hasHood = run.bag.some((item) => item?.itemId === 'herbalist_hood');
    this.ui.modal('Текстовое событие', [hasMask ? 'Маска подсвечивает безопасный ответ.' : 'У дороги стоит покосившийся обелиск с чужими именами.', 'Выберите цену за продвижение.'], [
      { label: 'Жертва', cb: () => {
        if (run.gold >= 25) {
          run.gold -= 25;
          run.maxHp += 8;
          run.hp += 8;
          this.ui.toast('Герой стал крепче');
        }
        GameState.completeNode(nodeId);
        SaveSystem.save();
        this.render();
      } },
      { label: 'Обыск', cb: () => {
        const gain = Math.ceil(30 * (hasHood ? 1.2 : 1));
        run.gold += gain;
        if (!hasMask) run.hp = Math.max(1, run.hp - 9);
        GameState.completeNode(nodeId);
        SaveSystem.save();
        this.render();
      } }
    ]);
  }

  openPause(): void {
    this.ui.modal('Пауза', ['Прогресс автоматически сохраняется.'], [
      { label: 'Продолжить', cb: () => undefined },
      { label: 'Меню', cb: () => { SaveSystem.save(); this.scene.start('MainMenuScene'); } }
    ]);
  }

  labelFor(type: EncounterType): string {
    return ({ start: 'Старт', battle: 'Бой', elite: 'Элита', merchant: 'Торговец', event: 'Событие', camp: 'Лагерь', boss: 'Супербосс' })[type];
  }

  tooltipFor(node: MapNodeState): string {
    const run = GameState.requireRun();
    const radar = run.bag.some((item) => item?.itemId === 'watcher_eye');
    if ((node.type === 'battle' || node.type === 'elite') && radar) return 'Око Соглядатая раскрывает состав врагов перед входом.';
    return node.available ? 'Нажмите, чтобы перейти к узлу.' : 'Недоступный путь.';
  }

  priceFor(rarity: string): number {
    return { common: 35, uncommon: 55, rare: 82, legendary: 130 }[rarity] ?? 40;
  }
}
*/