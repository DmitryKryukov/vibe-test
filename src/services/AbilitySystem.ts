import AudioManager from "./AudioManager";
import { ActiveAbilityScheme } from "@/data/Abilities";
import { CombatVisualEvent, Combatant } from "./CombatSystem";

export interface ActiveAbilityBattle extends ActiveAbilityScheme {
  progress: number;
  windupQueued?: boolean;
}

export class AbilitySystem {
    constructor(private events: CombatVisualEvent[],private audio: AudioManager){}

    resolve(
        caster: Combatant,
        target: Combatant,
        ability: ActiveAbilityBattle
    ) {

        switch (ability.id) {
            case "strike":
                this.attack(caster, target,caster.stats.damage);
                break;



            case "rotten-bite":
                this.attack(caster,target,caster.stats.damage);

                break;


            case "boar-charge":
                target.statuses.push({id: "stun", label: "Оглушение", duration: 1, stacks: 1})

                break;

        }

    }



    private attack(
        source: Combatant,
        target: Combatant,
        damage: number
    ) {

        this.events.push({
            type: "attack",
            sourceUid: source.id,
            targetUid: target.id
        });

        this.events.push({
            type: "damage",
            targetUid: target.id,
            amount: damage
        });

        target.stats.hp -= damage;
    }
}