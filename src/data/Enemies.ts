import { ActiveAbilityScheme, Abilities } from "./Abilities";
export type Faction = 'beast';

export interface EnemyStats {
  maxHp: number;
  baseDamage: number;
  baseAttackSpeed: number;
}

export interface EnemyScheme {
  id: string;
  name: string;
  faction: Faction;
  enemyStats: EnemyStats;
  content: {
    spriteImage: string,
    spriteWidth: number,
    spriteHeight: number,
    spriteScale: number,
    spriteOffsetX: number,
    spriteOffsetY: number,
  },
  basicAttacks: ActiveAbilityScheme[];
  activeAbilities: ActiveAbilityScheme[];
  //defense: number;
  //xp: number;
  //gold: number;
  //abilities: AbilityDefinition[];
  //leavesRemains?: boolean;
  //aura?: string;
  //tint: number;
  //scale: number;
}
/*
const attack = (id: string, name: string, cooldown: number, description: string) =>
  ({ id, name, cooldown, kind: 'attack' as const, description });
const utility = (id: string, name: string, cooldown: number, description: string) =>
  ({ id, name, cooldown, kind: 'utility' as const, description });
*/
export const Enemies: Record<string, EnemyScheme> = {
  plagueRodent: {
    id: 'plagueRodent',
    name: 'Чумной Грызун',
    faction: 'beast',
    enemyStats: {
      maxHp: 42,
      baseDamage: 5,
      baseAttackSpeed: 1,
    },
    basicAttacks: [
      Abilities.rottenBiteAbility as ActiveAbilityScheme,
    ],
    activeAbilities: [
    ],
    content: {
      spriteImage: 'enemy-plague-rodent',
      spriteWidth: 354,
      spriteHeight: 210,
      spriteScale: 1.1,
      spriteOffsetX: 20,
      spriteOffsetY: 40,
    }
  },
};

export const EncounterPool = {
  battle: {
    encounter1: ['plagueRodent', 'plagueRodent', 'plagueRodent']
  },
  //elite: ['grave_boar', 'pack_alpha', 'excommunicated_intendant', 'penitent_guard', 'crypt_keeper'],
  //boss: ['pack_alpha', 'excommunicated_intendant', 'crypt_keeper']
};
