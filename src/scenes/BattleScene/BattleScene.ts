import Phaser from 'phaser';
import { Heroes } from '@/data/Heroes';
import { Squires } from '@/data/Squires';
import { GameState } from '@/store/GameState';
import { BattleSceneRenderer } from './BattleSceneRenderer';
import { CombatSystem } from '@/services/CombatSystem';
import { EncounterPool } from '@/data/Enemies';
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
  private combatSystem!: CombatSystem;
  private ended = false;

  constructor() {
    super('BattleScene');
  }

  init(data: BattleData): void {
    this.nodeId = data.nodeId;
    this.combatSystem = new CombatSystem(EncounterPool.battle.encounter1);
  }
  create(): void {
    //this.scale.off('resize', this.handleResize);
    //this.scale.on('resize', this.handleResize);
    //this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', this.handleResize));

    this.sceneRenderer = new BattleSceneRenderer(this, this.combatSystem);
    this.sceneRenderer.renderStatic();
  }

  update(_: number, delta: number): void {
    if (this.ended) return;
    this.combatSystem.update(delta);
    this.sceneRenderer.updateBars();
    /*
    this.effects.processVisualEvents();
    this.renderer.syncEnemyViews();
    this.renderer.spawnPendingCombatLoot();
    this.renderer.updateStatusBadges();

    if (this.combat.ended && !this.finishQueued) {
      this.finishQueued = true;
      this.time.delayedCall(950, () => this.finishBattle(this.combat.ended));
    }
      */
  }
}