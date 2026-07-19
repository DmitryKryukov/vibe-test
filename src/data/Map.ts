
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

export function getMapMetrics(): { startX: number; startY: number; gapX: number; gapY: number } {
    return {
        startX: 245,
        startY: 200,
        gapX: 280,
        gapY: 160,
    };
}

export function getNodeLabel(type: EncounterType): string {
    return ({ start: 'Старт', battle: 'Бой', elite: 'Элита', merchant: 'Торговец', event: 'Событие', camp: 'Лагерь', boss: 'Супербосс' })[type];
}