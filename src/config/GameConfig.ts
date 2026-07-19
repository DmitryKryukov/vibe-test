import Phaser from 'phaser';
import '../ui/styles/ColorTokens';
import { COLORTOKEN } from '../ui/styles/ColorTokens';
import AudioManager from '../services/AudioManager';
import { SCENE } from './ScenesConfig';

export const GAME_WIDTH = 1728;
export const GAME_HEIGHT = 879;

export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    parent: 'gameRoot',
    backgroundColor: COLORTOKEN.Background.Zeroth,
   
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth * 1, 
        height: window.innerHeight * 1,
        zoom: 2,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    render: {
        antialias: true,
        antialiasGL: true,
        roundPixels: true,
        pixelArt: true,
        powerPreference: 'high-performance'
    },

    fps: {
        target: 120 ,
        forceSetTimeOut: true
    },

    input: {
        activePointers: 2,
        smoothFactor: 0
    },

    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    plugins: {
        global: [
            { 
                key: 'AudioManager', 
                plugin: AudioManager, 
                start: true,
                mapping: 'audioManager'
            }
        ]
    },

    scene: SCENE,
}