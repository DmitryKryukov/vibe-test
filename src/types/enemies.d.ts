/*
declare global {
    export interface FactionInfo {
        id: string;
        name: string;
        description: string;
    }

    export interface EnemyStats {
        maxHp: number;
        baseDamage: number;
        baseAttackSpeed: number;
    }
    export type FactionId = keyof typeof Factions;

    export interface EnemyScheme {
      id: string;
      name: string;
      faction: FactionId;
      enemyStats: EnemyStats;
      content: {
        spriteImage: string,
        spriteWidth: number,
        spriteHeight: number,
        spriteScale: number,
        spriteOffsetX: number,
        spriteOffsetY: number,
        statusBarX: number,
        statusBarY: number,
      },
      basicAttacks: ActiveAbilityScheme[];
      activeAbilities: ActiveAbilityScheme[];
      //leavesRemains?: boolean;
      //defense: number;
      //xp: number;
      //gold: number;
      //abilities: AbilityDefinition[];
      //aura?: string;
      //tint: number;
      //scale: number;
    }
}
export { }; 
*/