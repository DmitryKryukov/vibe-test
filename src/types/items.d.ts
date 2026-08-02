declare global {
    export interface ItemDefinition {
        id: string;
        name: string;
        category: string;
        slot?: EquipmentSlot;
        weight: number;
        rarity: ItemRarity;
        equipText?: string;
        throwText: string;
        bagText?: string;
        color: number;
        glyph: string;
    }

    export interface InventoryItem {
        uid: string;
        itemId: string;
    }

    export interface FieldLoot {
        item: InventoryItem;
        x: number;
        y: number;
    }
}
export { };