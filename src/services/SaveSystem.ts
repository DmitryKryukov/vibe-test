import { GameState, StoredGameState } from '../store/GameState';

const SAVE_KEY = 'armory-intendant-save';

export class SaveSystem {
    static load(): boolean {
        return true;
        /*
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        try {
          GameState.hydrate(JSON.parse(raw) as StoredGameState);
          return true;
        } catch {
          localStorage.removeItem(SAVE_KEY);
          return false;
        }
          */
    }

    static save(): void {
        localStorage.setItem(SAVE_KEY, JSON.stringify(GameState.state));
    }

    static clear(): void {
        localStorage.removeItem(SAVE_KEY);
        GameState.resetAll();
    }

    static startAutosave(scene: Phaser.Scene): void {
        scene.time.addEvent({ delay: 8000, loop: true, callback: () => SaveSystem.save() });
    }
}
