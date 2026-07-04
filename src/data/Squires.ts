export interface SquireScheme {
  id: string,
  name: string,
  class: string,
  lore: string,
  /*
  bagSlots: number;
  bagColumns: number;
  maxWeight: number;
  perks: string[];
  portraitTint: number;
  */
 perks: SquirePerk[],
 baseStats: SquireStats,
  content: {
    portraitImage: string,
  },
  locked: boolean,
}

export interface SquireStats {
    maxWeight: number;
    slotCount: number;
}


export interface SquirePerk {
  name: string,
  description: string
}

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
  }
  /*
robert: {
  id: 'robert',
  name: 'Верный Роберт',
  title: 'Слуга-оруженосец',
  bagSlots: 8,
  bagColumns: 4,
  maxWeight: 22,
  portraitTint: 0xc59b75,
  perks: [
    'Походная Починка: после боя герой восстанавливает 3 HP за предмет в сумке.',
    'Полевая медицина: лагерь лечит на 15% эффективнее.',
    'Два сапога пара: пары одинаковых типов в сумке усиливают экипировку героя.'
  ]
},
clavridius: {
  id: 'clavridius',
  name: 'Клавридий',
  title: 'Клеймёный Алхимик',
  bagSlots: 4,
  bagColumns: 2,
  maxWeight: 8,
  portraitTint: 0xaebf7a,
  perks: [
    'Альбедо: эликсиры действуют вдвое сильнее.',
    'Цитринитас: в лагере получает 10% текущего золота.',
    'Рубедо: применение предмета на врага может выбить монету.'
  ]
}
  */
};

