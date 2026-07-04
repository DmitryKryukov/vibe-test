export const DEFAULT_HERO_ID = 'galahad-hero';
export const DEFAULT_SQUIRE_ID = 'robert-squire';
export const MAIN_MENU_LAYOUT = {
    title: { x: 16, y: 8 },
    buttonsPanel: {
        paddingX: 20,
        paddingY: 20,
        gap: 8,
    },
    heroesPanel: {
        x: 16,
        y: 200,
    },
    squiresPanel: {
        x: 745,
        y: 200
    }
} as const;