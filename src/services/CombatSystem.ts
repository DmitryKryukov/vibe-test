import Phaser from "phaser";
import AudioManager from "./AudioManager";
import { Enemies } from "@/data/Enemies";
import { Combatant, CombatantFactory } from "./CombatantFactory";
import { AbilitySystem } from "./AbilitySystem";
import { StatusSystem } from "./StatusSystem";

export enum CombatEventType {
    Damage,
    Heal,
    Windup,
    Attack,
    Miss,
}

export type CombatVisualEvent =
	| { type: CombatEventType.Windup; sourceUid: string }
	| { type: CombatEventType.Attack; sourceUid: string; targetUid: string }
	| { type: CombatEventType.Damage; targetUid: string; amount: number }
	| { type: CombatEventType.Heal; targetUid: string; amount: number }
	| { type: CombatEventType.Miss; targetUid: string };

export class CombatSystem {
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

		this.abilitySystem = new AbilitySystem(this.visualEvents, this.audio, this.statusSystem);

		this.hero = this.combatantFactory.makeHero();

		this.enemies = enemyIds.map((id, index) =>
			this.combatantFactory.makeEnemy(Enemies[id], index),
		);
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
			this.audio.playSFX(`${combatant.definitionId}-death`, {}, {rate: Phaser.Math.FloatBetween(0.75, 1.25)});
		}

		this.checkBattleEnd();
	}

	private checkBattleEnd(): void {
		if (!this.hero.alive) {
			this.ended = "defeat";
			return;
		}

		if (this.enemies.every(enemy => !enemy.alive)) {
			this.ended = "victory";
		}
	}
}