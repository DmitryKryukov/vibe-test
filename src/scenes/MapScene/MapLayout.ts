import { getMapMetrics } from "@/data/Map";

export class MapLayout {
    static build(nodes: MapNode[]): Map<string, Position> {
        const positions = new Map<string, Position>();

        const {
            startX,
            startY,
            gapX,
            gapY,
            randomX,
            randomY
        } = getMapMetrics();

        for (const node of nodes) {
            positions.set(node.id, {
                x: startX + node.column * gapX + Phaser.Math.Between(-randomX, randomX),
                y: startY + node.row * gapY + Phaser.Math.Between(-randomY, randomY),
            });
        }

        return positions;
    }
}