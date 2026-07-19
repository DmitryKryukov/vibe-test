
export enum EncounterType {
  Start = 'start',
  Battle = 'battle',
  Elite = 'elite',
  Merchant = 'merchant',
  Event = 'event',
  Camp = 'camp',
  Boss = 'boss'
}

export interface MapNode {
  id: string;
  column: number;
  row: number;
  type: EncounterType;
  links: string[];
  visited: boolean;
  available: boolean;
  revealed: boolean;
  elite?: boolean;
}

export function getMapMetrics(): { startX: number; startY: number; gapX: number; gapY: number; randomX: number; randomY: number  } {
    return {
        startX: 245,
        startY: 200,
        gapX: 300,
        gapY: 160,
        randomX: 0,
        randomY: 0,
    };
}

export function getNodeLabel(type: EncounterType): string {
    return ({ start: 'Старт', battle: 'Сражение', elite: 'Элита', merchant: 'Торговец', event: 'Событие', camp: 'Лагерь', boss: 'Босс' })[type];
}

export function getNodeDescription(type: EncounterType): string {
  return {
    start: 'Здесь начинается ваш путь. В воздухе пахнет приключениями, а дорога манит неизведанными тропами. Вы делаете первый шаг навстречу судьбе.',
    battle: 'Из тени выступают враги, готовые испытать вашу силу. Клинки звенят, магия искрится — это проверка вашей боевой выучки.',
    elite: 'Перед вами грозный противник, закалённый в бесчисленных сражениях. Его аура давит, но победа сулит щедрую награду.',
    merchant: 'На обочине расположился торговец с телегой, полной диковинных товаров. Золото перетекает из рук в руки, а редкие артефакты ждут нового хозяина.',
    event: 'Судьба подбрасывает неожиданную встречу или загадочное происшествие. Исход неясен — удача может как улыбнуться, так и отвернуться.',
    camp: 'Уютный костёр посреди диких земель. Время перевести дух, перевязать раны и собраться с мыслями перед новыми испытаниями.',
    boss: 'Владыка этих земель восседает на троне из костей и страха. Воздух сгущается, сердце стучит чаще — настал час решающей битвы.',
  }[type];
}