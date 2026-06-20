import Phaser from 'phaser';
import '../ui/styles/ColorTokens';
import { COLORTOKEN } from '../ui/styles/ColorTokens';
import { SCENE } from './ScenesConfig';

export const GAME_WIDTH = 1728;
export const GAME_HEIGHT = 1117;

export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    parent: 'gameRoot',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: COLORTOKEN.Background.Zeroth,

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true
    },

    render: {
        antialias: true,
        antialiasGL: true,
        roundPixels: true,
        pixelArt: false,
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