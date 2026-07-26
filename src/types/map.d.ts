declare global {
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