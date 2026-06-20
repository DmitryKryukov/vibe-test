import Phaser from 'phaser';
import './styles/global.css';
import { GameConfig } from './config/GameConfig';
const game = new Phaser.Game(GameConfig);

(window as unknown as { __armoryIntendantGame?: Phaser.Game }).__armoryIntendantGame = game;