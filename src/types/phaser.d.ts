import { SceneNavigator } from '@/plugins/SceneNavigator';
import { AudioManager } from '@/services/AudioManager';

declare module 'phaser' {
    interface Scene {
        //navigator: SceneNavigator;
        audio: AudioManager;
    }
}