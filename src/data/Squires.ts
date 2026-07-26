export const Squires: Record<string, SquireScheme> = {
    robert: {
        id: 'robert-squire',
        name: 'Верный Роберт',
        class: 'Слуга-оруженосец',
        lore: 'Молчаливый оруженосец несет на спине тяжелый горн и наковальню. В угасающем мире на последнем издыхании он переплавляет разбитые доспехи мертвых, продлевая жизнь ржавеющей броне живых.',
        perks: [
            {
                name: 'Походная починка',
                description: 'Предметы в инвентаре медленно чинятся.'
            },
            {
                name: 'Полевая медицина',
                description: 'Лечение героя в лагере на 15% эффективнее.'
            },
        ],
        baseStats: {
            maxWeight: 25,
            slotCount: 8,
        },
        content: {
            portraitImage: 'robert-squire-portrait',
        },
        locked: false,
    },
    clavridius: {
        id: 'clavridius-squire',
        name: 'Клавридий',
        class: 'Клеймёный Алхимик',
        lore: 'Старец-рыцарь, томимый скорбью, странствует по землям, гаснущим, как светильник в ночи. Он же упорно следует уставу воинскому, древнему и святому, и собирает с павших врагов остатки их благородной экипировки. И была присяга его крепче, нежели король, и крепче, нежели само царство.',
        perks: [
            {
                name: 'Альбедо',
                description: 'Эликсиры действуют вдвое сильнее.'
            },
            {
                name: 'Цитринитас',
                description: 'Во время разведки в лагере получает на 10% больше золота.'
            },
        ],
        baseStats: {
            maxWeight: 15,
            slotCount: 6,
        },
        content: {
            portraitImage: 'clavridius-squire-portrait',
        },
        locked: true,
    },
    placeholder: {
        id: 'placeholder-squire',
        name: 'Плейсхолдер',
        class: 'Плейсхолдер',
        lore: 'Плейсхолдер',
        perks: [],
        baseStats: {
            maxWeight: 0,
            slotCount: 0,
        },
        content: {
            portraitImage: '',
        },
        locked: true,
    }
};

