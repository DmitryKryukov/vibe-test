import { EncounterType } from '@/data/Map';
import { CombatSystem } from '@/services/CombatSystem';
import { GameState } from '@/store/GameState';
import { BattleEffects } from './BatteEffects';
import { BattleSceneRenderer } from './BattleRenderer';
//import { ITEMS } from '../data/items';
//import { SaveSystem } from '../state/SaveSystem';
//import { itemFromInventory, throwItemAtEnemy, useItemOnHero } from '../systems/ItemSystem';

interface BattleData {
    nodeId: string;
    nodeType: EncounterType;
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
    private nodeType: EncounterType = EncounterType.Battle;

    constructor() {
        super('BattleScene');
    }

    init(data: BattleData): void {
        this.nodeId = data.nodeId;
        this.nodeType = data.nodeType;
        this.combatSystem = new CombatSystem(this, data.enemyIds, this.audio);
        this.sceneRenderer = new BattleSceneRenderer(this, this.combatSystem);
        this.battleEffects = new BattleEffects(this, this.combatSystem, this.sceneRenderer);
        this.audio.stopMusic();
    }

    create(): void {
        this.ended = false;
        this.time.delayedCall(45, () => {
            this.audio.setMusicVolume(1);
            this.audio.playMusic('music-battle-1', true);
        })
        this.sceneRenderer.renderStatic();
    }

    update(_: number, delta: number): void {
        if (this.ended) return;
        this.combatSystem.update(delta);
        this.battleEffects.update();
        this.sceneRenderer.update();

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
            run.hp = Math.min(run.maxHp, run.hp);
            //const robertRepair = run.squireId === 'robert' ? run.bag.filter(Boolean).length * 3 : 0;

            //this.victorySummary = [
            //  `Золото: +${this.combat.rewards.gold}`,
            //  `Опыт: +${this.combat.rewards.xp}`,
            // `Предметы выпали на поле: ${this.combat.rewards.items.length}`,
            //  run.trainingPoints > 0 ? 'Герой получил очко обучения.' : '',
            //].filter(Boolean);

            this.sceneRenderer.renderVictoryPanel(
                () => this.afterVictory(),
                //() => this.pickUpAllLoot()
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
    afterVictory(): void {
        if (this.nodeType === 'boss') {
            //const reward = GameState.finishRun(true);
            //SaveSystem.save();
            //this.ui.modal('Победа забега', [`Суперсильный босс побеждён.`, `Деревня получила: дерево ${reward.wood}, камень ${reward.stone}, чертежи ${reward.blueprints}.`], [
            //  { label: 'В меню', cb: () => this.scene.start('MainMenuScene') }
            //]);
            //return;
        }
        GameState.completeNode(this.nodeId);
        this.scene.start('MapScene');
        /*
    }
    SaveSystem.save();
    */
    }

    //public override destroy(fromScene?: boolean): void {
    //this.sceneRenderer?.destroy();
    //this.dragManager?.destroy();
    //this.effects?.destroy();
    //super.destroy(fromScene);
    //}
}