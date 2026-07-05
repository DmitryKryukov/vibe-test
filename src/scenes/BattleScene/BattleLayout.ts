export function getEnemySlots(count: number, screen: { right: number; centerY: number }): { x: number; y: number }[] {
    const layouts: Record<number, Array<{ x: number; y: number }>> = {
        1: [{ x: screen.right - 500, y: screen.centerY - 15 }],
        2: [
            { x: screen.right - 450, y: screen.centerY - 160 },
            { x: screen.right - 450, y: screen.centerY + 160 }
        ],
        3: [
            { x: screen.right - 300, y: screen.centerY - 15 },
            { x: screen.right - 550, y: screen.centerY - 220 },
            { x: screen.right - 600, y: screen.centerY + 220 }
        ],
        4: [
            { x: screen.right - 350, y: screen.centerY + 120 },
            { x: screen.right - 300, y: screen.centerY - 120 },
            { x: screen.right - 650, y: screen.centerY + 220 },
            { x: screen.right - 600, y: screen.centerY - 220 }
        ],
        5: [
            { x: screen.right - 300, y: screen.centerY - 15 },
            { x: screen.right - 425, y: screen.centerY - 180 },
            { x: screen.right - 450, y: screen.centerY + 180 },
            { x: screen.right - 650, y: screen.centerY - 300 },
            { x: screen.right - 700, y: screen.centerY + 300 }
        ]
    };
    return layouts[count] ?? layouts[1];
}

export function getHeroSlots(): { x: number; y: number } {
    return {
        x: 450,
        y: 360,
    }
}