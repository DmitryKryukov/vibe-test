export interface HeroScheme {
    id: string;
    name: string;
    class: string;
    lore: string;
    //slots: EquipmentSlot[];
    //baseStats: Stats;
    //abilities: AbilityDefinition[];
    perks: HeroPerk[];
    content?: {
        portraitImage?: string;
        spriteImage?: string;
        spriteWidth?: number;
        spriteHeight?: number;
        spriteScale?: number;
        spriteOffsetX?: number;
        spriteOffsetY?: number;
    }
}

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
        lore: 'Старец-рыцарь, томимый скорбью, странствует по землям, гаснущим, как светильник в ночи. Он же упорно следует уставу воинскому, древнему и святому, и собирает с павших врагов остатки их благородной экипировки. И была присяга его крепче, нежели король, и крепче, нежели само царство.',
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
        content: {
            portraitImage: 'galahad-hero-portrait',
            spriteImage: 'galahad-hero-sprite',
            spriteWidth: 390,
            spriteHeight: 510,
            spriteScale: 1,
            spriteOffsetX: -10,
            spriteOffsetY: 40,
        }
    },
    beatrice: {
        id: 'beatrice-hero',
        name: 'Леди Беатрис',
        class: 'Стальная Пленница',
        lore: 'Старец-рыцарь, томимый скорбью, странствует по землям, гаснущим, как светильник в ночи. Он же упорно следует уставу воинскому, древнему и святому, и собирает с павших врагов остатки их благородной экипировки. И была присяга его крепче, нежели король, и крепче, нежели само царство.',
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
        ]
    }
    /*
  galahad: {
    id: 'galahad',
    name: 'Сэр Галахад',
    title: 'Осколок Былого Ордена',
    slots: ['weapon', 'shield', 'armor', 'helmet', 'amulet', 'ring'],
    baseStats: { maxHp: 135, attack: 16, defense: 8, attackSpeed: 1, critChance: 0.06, dodgeChance: 0.02 },
    portraitTint: 0xb7a08b,
    abilities: [
      { id: 'strike', name: 'Удар', cooldown: 2.8, kind: 'attack', description: 'Базовая атака по текущей цели.' },
      { id: 'shield-bash', name: 'Закаленный щит', cooldown: 10, kind: 'attack', description: 'Удар щитом и оглушение.' }
    ],
  },
  beatrice: {
    id: 'beatrice',
    name: 'Беатриса',
    title: 'Стальная Пленница',
    slots: ['weapon', 'weapon', 'weapon', 'weapon', 'amulet', 'ring'],
    baseStats: { maxHp: 118, attack: 12, defense: 5, attackSpeed: 1.22, critChance: 0.08, dodgeChance: 0.01 },
    portraitTint: 0x8f9ca5,
    abilities: [
      { id: 'strike', name: 'Меха-удар', cooldown: 2.2, kind: 'attack', description: 'Очередная атака верхней цели.' },
      { id: 'widow-veil', name: 'Саван Изгоя', cooldown: 25.6, kind: 'utility', description: 'Ослепляет текущую цель.' }
    ],
    perks: [
      'Гексаподический танец: каждое оружие ускоряет атаки на 6%.',
      'Такт Отречения: каждая серия ударов превращается в круговой взмах.'
    ]
  }
    */
};
