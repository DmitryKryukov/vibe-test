export interface SquireScheme {
  id: string;
  name: string;
  class: string;
  /*
  bagSlots: number;
  bagColumns: number;
  maxWeight: number;
  perks: string[];
  portraitTint: number;
  */
    perks: SquirePerk[],
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
        perks: [
            {
                name: 'Походная Починка', 
                description:'Предметы в инвентаре медленно чинятся.'
            },
            {
                name: 'Полевая медицина', 
                description:'Лечение героя в лагере на 15% эффективнее.'
            }
    ]
    },
    clavridius: {
        id: 'clavridius-squire',
        name: 'Клавридий',
        class: 'Клеймёный Алхимик',
        perks: [
            {
                name: 'Альбедо', 
                description:'Эликсиры действуют вдвое сильнее.'
            },
            {
                name: 'Цитринитас', 
                description:'Во время разведки в лагере получает на 10% больше золота.'
            }
    ]
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

