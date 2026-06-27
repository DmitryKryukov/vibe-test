export interface AbilityScheme {
  id: string;
  name: string;
  kind: 'baseAttack' | 'attack' | 'heal' | 'buff' | 'summon' | 'utility';
  description: string;
}

export interface ActiveAbilityScheme extends AbilityScheme {
    cooldown: number;
}