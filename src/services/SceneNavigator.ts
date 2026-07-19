import Phaser from 'phaser';
import { GameState } from '@/store/GameState';
//import { SaveSystem } from '../state/SaveSystem';

export class SceneNavigator {
  constructor(private readonly scene: Phaser.Scene) {}

  public startRun(heroId: string, squireId: string): void {
    GameState.startRun(heroId, squireId);
    //SaveSystem.save();
    this.scene.scene.start('MapScene');
  }

  public continueRun(): void {
    this.scene.scene.start('BattleScene')
    //this.scene.scene.start('GlobalMapScene');
  }

  public openContentEditor(): void {
    //window.location.href = '/content.html';
  }
}
