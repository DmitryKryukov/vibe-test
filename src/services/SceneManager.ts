import { GameState } from '@/store/GameState';

export class SceneManager extends Phaser.Plugins.ScenePlugin {
    constructor(scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager) {
        super(scene, pluginManager, 'navigator');
    }

    public startRun(heroId: string, squireId: string): void {
        GameState.startRun(heroId, squireId);

        if (this.systems && this.systems.scenePlugin) {
            this.systems.scenePlugin.start('MapScene');
        }
    }

    public continueRun(): void {
        if (this.systems && this.systems.scenePlugin) {
            this.systems.scenePlugin.start('BattleScene');
        }
    }
}
