import Dungeon from "@mikewesthad/dungeon";

import { DungeonGenerator, Layers } from './dungeonGenerator';
import TilemapVisibility from "./tileMapVisibility";

import { Player } from '../objects/player';
import { Demon } from '../objects/demon';
import { Heart } from '../objects/heart';


export class MainScene extends Phaser.Scene {
    private player: Player;
    private demons: Demon[];
    private heart: Heart;
    private dungeon: Dungeon;
    private map: Phaser.Tilemaps.Tilemap;
    private layers: Layers;
    private tilemapVisibility: TilemapVisibility;

    killsDeathsText;

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
        this.load.image("tiles", 'assets/map-tiles-extruded.png');
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
        this.demons = [];

        const dungeonGenerator = new DungeonGenerator(this);
        const { dungeon, layers, map } = dungeonGenerator.generate();

        this.dungeon = dungeon;
        this.layers = layers;
        this.map = map;

        this.tilemapVisibility = new TilemapVisibility(layers.shadowLayer);
        
        this.createPlayer();
        this.createDemons();
        this.createHearts();
        this.setupCameras();
        
        this.layers.wallLayer.setCollisionByExclusion([-1]);

        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // wallLayer.renderDebug(debugGraphics, {
        //     tileColor: null, // Color of non-colliding tiles
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });

        // this.dungeon.drawToConsole({
        //     empty: " ",
        //     emptyColor: "rgb(0, 0, 0)",
        //     wall: "#",
        //     wallColor: "rgb(255, 0, 0)",
        //     floor: "0",
        //     floorColor: "rgb(210, 210, 210)",
        //     door: "x",
        //     doorColor: "rgb(0, 0, 255)",
        //     fontSize: "8px"
        //   });

        this.killsDeathsText = this.add.text(138, 0, `Kills: ${this.score.kills} Deaths: ${this.score.deaths}`, {
            fontSize: '10px'
        }).setScrollFactor(0).setDepth(100);

        this.cameras.main.fadeIn(500);
    }

    update(): void {
        if (this.player.sprite.active) {
            this.player.update();
        }
          
        // Find the player's room using another helper method from the dungeon that converts from
        // dungeon XY (in grid units) to the corresponding room instance
        const playerTileX = this.layers.groundLayer.worldToTileX(this.player.sprite.x);
        const playerTileY = this.layers.groundLayer.worldToTileY(this.player.sprite.y);
        const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);
        
        this.tilemapVisibility.setActiveRoom(playerRoom);

        this.demons.forEach(demon => {
            if (demon.sprite.active) {
                demon.update();
            }
        })

        this.killsDeathsText.setText(`Kills: ${this.score.kills} Deaths: ${this.score.deaths}`);
    }

    finish(): void {
        this.cameras.main.fadeOut(500);
    }

    createPlayer() {
        this.player = new Player(this, this.map.widthInPixels / 2, this.map.heightInPixels / 2);
        this.physics.add.collider(this.player.sprite, this.layers.wallLayer);
    }

    createDemons() {
        const randomRooms = new Set();
        const numDemons = Math.ceil(this.dungeon.rooms.length / 4);
        console.log(numDemons);

        while (randomRooms.size !== numDemons) {
            randomRooms.add(Math.floor(Math.random() * (this.dungeon.rooms.length - 1)) + 1)
        }

        for (const index of Array.from(randomRooms)) {
            const room = this.dungeon.rooms[index];

            const demon = new Demon(this, room);

            this.demons.push(demon);

            this.physics.add.overlap(this.player.weapon.sprite, demon.sprite, this.demonDie, null, this);
            this.physics.add.overlap(this.player.sprite, demon.sprite, this.playerDamaged, null, this);
        }
    }

    createHearts() {
        this.heart = new Heart(this);
        this.heart.addHeart();
        this.heart.addHeart();
    }

    setupCameras() {
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player.sprite);

        this.cameras.main.setBackgroundColor('#000'); 

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.restart();
            this.cameras.main.fadeIn(500);
        })
    }

    generateDungeonRooms() {
        
    }
    
    demonDie(weapon, demon) {
        this.score.kills++;
        demon.body.enable = false;
        demon.setFrame(1)

        demon.setTint(0xff0000);

        this.demons.splice(this.demons.findIndex(d => d.sprite === demon), 1)
        if (!this.demons.length) {
            this.finish();
        }

        setTimeout(() => {
            demon.destroy(); 
        }, 100);
    }

    playerDamaged(player, demon) {
        const xDiff = player.x - demon.x;
        const yDiff = player.y - demon.y;
        const maxDiff = 5;

        if (xDiff < -maxDiff) {
            player.setVelocityX(-this.player.speed);
        }
        if (xDiff > maxDiff) {
            player.setVelocityX(this.player.speed);
        }
        if (yDiff > maxDiff) {
            player.setVelocityY(this.player.speed);
        }
        if (yDiff < -maxDiff) {
            player.setVelocityY(-this.player.speed);
        }

        if (!this.player.immune) {
            this.player.immune = true;

            setTimeout(() => {
                this.player.immune = false;
            }, 500);    

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
