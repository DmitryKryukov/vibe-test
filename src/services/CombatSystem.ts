//Нужно разбить на CombatFactory, StatusSystem, AbilityResolver, на Case перевести 
import Phaser from "phaser";
import { Heroes } from "@/data/Heroes";
import { Enemies, EnemyScheme, FactionId } from "@/data/Enemies";
import { Abilities, ActiveAbilityScheme } from "@/data/Abilities";
import { GameState } from "@/store/GameState";
import AudioManager from "./AudioManager";
import { ActiveAbilityBattle } from "./AbilitySystem";
import { AbilitySystem } from "./AbilitySystem";

export interface StatusEffect {
  id: string;
  label: string;
  duration: number;
  stacks: number;
  tickEvery?: number;
  tickTimer?: number;
}

export interface Combatant {
  id: string;
  definitionId: string;
  name: string;
  faction?: FactionId;
  stats: {
    hp: number;
    maxHp: number;
    damage: number;
    attackSpeed: number;
  }
  basicAttacks: ActiveAbilityBattle[];
  activeAbilities: ActiveAbilityBattle[];
  statuses: StatusEffect[];
  alive: boolean;
  attackCounter: number;
}


export type CombatVisualEvent =
  | { type: 'windup'; sourceUid: string }
  | { type: 'attack'; sourceUid: string; targetUid: string }
  | { type: 'damage'; targetUid: string; amount: number }
  | { type: 'heal'; targetUid: string; amount: number }
  | { type: 'miss'; targetUid: string };


export class CombatSystem {
  private audio!: AudioManager;
  private scene: Phaser.Scene;
  private abilitySystem: AbilitySystem;

  hero: Combatant;
  enemies: Combatant[];
  ended: 'victory' | 'defeat' | null = null;
  visualEvents: CombatVisualEvent[] = [];


  constructor(scene: Phaser.Scene, enemyIds: string[], audio: AudioManager) {
    this.scene = scene;
    this.audio = audio;
    this.abilitySystem = new AbilitySystem(this.visualEvents, this.audio);

    const run = GameState.requireRun();
    const hero = Heroes[run.heroId.replace("-hero", "")];
    this.hero = {
      id: hero.id,
      definitionId: hero.id,
      name: hero.name,
      stats: {
        hp: run.hp,
        maxHp: run.maxHp,
        damage: hero.baseStats.baseDamage,
        attackSpeed: hero.baseStats.baseAttackSpeed
      },
      alive: true,
      basicAttacks: hero.basicAttacks.map((attack) => ({ ...attack, progress: 0 })),
      activeAbilities: hero.activeAbilities.map((ability) => ({ ...ability, progress: 0 })),
      statuses: [],
      attackCounter: 0
    };
    this.enemies = enemyIds.map((id, index) => this.makeEnemy(Enemies[id], index));
  }

  makeEnemy(enemy: EnemyScheme, index: number): Combatant {
    return {
      id: `enemy-${index}-${enemy.id}`,
      definitionId: enemy.id,
      name: enemy.name,
      faction: enemy.faction,
      stats: {
        hp: enemy.enemyStats.maxHp,
        maxHp: enemy.enemyStats.maxHp,
        damage: enemy.enemyStats.baseDamage,
        attackSpeed: enemy.enemyStats.baseAttackSpeed
      },
      basicAttacks: enemy.basicAttacks.map((attack) => ({ ...attack, progress: 0 })),
      activeAbilities: enemy.activeAbilities.map((ability) => ({ ...ability, progress: 0 })),
      alive: true,
      attackCounter: 0,
      statuses: [],
    };

  }

  private tickHero(dt: number): void {
    if (this.hero.alive) {
      this.tickStatuses(this.hero, dt);
      if (!this.hasStatus(this.hero, 'stun')) {
        this.hero.basicAttacks.forEach((attack) => {
          const previousProgress = attack.progress;
          this.queueAttack(this.hero.id, attack, attack.cooldown, previousProgress);
          attack.progress += dt;
          if (attack.progress >= attack.cooldown) {
            attack.progress = 0;
            attack.windupQueued = false;
            const target = this.enemies.find((enemy) => enemy.alive);
            if (target) {
              this.abilitySystem.resolve(this.hero, target, attack)
            }
          }
        });
      }
      if (this.hero.stats.hp <= 0) this.killHero();
    }
  }

  private tickEnemies(dt: number): void {
    this.enemies.forEach((enemy) => {

      if (enemy.alive) {
        this.tickStatuses(enemy, dt);
        enemy.basicAttacks.forEach((attack) => {
          const previousProgress = attack.progress;
          attack.progress += dt;
          if (attack.progress >= attack.cooldown) {
            attack.progress = 0;
            attack.windupQueued = false;
            this.abilitySystem.resolve(enemy, this.hero, attack)
          }
        });

        enemy.activeAbilities.forEach((ability) => {
          ability.progress += dt;
          if (ability.progress >= ability.cooldown) {
            ability.progress = 0;
            ability.windupQueued = false;
            this.abilitySystem.resolve(enemy, this.hero, ability)
          }
        });

        if (enemy.stats.hp <= 0) this.killEnemy(enemy);

      }
      if (this.enemies.every((enemy) => !enemy.alive)) this.ended = 'victory';
    });
  }

  /*
  resolveHeroAttack(id: string): void {
    const target = this.enemies.find((enemy) => enemy.alive);

    if (!target) return;
    let damage = this.hero.stats.damage;

    if (id === 'strike') {
      this.visualEvents.push({ type: 'attack', sourceUid: this.hero.definitionId, targetUid: target.id });
      this.hero.attackCounter += 1;
      this.audio.playSFX('sfx-strike-ability', { volume: Phaser.Math.FloatBetween(.8, 1.0) }, { rate: Phaser.Math.FloatBetween(.5, 2.0) });
      this.scene.time.delayedCall(45, () => {
        this.damageTarget(target, this.hero, damage);
      })
    }
  }

  resolveEnemyAttack(id: string, enemy: Combatant): void {
    enemy.attackCounter += 1;
    if (id === 'rotten-bite') {
      let damage = enemy.stats.damage;
      let finalDamage = damage
      this.visualEvents.push({ type: 'attack', sourceUid: enemy.id, targetUid: this.hero.definitionId });
      this.damageTarget(this.hero, enemy, finalDamage);
      this.addStackingStatus(this.hero, 'poison', 'Яд', 10);
      this.audio.playSFX('sfx-rotten-bite', { volume: Phaser.Math.FloatBetween(.4, .75) }, { rate: Phaser.Math.FloatBetween(.75, 1.25) });
    };
  }

  resolveEnemyAbility(id: string, enemy: Combatant): void {
    enemy.attackCounter += 1;

    if (id === 'boar-charge') {
      this.hero.statuses.push({ id: 'stun', label: 'Оглушение', duration: 1, stacks: 1 });
    }

  }
  */

  update(deltaMs: number): void {
    if (this.ended) return;
    const dt = deltaMs / 1000;

    this.tickHero(dt);
    this.tickEnemies(dt);
  }

  addStackingStatus(target: Combatant, id: string, label: string, stacks: number): void {
    const existing = target.statuses.find((status) => status.id === id);
    if (existing) {
      existing.stacks += stacks;
      existing.duration = Math.max(existing.duration, 10);
    } else {
      target.statuses.push({ id, label, duration: 10, stacks, tickEvery: id === 'chill' ? undefined : 0.5, tickTimer: 0.5 });
    }
  }


  tickStatuses(target: Combatant, dt: number): void {
    target.statuses.forEach((status) => {
      status.duration -= dt;
      if (status.tickEvery) {
        status.tickTimer = (status.tickTimer ?? status.tickEvery) - dt;
        if (status.tickTimer <= 0) {
          status.tickTimer += status.tickEvery;
          this.resolveStatusEffect(target,status);
        }
      }
    });
    target.statuses = target.statuses.filter((status) => status.duration > 0);
    
  }

  resolveStatusEffect(target: Combatant, status: StatusEffect) {
    if (status.id === 'poison') {
      const effectCount = Math.floor(status.stacks / 100);
      const damagePerEffect = 1;
      target.stats.hp -= damagePerEffect * effectCount;
    }
    if (status.id === 'bleed') {
    // target.hp -= 3 * Math.max(1, status.stacks);
    }
    if (status.id === 'burn') {
  //    target.hp -= 5
    };

  }

  damageTarget(target: Combatant, source: Combatant, amount: number): void {
    let final = amount;
    this.visualEvents.push({ type: 'damage', targetUid: target.id, amount: Math.round(final) });
    target.stats.hp -= final;
    if (target.stats.hp < 0) target.stats.hp = 0;
  }

  queueAttack(sourceUid: string, attack: Combatant['basicAttacks'][number], cooldown: number, previousProgress: number): void {
    const PRE_ATTACK_FLASH_SECONDS = 0.25;
    const threshold = Math.max(0, cooldown - PRE_ATTACK_FLASH_SECONDS);
    if (!attack.windupQueued && previousProgress < threshold && attack.progress >= threshold) {
      alert();
      attack.windupQueued = true;
      this.visualEvents.push({ type: 'windup', sourceUid });
    }
  }

  killEnemy(enemy: Combatant): void {
    this.scene.time.delayedCall(45, () => {
      if (enemy.alive) {
        this.audio.playSFX(enemy.definitionId + '-death', {}, { rate: Phaser.Math.FloatBetween(.75, 1.25) });
      }
      enemy.alive = false;
    })
  }

  killHero(): void {
    this.hero.alive = false;
    this.ended = 'defeat'
  }

  hasStatus(target: Combatant, id: string): boolean {
    return target.statuses.some((status) => status.id === id);
  }
}
