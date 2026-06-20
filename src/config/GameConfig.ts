import Phaser from 'phaser';
import '../ui/styles/ColorTokens';
import { COLORTOKEN } from '../ui/styles/ColorTokens';
import { SCENE } from './ScenesConfig';

export const GAME_WIDTH = 1728;
export const GAME_HEIGHT = 879;

export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    parent: 'gameRoot',
    backgroundColor: COLORTOKEN.Background.Zeroth,
    roundPixels: true,
   
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth, 
        height: window.innerHeight,
        zoom: 1
    },

    render: {
        antialias: true,
        antialiasGL: true,
        powerPreference: 'high-performance'
    },

    fps: {
        target: 120,
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

    scene: SCENE,
}