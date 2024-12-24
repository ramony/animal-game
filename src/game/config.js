import { AUTO } from 'phaser';
import BootScene from './scenes/BootScene';
import StartScene from './scenes/StartScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import EndScene from './scenes/EndScene';
import LevelComplete from './scenes/LevelComplete';

export const gameConfig = {
  type: AUTO,
  parent: 'game-content',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, StartScene, MenuScene, GameScene, EndScene, LevelComplete]
};
