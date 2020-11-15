/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @license      Digitsensitive
 */

var map;
var cursors;
var groundLayer, coinLayer;
var text;
var jumping = false;

import { Player } from '../objects/player';
import { Demon } from '../objects/demon';
import { Heart } from '../objects/heart';

export class MainScene extends Phaser.Scene {
    private player: Player;
    private demon: Demon;
    private heart: Heart;

    private score = {
        kills: 0,
        deaths: 0
    }

    constructor() {
        super({
            key: "MainScene"
        });
    }

    preload(): void {
        this.load.image("tiles", 'assets/tiles.png');
        this.load.tilemapTiledJSON("map", 'assets/map.json');

        this.load.spritesheet('hero', 'assets/hero.png',
            { frameWidth: 16, frameHeight: 32, spacing: 0, margin: 0 }
        );

        this.load.spritesheet('sword', 'assets/sword.png',
            { frameWidth: 16, frameHeight: 32, spacing: 0, margin: 0 }
        );

        this.load.spritesheet('demon', 'assets/demon.png',
            { frameWidth: 16, frameHeight: 16, spacing: 0, margin: 0 }
        );

        this.load.spritesheet('heart', 'assets/heart.png',
            { frameWidth: 16, frameHeight: 16, spacing: 0, margin: 0 }
        );
    }

    create(): void {
        const map = this.make.tilemap({ key: "map", tileWidth: 16, tileHeight: 16 });
        const tileset = map.addTilesetImage("spritesheet", "tiles");
        const groundLayer = map.createStaticLayer("floor", tileset, 0, 0);
        const wallLayer = map.createStaticLayer("wall", tileset, 0, 0);
        const aboveLayer = map.createStaticLayer("above", tileset, 0, 0);

        wallLayer.setCollisionByExclusion([-1]);
        aboveLayer.setDepth(10);

        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // wallLayer.renderDebug(debugGraphics, {
        //     tileColor: null, // Color of non-colliding tiles
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });
 
        // set the boundaries of our game world
        this.physics.world.bounds.width = groundLayer.width;
        this.physics.world.bounds.height = groundLayer.height;

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // set background color, so the sky is not black    
        this.cameras.main.setBackgroundColor('#000'); 

        // create the this.player sprite    
        this.player = new Player(this, 168, ((groundLayer.height - 32) / 2));
        this.physics.add.collider(this.player.sprite, wallLayer);

        this.demon = new Demon(this, 218, ((groundLayer.height - 16) / 2));

        this.heart = new Heart(this);
        this.heart.addHeart();
        this.heart.addHeart();

        this.physics.add.overlap(this.player.weapon.sprite, this.demon.sprite, this.demonDie, null, this);
        this.physics.add.overlap(this.player.sprite, this.demon.sprite, this.playerDamaged, null, this);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.restart();
            this.cameras.main.fadeIn(500);
        })

        this.add.text(138, 0, `Kills: ${this.score.kills} Deaths: ${this.score.deaths}`, {
            fontSize: '10px'
        });

        this.cameras.main.fadeIn(500);
    }

    update(): void {
        if (this.player.sprite.active) {
            this.player.update();
        }
        
        if (this.demon.sprite.active) {
            this.demon.update();
        }
    }

    finish(): void {
        this.cameras.main.fadeOut(500);
    }
    
    demonDie(weapon, demon) {
        this.score.kills++;
        demon.destroy();
        this.finish();
    }

    playerDamaged(player, demon) {
        this.player.health--;
        this.cameras.main.shake(100, 0.01);

        this.updateHearts();

        if (this.player.health > 0) {
            this.player.jumpBack();
        }
        else {
            this.playerDie(this.player);
        }
    }

    playerDie(player) {
        player.freeze();
        player.sprite.setTint(0xff0000);
        setTimeout(() => {
            player.sprite.destroy();
        }, 50)

        this.score.deaths++;
        this.finish();
    }

    updateHearts() {
        this.heart.updateHearts(this.player.health);
    }
}
