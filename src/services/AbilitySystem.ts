import AudioManager from "./AudioManager";
import { ActiveAbilityScheme } from "@/data/Abilities";
import { Combatant } from "./CombatantFactory";
import { CombatVisualEvent } from "./CombatSystem";
import { StatusSystem } from "./StatusSystem";

export interface ActiveAbilityBattle extends ActiveAbilityScheme {
    progress: number;
    windupQueued?: boolean;
}

export class AbilitySystem {
    private static readonly WINDUP_TIME = 0.25;

    constructor(
        private events: CombatVisualEvent[],
        private audio: AudioManager,
        private statusSystem: StatusSystem
    ) {}

    update(caster: Combatant, target: Combatant | undefined, dt: number): void {
        if (!target?.alive) return;

        this.updateAbilities(caster, target, caster.basicAttacks, dt);
        this.updateAbilities(caster, target, caster.activeAbilities, dt);
    }

    private updateAbilities(caster: Combatant, target: Combatant, abilities: ActiveAbilityBattle[], dt: number): void {
        for (const ability of abilities) {
            const previousProgress = ability.progress;

            ability.progress += dt;

            this.queueWindup(caster.id, ability, previousProgress);

            if (ability.progress < ability.cooldown) {
                continue;
            }

            ability.progress = 0;
            ability.windupQueued = false;

            this.resolve(caster, target, ability);
        }
    }

    private queueWindup(sourceUid: string, ability: ActiveAbilityBattle, previousProgress: number): void {
        const threshold = Math.max(0, ability.cooldown - AbilitySystem.WINDUP_TIME);

        if (ability.windupQueued || previousProgress >= threshold || ability.progress < threshold) {
            return;
        }

        ability.windupQueued = true;

        this.events.push({ type: "windup", sourceUid });
    }

    resolve(caster: Combatant, target: Combatant, ability: ActiveAbilityBattle) {
        switch (ability.id) {
            case "strike":
                this.attack(caster, target, caster.stats.damage);
                this.audio.playSFX("sfx-strike-ability", { volume: Phaser.Math.FloatBetween(.8, 1.0) }, { rate: Phaser.Math.FloatBetween(.5, 2.0) });
                break;

            case "rotten-bite":
                this.attack(caster, target, caster.stats.damage);
                this.audio.playSFX("sfx-rotten-bite", { volume: Phaser.Math.FloatBetween(.4, .75) }, { rate: Phaser.Math.FloatBetween(.75, 1.25) });
                this.statusSystem.addStackingStatus(target, "poison", "Яд", 100);
                break;

            case "boar-charge":
                target.statuses.push({ id: "stun", label: "Оглушение", duration: 1, stacks: 1 });
                break;
        }
    }

    private attack(source: Combatant, target: Combatant, damage: number) {
        this.events.push({ type: "attack", sourceUid: source.id, targetUid: target.id });
        this.events.push({ type: "damage", targetUid: target.id, amount: damage });
        target.stats.hp -= damage;
    }
}