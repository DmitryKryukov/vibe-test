declare global {
    export interface AbilityScheme {
        id: string;
        name: string;
        kind: 'ability' | 'attack' | 'heal' | 'buff' | 'summon' | 'utility';
        description: string;
        sfxKey: string | null;
    }

    export interface ActiveAbilityScheme extends AbilityScheme {
        cooldown: number;
    }

    export interface ActiveAbilityBattle extends ActiveAbilityScheme {
        progress: number;
        windupQueued?: boolean;
    }
}
export { }; 