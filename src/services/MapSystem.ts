
import Phaser from 'phaser';
import { EncounterType, MapNode } from '@/data/Map';

export function generateMap(extraBranches: number = 1): MapNode[] {
    const MAP_LENGTH = 9;
    const nodes: MapNode[] = [];
    const grid = new Map<number, number[]>();

    nodes.push({
        id: "n0-1.5",
        column: 0,
        row: 1.5,
        type: EncounterType.Start,
        links: [],
        visited: true,
        available: true,
        revealed: true,
    });
    grid.set(0, [1.5]);

    for (let column = 1; column <= MAP_LENGTH; column++) {
        const rows = generateRows(column, extraBranches);
        grid.set(column, rows);

        rows.forEach((row, index) => {
            nodes.push({
                id: nodeId(column, row),
                column,
                row,
                type: column === MAP_LENGTH
                    ? EncounterType.Boss
                    : pickNodeType(column, index),
                links: [],
                visited: false,
                available: false,
                revealed: column <= 2,
            });
        });
    }

    for (let column = 0; column < MAP_LENGTH; column++) {
        connectColumns(column, grid, nodes);
    }

    const start = findNode(nodes, 0, 1.5);
    start?.links.forEach(id => {
        const node = nodes.find(n => n.id === id);
        if (node) {
            node.available = true;
        }
    });

    return nodes;
}


function generateRows(column: number, extraBranches: number): number[] {
    if (column === 1) {
        return [0, 1, 2, 3];
    }

    if (column === 9) {
        return [1];
    }

    const count = Math.min(
        4,
        2 + Math.floor(Math.random() * (2 + Math.min(extraBranches, 2)))
    );

    return Phaser.Math.RND
        .shuffle([0, 1, 2, 3])
        .slice(0, count)
        .sort((a, b) => a - b);
}

function connectColumns(
    column: number,
    grid: Map<number, number[]>,
    nodes: MapNode[],
): void {
    const fromRows = grid.get(column) ?? [];
    const toRows = grid.get(column + 1) ?? [];

    for (const row of fromRows) {
        const from = findNode(nodes, column, row);
        if (!from) continue;

        const sorted = [...toRows].sort(
            (a, b) => Math.abs(a - row) - Math.abs(b - row)
        );

        const targets =
            column === 0
                ? sorted
                : sorted.slice(0, Math.min(2, sorted.length));

        from.links = targets.map(target => nodeId(column + 1, target));
    }
}

function findNode(
    nodes: MapNode[],
    column: number,
    row: number,
): MapNode | undefined {
    return nodes.find(n => n.id === nodeId(column, row));
}

function nodeId(column: number, row: number): string {
    return `n${column}-${row}`;
}

function pickNodeType(column: number, index: number): MapNode['type'] {
    if (column === 1) return EncounterType.Battle;
    if (column >= 5 && index === 0) return EncounterType.Elite;

    const roll = Math.random();
    if (roll < 0.44) return EncounterType.Battle;
    if (roll < 0.59) return EncounterType.Elite;
    if (roll < 0.73) return EncounterType.Event;
    if (roll < 0.86) return EncounterType.Merchant;
    return EncounterType.Camp;
}