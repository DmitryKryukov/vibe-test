import { FactionId } from "@/data/Enemies";
import { ActiveAbilityBattle } from "./AbilitySystem";
import { StatusEffect } from "./StatusSystem";
import { GameState } from "@/store/GameState";
import { Heroes } from "@/data/Heroes";
import { EnemyScheme } from "@/data/Enemies";

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

export class CombatantFactory {
    makeHero(): Combatant {
        const run = GameState.requireRun();
        const hero = Heroes[run.heroId.replace("-hero", "")];
        return {
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
}