import { Abilities } from "../data/Abilities";

declare global {
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
            statusBarX?: number;
            statusBarY?: number;
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

}
export { }; 