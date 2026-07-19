
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
        return [0.5, 1.5, 2.5];
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

    if (column === 0) {
        const fromRow = fromRows[0];
        const from = findNode(nodes, column, fromRow);
        if (from) {
            from.links = toRows.map(target => nodeId(column + 1, target));
        }
        return;
    }

    const sortedFrom = [...fromRows].sort((a, b) => a - b);
    const sortedTo = [...toRows].sort((a, b) => a - b);
    const m = sortedFrom.length;
    const n = sortedTo.length;

    let bestDist = Infinity;
    let bestPlan: { start: number; k: number }[] | null = null;

    function dfs(i: number, lastEnd: number, plan: { start: number; k: number }[]) {
        if (i === m) {
            if (lastEnd === n - 1) {
                let total = 0;
                for (let j = 0; j < m; j++) {
                    const { start, k } = plan[j];
                    for (let t = start; t < start + k; t++) {
                        total += Math.abs(sortedFrom[j] - sortedTo[t]);
                    }
                }
                if (total < bestDist) {
                    bestDist = total;
                    bestPlan = plan.map(p => ({ ...p }));
                }
            }
            return;
        }

        for (const k of [1, 2]) {
            if (k === 2 && lastEnd + 2 > n - 1) continue;
            const possibleStarts = [lastEnd];
            if (lastEnd + 1 <= n - 1) possibleStarts.push(lastEnd + 1);
            for (const s of possibleStarts) {
                if (s + k - 1 > n - 1) continue;
                const newPlan = [...plan, { start: s, k }];
                const newEnd = s + k - 1;
                dfs(i + 1, newEnd, newPlan);
            }
        }
    }

    dfs(0, -1, []);

    if (bestPlan) {
        for (let i = 0; i < m; i++) {
            const fromRow = sortedFrom[i];
            const from = findNode(nodes, column, fromRow);
            if (!from) continue;
            const { start, k } = bestPlan[i];
            const targets = [];
            for (let t = start; t < start + k; t++) {
                targets.push(nodeId(column + 1, sortedTo[t]));
            }
            from.links = targets;
        }
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