import Phaser from 'phaser';
import { Heroes } from '@/data/Heroes';
import { Squires } from '@/data/Squires';
import { GameState } from '@/store/GameState';
import { BattleSceneRenderer } from './BattleSceneRenderer';
import { CombatSystem } from '@/services/CombatSystem';
import { EncounterPool } from '@/data/Enemies';
import { BattleEffects } from './BatteEffects';
import AudioManager from '@/services/AudioManager';
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

export class BattleScene extends Phaser.Scene {
  private nodeId = '';
  private sceneRenderer!: BattleSceneRenderer;
  private battleEffects!: BattleEffects;
  private combatSystem!: CombatSystem;
  private ended = false;
  public audio!: AudioManager;

  constructor() {
    super('BattleScene');
  }

  init(data: BattleData): void {
    this.nodeId = data.nodeId;
  }

  create(): void {
    this.audio = this.plugins.get('AudioManager') as AudioManager;
    this.combatSystem = new CombatSystem(this, EncounterPool.battle.encounter1, this.audio);
    this.audio.playMusic('sfx-strike-ability');

    //this.scale.off('resize', this.handleResize);
    //this.scale.on('resize', this.handleResize);
    //this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', this.handleResize));

    this.sceneRenderer = new BattleSceneRenderer(this, this.combatSystem);
    this.battleEffects = new BattleEffects(this, this.combatSystem, this.sceneRenderer);
    this.sceneRenderer.renderStatic();
    this.audio.stopMusic();
    this.time.delayedCall(45, () => {
      this.audio.setMusicVolume(1);
      this.audio.playMusic('music-battle-1', true);
    })
  }

  update(_: number, delta: number): void {
    if (this.ended) return;
    this.combatSystem.update(delta);
    this.battleEffects.processVisualEvents();
    this.sceneRenderer.syncCombatantViews();
    if (this.combatSystem.ended) {
      this.time.delayedCall(0, () => this.finishBattle(this.combatSystem.ended));
    }
    /*

    this.renderer.spawnPendingCombatLoot();
    if (this.combat.ended && !this.finishQueued) {
      this.finishQueued = true;
      this.time.delayedCall(950, () => this.finishBattle(this.combat.ended));
    }
      */
  }
  private finishBattle(result: 'victory' | 'defeat' | null): void {
    this.ended = true;
    this.time.timeScale = 1;
    if (result === 'victory') {
      //this.combat.applyRewards();
      const run = GameState.requireRun();
      //const robertRepair = run.squireId === 'robert' ? run.bag.filter(Boolean).length * 3 : 0;
      //run.hp = Math.min(run.maxHp, run.hp + robertRepair);

      //this.victorySummary = [
      //  `Золото: +${this.combat.rewards.gold}`,
      //  `Опыт: +${this.combat.rewards.xp}`,
      // `Предметы выпали на поле: ${this.combat.rewards.items.length}`,
      //  run.trainingPoints > 0 ? 'Герой получил очко обучения.' : '',
      //].filter(Boolean);
      

      // Показываем экран победы с кнопками
      this.sceneRenderer.renderVictoryPanel(
        //this.victorySummary,
        //this.nodeType,
        //() => this.pickUpAllLoot(),
        //() => this.afterVictory()
      );
      return;
    }

    if (result === 'defeat') {
      this.time.delayedCall(1000, () => {
        this.sceneRenderer.renderDefeatPanel(
          //this.victorySummary,
          //this.nodeType,
          //() => this.pickUpAllLoot(),
          //() => this.afterVictory()
        );
        return;
      })
    }
    /*

    } else {
      // Поражение
      const reward = GameState.finishRun(false);
      SaveSystem.save();
      this.ui.modal('Поражение', [
        `Герой пал. Деревня получила: дерево ${reward.wood}, камень ${reward.stone}, чертежи ${reward.blueprints}.`,
      ], [
        { label: 'В меню', cb: () => this.scene.start('MainMenuScene') }
      ]);
    }*/
  }

  //public override destroy(fromScene?: boolean): void {
  //this.sceneRenderer?.destroy();
  //this.dragManager?.destroy();
  //this.effects?.destroy();
  //super.destroy(fromScene);
  //}
}