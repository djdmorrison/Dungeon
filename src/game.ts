import "phaser";
import { MainScene } from "./scenes/mainScene";

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

export class Game extends Phaser.Game {
    constructor(config: GameConfig) {
        super(config);
    }
}

window.onload = () => {
    var game = new Game(config);
};
