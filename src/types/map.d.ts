declare global {
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
}
export { }