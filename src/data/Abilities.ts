export interface AbilityScheme {
  id: string;
  name: string;
  kind: 'baseAttack' | 'attack' | 'heal' | 'buff' | 'summon' | 'utility';
  description: string;
}

export interface ActiveAbilityScheme extends AbilityScheme {
    cooldown: number;
}

export const Abilities = {
    strikeAbility: {id: 'strike', name: 'Удар', kind: 'baseAttack', description: 'Базовая атака по текущей цели.', cooldown: 1.5},
    mechaStrikeAbility: {id: 'strike', name: 'Удар', kind: 'baseAttack', description: 'Базовая атака по текущей цели.', cooldown: 2.8},

    rottenBiteAbility: { id: 'rotten-bite', name: 'Гнилой укус', kind: 'attack', description: 'Наносит слабый урон и 25 стаков яда.', cooldown: 1.55},
}