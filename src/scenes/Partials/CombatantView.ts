import Phaser from 'phaser';
import { Combatant, CombatSystem } from '@/services/CombatSystem';
import { GameState } from '@/store/GameState';
import { Heroes } from '@/data/Heroes';

import { Enemies, EnemyScheme } from '@/data/Enemies';
import { StatusInfo } from '@/data/Statuses';
import { anyToColor } from '@/utils/UtilsColor';
import { HPBar } from './HPBar';
import { StatusBar } from './StatusBar';

export interface CombatantViewScheme {
    textureKey: string;

    width: number;
    height: number;

    scale?: number;

    offsetX?: number;
    offsetY?: number;

    statusBarX?: number;
    statusBarY?: number;

    type?: 'hero' | 'enemy';
}


export class CombatantView {
    public readonly id: string;
    public sprite!: Phaser.GameObjects.Image;
    public zone!: Phaser.GameObjects.Zone;

    private readonly scene: Phaser.Scene;
    private readonly combatant: Combatant;
    private readonly combatantViewScheme: CombatantViewScheme;

    private readonly root: Phaser.GameObjects.Container;
    public hpBar: HPBar | null = null;
    public statusBar: StatusBar | null = null;
    public statusBarAnchor!: Phaser.GameObjects.Arc;

    constructor(scene: Phaser.Scene, combatant: Combatant, x: number, y: number, combatantViewScheme: CombatantViewScheme, renderHPBar: boolean = true, renderStatusBar: boolean = true) {
        this.scene = scene;
        this.combatant = combatant;
        this.id = combatant.id;
        this.root = this.scene.add.container(0, 0);
        this.combatantViewScheme = combatantViewScheme;
        this.renderCombatant(combatant, x, y, renderHPBar, renderStatusBar)
    }

    private renderCombatant(combatant: Combatant, x: number, y: number, renderHPBar: boolean, renderStatusBar: boolean): void {
        const scheme = this.combatantViewScheme;
        const spriteX = x + (scheme.offsetX ?? 0);
        const spriteY = y + (scheme.offsetY ?? 0);
        const scale = scheme.scale ?? 1;
        const width = scheme.width * scale;
        const height = scheme.height * scale;
        const anchor = this.scene.add.circle(spriteX, spriteY, 5, anyToColor('#ff00ff'))
        this.statusBarAnchor = this.scene.add.circle(x + (scheme.statusBarX ?? 0), y + (scheme.statusBarY ?? 0), 5, anyToColor('#ff0000'))

        this.sprite = this.scene.add.image(spriteX, spriteY, scheme.textureKey)
            .setDisplaySize(width, height)
            .setDepth(10);

        this.zone = this.scene.add.zone(spriteX, spriteY, width, height)
            .setRectangleDropZone(width, height);
        if (renderHPBar) {

            this.hpBar = new HPBar(this.scene, this, this.combatantViewScheme.type, this.combatant, x, y);
        }        
        if (renderStatusBar) {
            this.statusBar = new StatusBar(this.scene, this, this.combatant);
        }
        

        this.root.add([
            this.sprite,
            this.zone,
            anchor
        ]);
    }

    public destroy(): void {
        this.root.destroy(true);
        if (this.hpBar) this.hpBar?.destroy();
        if (this.statusBar) this.statusBar?.destroy();
    }

}

