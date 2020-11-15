/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @license      Digitsensitive
 */

/// <reference path="./phaser.d.ts"/>

import "phaser";
import { MainScene } from "./scenes/mainScene";

// main game configuration
const config: GameConfig = {
  width: 384,
  height: 256,
  zoom: 2,
  type: Phaser.AUTO,
  parent: "game",
  scene: MainScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  pixelArt: true,
  antialias: false
};

// game class
export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

// when the page is loaded, create our game instance
window.onload = () => {
  var game = new Game(config);
};
 