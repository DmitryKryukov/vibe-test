import { ActiveAbilityScheme, Abilities } from "./Abilities";

export interface HeroScheme {
    id: string;
    name: string;
    class: string;
    lore: string;
    slots: SlotType[];
    baseStats: HeroStats;
    basicAttacks: ActiveAbilityScheme[];
    activeAbilities: ActiveAbilityScheme[];
    perks: HeroPerk[];
    content?: {
        portraitImage?: string;
        spriteImage?: string;
        spriteWidth?: number;
        spriteHeight?: number;
        spriteScale?: number;
        spriteOffsetX?: number;
        spriteOffsetY?: number;
    },
    locked?: boolean;
}

export interface HeroStats {
    maxHp: number;
    baseDamage: number;
    baseAttackSpeed: number;
}

export type SlotType = 'weapon' | 'shield' | 'armor' | 'helmet' | 'amulet' | 'ring';

export interface HeroPerk {
    name: string,
    description: string,
    type: 'passive' | 'active',
    cooldown?: number,
}

export const Heroes: Record<string, HeroScheme> = {
    galahad: {
        id: 'galahad-hero',
        name: 'Cэр Галахад',
        class: 'Осколок Былого Ордена',
        lore: 'Старец-рыцарь, томимый скорбью, странствует по угасающим землям. Он следует древнему воинскому уставу, собирая остатки благородной экипировки павших врагов.',
        perks: [
            {
                name: 'Рыцарская Сноровка',
                description: '+5% скорости атаки за каждый заполненный слот.',
                type: 'passive',
            },
            {
                name: 'Закаленный щит',
                description: 'Галахад совершает удар щитом, который наносит урон, зависящий от брони и гарантированно оглушает врага на 1.5 секунды. Если в слоте щита ничего нет урон уменьшается на 50%.',
                type: 'active',
                cooldown: 15
            },
            {
                name: 'Авангард',
                description: 'В начале боя получает щит на 20% текущего здоровья.',
                type: 'passive',
            },
        ],
        slots: ['weapon', 'helmet', 'amulet', 'shield', 'armor', 'ring'],
        baseStats: { maxHp: 135, baseDamage: 16, baseAttackSpeed: 1 },
        basicAttacks: [
            Abilities.strikeAbility as ActiveAbilityScheme,
        ],
        activeAbilities: [
            //{ id: 'shield-bash', name: 'Закаленный щит', cooldown: 10, kind: 'attack', description: 'Удар щитом и оглушение.' }
        ],
        content: {
            portraitImage: 'galahad-hero-portrait',
            spriteImage: 'galahad-hero-sprite',
            spriteWidth: 390,
            spriteHeight: 510,
            spriteScale: 1,
            spriteOffsetX: -10,
            spriteOffsetY: 40,
        },
        locked : false,
    },
    beatrice: {
        id: 'beatrice-hero',
        name: 'Леди Беатрис',
        class: 'Стальная Пленница',
        lore: 'В прошлом — великая воительница, приговоренная к вечному заточению в „Карающей Гробнице“ — доспехе-саркофаге со сложнейшим часовым механизмом внутри.',
        perks: [
            {
                name: 'Гексаподический танец',
                description: 'Каждое оружие ускоряет атаки на 6%.',
                type: 'passive',
            },
            {
                name: 'Такт Отречения',
                description: 'каждая атака накапливает заряд. Каждый 10-й удар становится сокрушительным круговым взмахом, который наносит урон всем врагам на экране. Каждое экипированное оружие уменьшает счётчик необходимых ударов на один.',
                type: 'passive',

            },
            {
                name: 'Cаван Изгоя',
                description: 'Каждые 25,6 секунд выпускает во врагов струю едкой паутины, которая ослепляет текущую цель на 4 секунды (враг промахивается всеми атаками). Во время слепоты все эффекты воздействия предметов на врага увеличиваются в два раза.',
                type: 'active',
                cooldown: 25.6
            },

        ],
        basicAttacks: [
            Abilities.mechaStrikeAbility as ActiveAbilityScheme,
        ],
        activeAbilities: [
               //  { id: 'widow-veil', name: 'Саван Изгоя', cooldown: 25.6, kind: 'utility', description: 'Ослепляет текущую цель.' }
        ],
        slots: ['weapon', 'weapon', 'weapon', 'weapon', 'amulet', 'ring'],
        baseStats: { maxHp: 90, baseDamage: 8, baseAttackSpeed: 0.8 },
        locked : true,
    },
    placeholder: {
        id: 'placeholder-hero',
        name: 'Плейсхолдер',
        class: 'Плейсхолдер',
        lore: 'Плейсхолдер',
        perks: [],
        basicAttacks: [],
        activeAbilities: [],
        slots: [],
        baseStats: { maxHp: 0, baseDamage: 0, baseAttackSpeed: 0 },
        locked : true,
    }
};
