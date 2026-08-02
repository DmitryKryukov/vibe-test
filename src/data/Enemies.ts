import { Abilities } from "./Abilities";

export const Factions = {
    beast: {
        id: 'beast',
        name: 'Дикие звери',
        description: 'Твари из забытых чащ, ведомые слепым инстинктом и яростью. Они не знают жалости и сомнений, полагаясь лишь на силу когтей и клыков. В их безумных глазах нет ничего, кроме стремления разорвать чужака на части.'
    },
};

export const Enemies: Record<string, EnemyScheme> = {
    plagueRodent: {
        id: 'plagueRodent',
        name: 'Чумной Грызун',
        faction: 'beast',
        enemyStats: {
            maxHp: 32,
            baseDamage: 5,
            baseAttackSpeed: 1,
            goldRewardMin: 100,
            goldRewardMax: 100,
            xpReward: 100,
        },
        basicAttacks: [
            Abilities.rottenBiteAbility as ActiveAbilityScheme,
        ],
        activeAbilities: [
        ],
        content: {
            spriteImage: 'enemy-plague-rodent',
            spriteWidth: 348,
            spriteHeight: 204,
            spriteScale: .8,
            spriteOffsetX: 0,
            spriteOffsetY: 10,
            statusBarX: 0,
            statusBarY: -60,
        }
    },

    graveBoar: {
        id: 'graveBoar',
        name: 'Могильный Вепрь',
        faction: 'beast',
        enemyStats: {
            maxHp: 64,
            baseDamage: 13,
            baseAttackSpeed: 1,
            goldRewardMin: 100,
            goldRewardMax: 100,
            xpReward: 100,
        },
        basicAttacks: [
            Abilities.rottenBiteAbility as ActiveAbilityScheme,
        ],
        activeAbilities: [
            Abilities.boarChargeAbility as ActiveAbilityScheme,
        ],
        content: {
            spriteImage: 'enemy-grave-boar',
            spriteWidth: 450,
            spriteHeight: 450,
            spriteScale: .8,
            spriteOffsetX: -60,
            spriteOffsetY: 20,
            statusBarX: 0,
            statusBarY: -100,
        }
    },
};

export const EncounterPool = {
    battle: {
        encounter1: ['graveBoar', 'plagueRodent', 'plagueRodent'],
        encounter2: ['plagueRodent', 'plagueRodent', 'plagueRodent'],
        encounter3: ['plagueRodent', 'plagueRodent'],
        encounter4: ['plagueRodent']
    },
    //elite: ['grave_boar', 'pack_alpha', 'excommunicated_intendant', 'penitent_guard', 'crypt_keeper'],
    //boss: ['pack_alpha', 'excommunicated_intendant', 'crypt_keeper']
};
