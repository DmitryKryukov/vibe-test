import Phaser from "phaser";
import { Heroes } from "@/data/Heroes";
import { Enemies, EnemyScheme, FactionId } from "@/data/Enemies";
import { Abilities, ActiveAbilityScheme } from "@/data/Abilities";
import { GameState } from "@/store/GameState";
import AudioManager from "./AudioManager";


export interface ActiveAbilityBattle extends ActiveAbilityScheme {
  progress: number;
  windupQueued?: boolean;
}
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
  //shield: number;
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
  hero: Combatant;
  enemies: Combatant[];
  ended: 'victory' | 'defeat' | null = null;
  visualEvents: CombatVisualEvent[] = [];


  constructor(scene: Phaser.Scene, enemyIds: string[], audio: AudioManager) {
    this.scene = scene;
    this.audio = audio;
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
        attackSpeed: hero.baseStats.baseDamage
      },
      alive: true,
      //stats: { ...heroDef.baseStats, maxHp: run.maxHp, attack: heroDef.baseStats.attack + (GameState.state.meta.buildings.forge ?? 0) * 2 },
      basicAttacks: hero.basicAttacks.map((attack) => ({ ...attack, progress: 0 })),
      activeAbilities: hero.activeAbilities.map((ability) => ({ ...ability, progress: 0 })),
      statuses: [],
      //shield: heroDef.id === 'galahad' ? run.hp * 0.2 : 0,
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
      this.hero.basicAttacks.forEach((attack) => {
        const previousProgress = attack.progress;
        this.queueAttack(this.hero.id, attack, attack.cooldown, previousProgress);
        attack.progress += dt;
        if (attack.progress >= attack.cooldown) {
          attack.progress = 0;
          attack.windupQueued = false;
          this.resolveHeroAttack(attack.id);
        }
      });
      if (this.hero.stats.hp <= 0) this.killHero();
    }
  }

  private tickEnemies(dt: number): void {
    this.enemies.forEach((enemy) => {

      if (enemy.alive) {
        this.tickStatuses(enemy, dt);
        enemy.basicAttacks.forEach((attack) => {
          const previousProgress = attack.progress;
          //this.queueWindupFlash(this.hero.uid, ability, ability.cooldown, previousProgress);
          attack.progress += dt;
          if (attack.progress >= attack.cooldown) {
            attack.progress = 0;
            attack.windupQueued = false;
            this.resolveEnemyAttack(attack.id, enemy);
          }
        });

        if (enemy.stats.hp <= 0) this.killEnemy(enemy);

      }
      if (this.enemies.every((enemy) => !enemy.alive)) this.ended = 'victory';
      /*
      const enemyObj = Enemies[enemy.definitionId];
      if (enemy.alive && def.aura === 'cursed-resonance' && this.remains.count > 0) {
          this.enemies.forEach((target) => {
              if (target.alive && target.faction === 'distorted') target.hp = Math.min(target.maxHp, target.hp + target.maxHp * (0.02 + this.remains.count * 0.02) * dt);
          });
      }
      */
    });
  }

  resolveHeroAttack(id: string): void {
    const target = this.enemies.find((enemy) => enemy.alive);

    if (!target) return;
    let damage = this.hero.stats.damage;

    if (id === 'strike') {
      this.visualEvents.push({ type: 'attack', sourceUid: this.hero.definitionId, targetUid: target.id });
      this.hero.attackCounter += 1;
      this.audio.playSFX('sfx-strike-ability',{ volume: Phaser.Math.FloatBetween(.8, 1.0) }, { rate: Phaser.Math.FloatBetween(.5, 2.0) });
      this.scene.time.delayedCall(45, () => {
        this.damageTarget(target, this.hero, damage);
      })
    }
    /*
    if (id === 'widow-veil') {
      this.visualEvents.push({ type: 'attack', sourceUid: this.hero.uid, targetUid: target.uid });
      target.statuses.push({ id: 'blind', label: 'Ослепление', duration: 4, stacks: 1 });
      this.logPush('Саван Изгоя ослепил цель.');
      return;
    }
    let damage = this.hero.stats.attack;
    if (id === 'shield-bash') {
      damage *= GameState.requireRun().equipment.some((item) => item && ITEMS[item.itemId].slot === 'shield') ? 1 : 0.45;
      target.statuses.push({ id: 'stun', label: 'Оглушение', duration: 1.5, stacks: 1 });
    }
    this.hero.attackCounter += 1;
    const run = GameState.requireRun();
    if (run.equipment.some((item) => item?.itemId === 'jagged_spear') && this.hero.attackCounter % 3 === 0) {
      target.statuses.push({ id: 'bleed', label: 'Кровотечение', duration: 7, stacks: 1, tickEvery: 1, tickTimer: 1 });
    }
    if (run.equipment.some((item) => item?.itemId === 'old_torch')) {
      target.statuses.push({ id: 'burn', label: 'Поджог', duration: 4, stacks: 1, tickEvery: 1, tickTimer: 1 });
    }
    if (run.equipment.some((item) => item?.itemId === 'alba_ring')) {
      target.statuses.push({ id: 'chill', label: 'Окоченение', duration: 6, stacks: 5 });
    }
    this.visualEvents.push({ type: 'attack', sourceUid: this.hero.uid, targetUid: target.uid });
    this.damage(target, damage, this.hero);
    if (run.equipment.some((item) => item?.itemId === 'bloodthirsty_blade')) this.healHero(3);
    if (run.equipment.some((item) => item?.itemId === 'beast_heart')) this.healHero(Math.max(1, damage * 0.01));
    if (run.heroId === 'beatrice') {
      const weapons = run.equipment.filter((item) => item && ITEMS[item.itemId].slot === 'weapon').length;
      const threshold = Math.max(6, 10 - weapons);
      if (this.hero.attackCounter % threshold === 0) this.enemies.forEach((enemy) => { if (enemy.alive) this.damage(enemy, this.hero.stats.attack * 0.8, this.hero); });
      if (weapons >= 4) {
        const neighbor = this.enemies.find((enemy) => enemy.alive && enemy.uid !== target.uid);
        if (neighbor) this.damage(neighbor, damage * 0.16, this.hero);
        }
        }
        */
  }

  resolveEnemyAttack(id: string, enemy: Combatant): void {
    enemy.attackCounter += 1;
    if (id === 'rotten-bite') {
      let damage = enemy.stats.damage;
      let finalDamage = damage
      this.visualEvents.push({ type: 'attack', sourceUid: enemy.id, targetUid: this.hero.definitionId });
      this.damageTarget(this.hero, enemy, finalDamage);
      this.addStackingStatus(this.hero, 'poison', 'Яд', 25);
      this.audio.playSFX('sfx-rotten-bite', {volume:  Phaser.Math.FloatBetween(.4, .75)}, { rate:  Phaser.Math.FloatBetween(.75, 1.25) });
      //this.enemies.some((ally) => ally.alive && Enemies[ally.definitionId].aura === 'beast-alpha') ? 38 : 25)
    };
    /*
    if (this.hasStatus(enemy, 'blind') && Math.random() < 0.9) {
      this.logPush(`${enemy.name} промахивается.`);
      this.visualEvents.push({ type: 'miss', targetUid: this.hero.uid });
  return;
}
if (id === 'summon-pack' && this.enemies.length < 5) {
  this.enemies.push(this.makeEnemy(ENEMIES.mangy_hound, this.enemies.length));
  this.logPush('Вожак призвал гончую.');
  return;
}
if (id === 'cleansing-rite') {
  const target = [...this.enemies].filter((ally) => ally.alive).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  if (target) target.hp = Math.min(target.maxHp, target.hp + target.maxHp * 0.2);
  return;
}
if (id === 'funeral-bell') {
  const dead = this.enemies.find((ally) => !ally.alive);
  if (dead) {
    dead.alive = true;
    dead.hp = dead.maxHp * 0.3;
    this.logPush('Колокол поднял павшего.');
  }
  return;
}
let damage = enemy.stats.attack;
let attackVisualQueued = false;
if (id === 'quick-lunge') {
  this.visualEvents.push({ type: 'attack', sourceUid: enemy.uid, targetUid: this.hero.uid });
  attackVisualQueued = true;
  if (Math.random() < 0.8) {
    this.logPush(`${enemy.name} промахивается.`);
    this.visualEvents.push({ type: 'miss', targetUid: this.hero.uid });
    return;
  }
}
if (id === 'mutter') return;
if (id === 'tendon-rip' && this.stackCount(this.hero, 'poison') + this.stackCount(this.hero, 'bleed') >= 50) damage *= 2;
if (id === 'wide-shovel') this.hero.statuses.push({ id: 'dizzy', label: 'Головокружение', duration: 5, stacks: 1 });
if (id === 'groin-stab' && this.hasStatus(this.hero, 'dizzy')) damage *= 2;
if (id === 'boar-charge') this.hero.statuses.push({ id: 'stun', label: 'Оглушение', duration: 1, stacks: 1 });
if (id === 'corpse-grip') this.hero.statuses.push({ id: 'slow', label: 'Замедление', duration: 3, stacks: 1 });
if (id === 'abyss-breath') {
  damage *= 1 + this.remains.count * 0.1;
  this.hero.statuses.push({ id: 'antiheal', label: 'Запрет лечения', duration: 3 + this.remains.count, stacks: 1 });
}
if (id === 'tombstone-smash' && Math.random() < 0.2 + this.remains.count * 0.1) this.hero.abilities.forEach((a) => { a.progress = 0; });
if (!attackVisualQueued) this.visualEvents.push({ type: 'attack', sourceUid: enemy.uid, targetUid: this.hero.uid });
this.damage(this.hero, damage, enemy);
if (this.enemies.some((ally) => ally.alive && ENEMIES[ally.definitionId].aura === 'war-council') && enemy.faction === 'forsaken') {
  this.enemies.filter((ally) => ally.faction === 'forsaken').forEach((ally) => ally.abilities.forEach((a) => { if (a.id !== 'quick-lunge') a.progress += 0.15; }));
}
  */
  }
  update(deltaMs: number): void {
    if (this.ended) return;
    const dt = deltaMs / 1000;

    this.tickHero(dt);
    this.tickEnemies(dt);
    /*
   if && !this.hasStatus(this.hero, 'stun')
      const slow = this.hasStatus(this.hero, 'slow') ? 0.85 : 1;
      const madness = this.hasStatus(this.hero, 'madness') ? 1.4 : 1;
          this.resolveHeroAbility(ability.id);
        }
      });
    }
    this.enemies.forEach((enemy) => {
      if (!enemy.alive || this.hasStatus(enemy, 'stun')) return;
      const alpha = this.enemies.some((ally) => ally.alive && ENEMIES[ally.definitionId].aura === 'beast-alpha') && enemy.faction === 'beast' ? 1.2 : 1;
      enemy.abilities.forEach((ability) => {
        const cooldown = ability.id === 'tombstone-smash' ? Math.max(7, ability.cooldown - this.remains.count) : ability.cooldown;
        const previousProgress = ability.progress;
        ability.progress += dt * enemy.stats.attackSpeed * alpha;
        this.queueWindupFlash(enemy.uid, ability, cooldown, previousProgress);
        if (ability.progress >= cooldown) {
          ability.progress = 0;
          ability.windupQueued = false;
          this.resolveEnemyAbility(enemy, ability.id);
        }
      });
    });
    */
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
    /*
    target.statuses.forEach((status) => {
      status.duration -= dt;
      if (status.tickEvery) {
        status.tickTimer = (status.tickTimer ?? status.tickEvery) - dt;
        if (status.tickTimer <= 0) {
          status.tickTimer += status.tickEvery;
          if (status.id === 'poison') {
            const effectCount = Math.floor(status.stacks / 100);
            const damagePerEffect = target.uid === 'hero' && GameState.requireRun().equipment.some((item) => item?.itemId === 'herbalist_hood') ? 1.5 : 3;
            target.hp -= damagePerEffect * effectCount;
          }
          if (status.id === 'bleed') target.hp -= 3 * Math.max(1, status.stacks);
          if (status.id === 'burn') target.hp -= 5;
        }
      }
    });
    target.statuses = target.statuses.filter((status) => status.duration > 0);
  }
*/
  }

  damageTarget(target: Combatant, source: Combatant, amount: number): void {
    let final = amount;
    this.visualEvents.push({ type: 'damage', targetUid: target.id, amount: Math.round(final) });
    target.stats.hp -= final;
    if (target.stats.hp < 0) target.stats.hp = 0;
    /*
    if (Math.random() < target.stats.dodgeChance) {
    if (this.hasStatus(target, 'invulnerable')) return;
      this.visualEvents.push({ type: 'miss', targetUid: target.uid });
      return;
    }
    const defense = this.hasStatus(source, 'madness') ? 0 : target.stats.defense;
    let final = Math.max(1, amount - defense * 0.35);
    if (this.hasStatus(target, 'hex')) final *= 1.25;
    if (target.shield > 0) {
      const blocked = Math.min(target.shield, final);
      target.shield -= blocked;
      final -= blocked;
    }
    target.hp -= final;
    if (target.uid === 'hero' && target.hp <= 0) this.trySacrificeRing(target);
  }
    */
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
    //const Enemy = Enemies[enemy.definitionId];
    //if (Enemy.leavesRemains) this.remains.count += 1;
    // const goldBonus = GameState.requireRun().equipment.some((item) => item?.itemId === 'golden_signet') ? 1.1 : 1;
    //this.rewards.gold += Math.ceil(def.gold * goldBonus);
    //this.rewards.xp += def.xp;
    //this.rewards.items.push(Phaser.Utils.Array.GetRandom(LOOT_TABLE));
  }

  killHero(): void {
    this.hero.alive = false;
    this.ended = 'defeat'
  }
}
/*
import Phaser from 'phaser';
import { ITEMS, LOOT_TABLE } from '../data/items';
import { CombatantState, EnemyDefinition, StatusEffect } from '../entities/Types';
import { applyEquipmentStats } from './ItemSystem';

export interface CombatRewards {
  gold: number;
  xp: number;
  items: string[];
}

export type CombatVisualEvent =
  | { type: 'windup'; sourceUid: string }
  | { type: 'attack'; sourceUid: string; targetUid: string }
  | { type: 'damage'; targetUid: string; amount: number }
  | { type: 'heal'; targetUid: string; amount: number }
  | { type: 'miss'; targetUid: string };

const PRE_ATTACK_FLASH_SECONDS = 0.25;

export class CombatSystem {
  hero: CombatantState;
  enemies: CombatantState[];
  rewards: CombatRewards = { gold: 0, xp: 0, items: [] };
  remains = { count: 0 };
  ended: 'victory' | 'defeat' | null = null;
  log: string[] = [];

  constructor(enemyIds: string[]) {
    const run = GameState.requireRun();
    const heroDef = HEROES[run.heroId];
    this.hero = applyEquipmentStats({
      uid: 'hero',
      definitionId: heroDef.id,
      name: heroDef.name,
      hp: run.hp,
      maxHp: run.maxHp,
      stats: { ...heroDef.baseStats, maxHp: run.maxHp, attack: heroDef.baseStats.attack + (GameState.state.meta.buildings.forge ?? 0) * 2 },
      abilities: heroDef.abilities.map((a) => ({ ...a, progress: 0 })),
      statuses: [],
      alive: true,
      shield: heroDef.id === 'galahad' ? run.hp * 0.2 : 0,
      attackCounter: 0
    });
    this.enemies = enemyIds.map((id, index) => this.makeEnemy(ENEMIES[id], index));
    this.applyBagMapEffects();
  }

  applyBagMapEffects(): void {
    const run = GameState.requireRun();
    if (run.bag.some((item) => item?.itemId === 'martyr_rags')) {
      const target = this.enemies.find((enemy) => enemy.alive);
      if (target) target.hp *= 0.9;
    }
    if (run.bag.some((item) => item?.itemId === 'beast_heart')) {
      this.enemies.filter((enemy) => enemy.faction === 'beast').forEach((enemy) => enemy.abilities.forEach((a) => { a.cooldown += 2; }));
    }
  }

  update(deltaMs: number): void {
    if (this.ended) return;
    const dt = deltaMs / 1000;
    this.tickStatuses(this.hero, dt);
    this.enemies.forEach((enemy) => this.tickStatuses(enemy, dt));
    this.enemies.forEach((enemy) => {
      const def = ENEMIES[enemy.definitionId];
      if (enemy.alive && def.aura === 'cursed-resonance' && this.remains.count > 0) {
        this.enemies.forEach((target) => {
          if (target.alive && target.faction === 'distorted') target.hp = Math.min(target.maxHp, target.hp + target.maxHp * (0.02 + this.remains.count * 0.02) * dt);
        });
      }
    });
    if (this.hero.alive && !this.hasStatus(this.hero, 'stun')) {
      const slow = this.hasStatus(this.hero, 'slow') ? 0.85 : 1;
      const madness = this.hasStatus(this.hero, 'madness') ? 1.4 : 1;
      this.hero.abilities.forEach((ability) => {
        const previousProgress = ability.progress;
        ability.progress += dt * this.hero.stats.attackSpeed * slow * madness;
        this.queueWindupFlash(this.hero.uid, ability, ability.cooldown, previousProgress);
        if (ability.progress >= ability.cooldown) {
          ability.progress = 0;
          ability.windupQueued = false;
          this.resolveHeroAbility(ability.id);
        }
      });
    }
    this.enemies.forEach((enemy) => {
      if (!enemy.alive || this.hasStatus(enemy, 'stun')) return;
      const alpha = this.enemies.some((ally) => ally.alive && ENEMIES[ally.definitionId].aura === 'beast-alpha') && enemy.faction === 'beast' ? 1.2 : 1;
      enemy.abilities.forEach((ability) => {
        const cooldown = ability.id === 'tombstone-smash' ? Math.max(7, ability.cooldown - this.remains.count) : ability.cooldown;
        const previousProgress = ability.progress;
        ability.progress += dt * enemy.stats.attackSpeed * alpha;
        this.queueWindupFlash(enemy.uid, ability, cooldown, previousProgress);
        if (ability.progress >= cooldown) {
          ability.progress = 0;
          ability.windupQueued = false;
          this.resolveEnemyAbility(enemy, ability.id);
        }
      });
    });
    this.enemies.forEach((enemy) => {
      if (enemy.alive && enemy.hp <= 0) this.killEnemy(enemy);
    });
    this.hero.alive = this.hero.hp > 0;
    if (!this.hero.alive) this.ended = 'defeat';
    if (this.enemies.every((enemy) => !enemy.alive)) this.ended = 'victory';
  }

  queueWindupFlash(sourceUid: string, ability: CombatantState['abilities'][number], cooldown: number, previousProgress: number): void {
    const threshold = Math.max(0, cooldown - PRE_ATTACK_FLASH_SECONDS);
    if (!ability.windupQueued && previousProgress < threshold && ability.progress >= threshold) {
      ability.windupQueued = true;
      this.visualEvents.push({ type: 'windup', sourceUid });
    }
  }

  resolveHeroAbility(id: string): void {
    const target = this.enemies.find((enemy) => enemy.alive);
    if (!target) return;
    if (id === 'widow-veil') {
      this.visualEvents.push({ type: 'attack', sourceUid: this.hero.uid, targetUid: target.uid });
      target.statuses.push({ id: 'blind', label: 'Ослепление', duration: 4, stacks: 1 });
      this.logPush('Саван Изгоя ослепил цель.');
      return;
    }
    let damage = this.hero.stats.attack;
    if (id === 'shield-bash') {
      damage *= GameState.requireRun().equipment.some((item) => item && ITEMS[item.itemId].slot === 'shield') ? 1 : 0.45;
      target.statuses.push({ id: 'stun', label: 'Оглушение', duration: 1.5, stacks: 1 });
    }
    this.hero.attackCounter += 1;
    const run = GameState.requireRun();
    if (run.equipment.some((item) => item?.itemId === 'jagged_spear') && this.hero.attackCounter % 3 === 0) {
      target.statuses.push({ id: 'bleed', label: 'Кровотечение', duration: 7, stacks: 1, tickEvery: 1, tickTimer: 1 });
    }
    if (run.equipment.some((item) => item?.itemId === 'old_torch')) {
      target.statuses.push({ id: 'burn', label: 'Поджог', duration: 4, stacks: 1, tickEvery: 1, tickTimer: 1 });
    }
    if (run.equipment.some((item) => item?.itemId === 'alba_ring')) {
      target.statuses.push({ id: 'chill', label: 'Окоченение', duration: 6, stacks: 5 });
    }
    this.visualEvents.push({ type: 'attack', sourceUid: this.hero.uid, targetUid: target.uid });
    this.damage(target, damage, this.hero);
    if (run.equipment.some((item) => item?.itemId === 'bloodthirsty_blade')) this.healHero(3);
    if (run.equipment.some((item) => item?.itemId === 'beast_heart')) this.healHero(Math.max(1, damage * 0.01));
    if (run.heroId === 'beatrice') {
      const weapons = run.equipment.filter((item) => item && ITEMS[item.itemId].slot === 'weapon').length;
      const threshold = Math.max(6, 10 - weapons);
      if (this.hero.attackCounter % threshold === 0) this.enemies.forEach((enemy) => { if (enemy.alive) this.damage(enemy, this.hero.stats.attack * 0.8, this.hero); });
      if (weapons >= 4) {
        const neighbor = this.enemies.find((enemy) => enemy.alive && enemy.uid !== target.uid);
        if (neighbor) this.damage(neighbor, damage * 0.16, this.hero);
      }
    }
  }

  resolveEnemyAbility(enemy: CombatantState, id: string): void {
    if (this.hasStatus(enemy, 'blind') && Math.random() < 0.9) {
      this.logPush(`${enemy.name} промахивается.`);
      this.visualEvents.push({ type: 'miss', targetUid: this.hero.uid });
      return;
    }
    if (id === 'summon-pack' && this.enemies.length < 5) {
      this.enemies.push(this.makeEnemy(ENEMIES.mangy_hound, this.enemies.length));
      this.logPush('Вожак призвал гончую.');
      return;
    }
    if (id === 'cleansing-rite') {
      const target = [...this.enemies].filter((ally) => ally.alive).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (target) target.hp = Math.min(target.maxHp, target.hp + target.maxHp * 0.2);
      return;
    }
    if (id === 'funeral-bell') {
      const dead = this.enemies.find((ally) => !ally.alive);
      if (dead) {
        dead.alive = true;
        dead.hp = dead.maxHp * 0.3;
        this.logPush('Колокол поднял павшего.');
      }
      return;
    }
    let damage = enemy.stats.attack;
    let attackVisualQueued = false;
    if (id === 'quick-lunge') {
      this.visualEvents.push({ type: 'attack', sourceUid: enemy.uid, targetUid: this.hero.uid });
      attackVisualQueued = true;
      if (Math.random() < 0.8) {
        this.logPush(`${enemy.name} промахивается.`);
        this.visualEvents.push({ type: 'miss', targetUid: this.hero.uid });
        return;
      }
    }
    if (id === 'mutter') return;
    if (id === 'tendon-rip' && this.stackCount(this.hero, 'poison') + this.stackCount(this.hero, 'bleed') >= 50) damage *= 2;
    if (id === 'wide-shovel') this.hero.statuses.push({ id: 'dizzy', label: 'Головокружение', duration: 5, stacks: 1 });
    if (id === 'groin-stab' && this.hasStatus(this.hero, 'dizzy')) damage *= 2;
    if (id === 'rotten-bite') this.addStackingStatus(this.hero, 'poison', 'Яд', this.enemies.some((ally) => ally.alive && ENEMIES[ally.definitionId].aura === 'beast-alpha') ? 38 : 25);
    if (id === 'boar-charge') this.hero.statuses.push({ id: 'stun', label: 'Оглушение', duration: 1, stacks: 1 });
    if (id === 'corpse-grip') this.hero.statuses.push({ id: 'slow', label: 'Замедление', duration: 3, stacks: 1 });
    if (id === 'abyss-breath') {
      damage *= 1 + this.remains.count * 0.1;
      this.hero.statuses.push({ id: 'antiheal', label: 'Запрет лечения', duration: 3 + this.remains.count, stacks: 1 });
    }
    if (id === 'tombstone-smash' && Math.random() < 0.2 + this.remains.count * 0.1) this.hero.abilities.forEach((a) => { a.progress = 0; });
    if (!attackVisualQueued) this.visualEvents.push({ type: 'attack', sourceUid: enemy.uid, targetUid: this.hero.uid });
    this.damage(this.hero, damage, enemy);
    if (this.enemies.some((ally) => ally.alive && ENEMIES[ally.definitionId].aura === 'war-council') && enemy.faction === 'forsaken') {
      this.enemies.filter((ally) => ally.faction === 'forsaken').forEach((ally) => ally.abilities.forEach((a) => { if (a.id !== 'quick-lunge') a.progress += 0.15; }));
    }
  }

  damage(target: CombatantState, amount: number, source: CombatantState): void {
    if (this.hasStatus(target, 'invulnerable')) return;
    if (Math.random() < target.stats.dodgeChance) {
      this.visualEvents.push({ type: 'miss', targetUid: target.uid });
      return;
    }
    const defense = this.hasStatus(source, 'madness') ? 0 : target.stats.defense;
    let final = Math.max(1, amount - defense * 0.35);
    if (this.hasStatus(target, 'hex')) final *= 1.25;
    if (target.shield > 0) {
      const blocked = Math.min(target.shield, final);
      target.shield -= blocked;
      final -= blocked;
    }
    target.hp -= final;
    this.visualEvents.push({ type: 'damage', targetUid: target.uid, amount: Math.round(final) });
    if (target.uid === 'hero' && target.hp <= 0) this.trySacrificeRing(target);
  }

  trySacrificeRing(hero: CombatantState): void {
    const run = GameState.requireRun();
    const index = run.equipment.findIndex((item) => item?.itemId === 'sacrificial_lamb_ring');
    if (index >= 0) {
      run.equipment[index] = null;
      hero.hp = 1;
      hero.statuses.push({ id: 'invulnerable', label: 'Неуязвимость', duration: 2, stacks: 1 });
      this.logPush('Кольцо Жертвенного Агнца ломается и спасает героя.');
    }
  }

  healHero(amount: number): void {
    if (this.hasStatus(this.hero, 'antiheal')) return;
    const bonus = GameState.requireRun().equipment.some((item) => item?.itemId === 'penitence_beads') ? 1.1 : 1;
    const final = amount * bonus;
    this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + final);
    this.visualEvents.push({ type: 'heal', targetUid: this.hero.uid, amount: Math.round(final) });
  }

  tickStatuses(target: CombatantState, dt: number): void {
    target.statuses.forEach((status) => {
      status.duration -= dt;
      if (status.tickEvery) {
        status.tickTimer = (status.tickTimer ?? status.tickEvery) - dt;
        if (status.tickTimer <= 0) {
          status.tickTimer += status.tickEvery;
          if (status.id === 'poison') {
            const effectCount = Math.floor(status.stacks / 100);
            const damagePerEffect = target.uid === 'hero' && GameState.requireRun().equipment.some((item) => item?.itemId === 'herbalist_hood') ? 1.5 : 3;
            target.hp -= damagePerEffect * effectCount;
          }
          if (status.id === 'bleed') target.hp -= 3 * Math.max(1, status.stacks);
          if (status.id === 'burn') target.hp -= 5;
        }
      }
    });
    target.statuses = target.statuses.filter((status) => status.duration > 0);
  }

  

  hasStatus(target: CombatantState, id: string): boolean {
    return target.statuses.some((status) => status.id === id);
  }

  stackCount(target: CombatantState, id: string): number {
    return target.statuses.filter((status) => status.id === id).reduce((sum, status) => sum + status.stacks, 0);
  }

  logPush(text: string): void {
    this.log.unshift(text);
    this.log = this.log.slice(0, 5);
  }

  applyRewards(): void {
    const run = GameState.requireRun();
    run.gold += this.rewards.gold;
    run.xp += this.rewards.xp;
    while (run.xp >= run.level * 40) {
      run.xp -= run.level * 40;
      run.level += 1;
      run.trainingPoints += 1;
      run.maxHp += 6;
      run.hp = Math.min(run.maxHp, this.hero.hp + 12);
    }
    run.hp = Math.max(1, Math.ceil(this.hero.hp));
  }
}
  */
