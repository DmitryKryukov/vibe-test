import { Combatant } from "./CombatantFactory";
export interface StatusEffect {
    id: string;
    label: string;
    duration: number;
    stacks: number;
    tickEvery?: number;
    tickTimer?: number;
}

export class StatusSystem {
    update(target: Combatant, dt: number): void {
        const activeStatuses = [];

        for (const status of target.statuses) {
            status.duration -= dt;

            if (status.tickEvery) {
                status.tickTimer =
                    (status.tickTimer ?? status.tickEvery) - dt;

                if (status.tickTimer <= 0) {
                    status.tickTimer += status.tickEvery;
                    this.resolve(target, status);
                }
            }

            if (status.duration > 0) {
                activeStatuses.push(status);
            }
        }

        target.statuses = activeStatuses;
    }

    resolve(
        target: Combatant,
        status: StatusEffect
    ) {
        switch (status.id) {
            case "poison":
                const effectCount = Math.floor(status.stacks / 100);
                const damagePerEffect = 1;
                target.stats.hp -= damagePerEffect * effectCount;

                break;

        }
    }

    addStackingStatus(target: Combatant, id: string, label: string, stacks: number): void {
        const existing = target.statuses.find((status) => status.id === id);
        if (existing) {
            existing.stacks += stacks;
            existing.duration = Math.max(existing.duration, 10);
        } else {
            target.statuses.push({ id, label, duration: 10, stacks, tickEvery: id === 'chill' ? undefined : 0.5, tickTimer: 0.5 });
        }
    }

    hasStatus(target: Combatant, id: string): boolean {
        return target.statuses.some((status) => status.id === id);
    }
}