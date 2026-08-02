import { Enemies } from "@/data/Enemies";
import { AbilitySystem } from "./AbilitySystem";
import { AudioManager } from "./AudioManager";
import { Combatant, CombatantFactory } from "./CombatantFactory";
import { StatusSystem } from "./StatusSystem";
import { GameState } from "@/store/GameState";
import { LootTable } from "@/data/Items";

export enum CombatEventType {
    Damage,
    Heal,
    Windup,
    Attack,
    Miss,
    Charge,
}

export type CombatVisualEvent =
    | { type: CombatEventType.Windup; sourceUid: string }
    | { type: CombatEventType.Attack; sourceUid: string; targetUid: string }
    | { type: CombatEventType.Damage; targetUid: string; amount: number }
    | { type: CombatEventType.Heal; targetUid: string; amount: number }
    | { type: CombatEventType.Miss; targetUid: string }
    | { type: CombatEventType.Charge; sourceUid: string; targetUid: string };

export interface CombatLootReward {
    itemId: string;
    sourceCombatantId: string;
}

export interface CombatRewards {
    gold: number;
    xp: number;
    items: CombatLootReward[];
}

export class CombatSystem {
    public rewards: CombatRewards = { gold: 0, xp: 0, items: [] };

    private static readonly WINDUP_TIME = 0.25;

    private readonly scene: Phaser.Scene;
    private readonly audio: AudioManager;
    private readonly combatantFactory = new CombatantFactory();
    private readonly statusSystem = new StatusSystem();
    private readonly abilitySystem: AbilitySystem;

    hero: Combatant;
    enemies: Combatant[];

    ended: "victory" | "defeat" | null = null;
    visualEvents: CombatVisualEvent[] = [];

    constructor(scene: Phaser.Scene, enemyIds: string[], audio: AudioManager) {
        this.scene = scene;
        this.audio = audio;

        this.abilitySystem = new AbilitySystem(this.scene, this.visualEvents, this.audio, this.statusSystem);

        this.hero = this.combatantFactory.makeHero();

        this.enemies = enemyIds.map((id, index) =>
            this.combatantFactory.makeEnemy(Enemies[id], index),
        );
        console.log(this);
    }

    update(deltaMs: number): void {
        if (this.ended) return;

        const dt = deltaMs / 1000;
        const target = this.enemies.find(enemy => enemy.alive)
        if (target) this.tickCombatant(this.hero, target, dt);

        for (const enemy of this.enemies) {
            this.tickCombatant(enemy, this.hero, dt);
        }
    }

    private tickCombatant(source: Combatant, target: Combatant, dt: number): void {
        if (!source.alive) return;

        this.statusSystem.update(source, dt);

        if (!this.statusSystem.hasStatus(source, "stun")) {
            this.abilitySystem.update(source, target, dt);
        }

        if (source.stats.hp <= 0) {
            this.killCombatant(source);
        }
    }

    private killCombatant(combatant: Combatant): void {
        if (!combatant.alive) {
            return;
        }

        combatant.alive = false;

        if (combatant !== this.hero) {
            this.onKillEnemy(combatant);
        }

        this.checkBattleEnd();
    }

    private onKillEnemy(combatant: Combatant): void {
        const data = Enemies[combatant.definitionId];
        //if (def.leavesRemains) this.remains.count += 1;
        //const goldBonus = GameState.requireRun().equipment.some((item) => item?.itemId === 'golden_signet') ? 1.1 : 1;
        const goldMultiplier = 1;
        this.rewards.gold += Math.ceil(Phaser.Math.Between(data.enemyStats.goldRewardMin, data.enemyStats.goldRewardMax) * goldMultiplier);
        this.rewards.xp += data.enemyStats.xpReward;
        this.rewards.items.push({
            itemId: Phaser.Utils.Array.GetRandom(LootTable),
            sourceCombatantId: combatant.id,
        });
        this.audio.playSFX(`${combatant.definitionId}-death`, {}, { rate: Phaser.Math.FloatBetween(0.75, 1.25) });
    }

    private checkBattleEnd(): void {
        if (!this.hero.alive) {
            this.ended = "defeat";
            return;
        }

        if (this.enemies.every(enemy => !enemy.alive)) {
            const run = GameState.requireRun();
            run.hp = Math.min(run.maxHp, this.hero.stats.hp);
            this.ended = "victory";
        }
    }
}
