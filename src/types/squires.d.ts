
declare global {
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

}
export { }; 
