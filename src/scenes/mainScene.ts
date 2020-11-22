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

import Dungeon from "@mikewesthad/dungeon";

import { Player } from '../objects/player';
import { Demon } from '../objects/demon';
import { Heart } from '../objects/heart';

export class MainScene extends Phaser.Scene {
    private player: Player;
    private demons: Demon[];
    private heart: Heart;

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
        this.load.image("tiles", 'assets/map-tiles.png');
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

        const dungeon = new Dungeon({
            width: 50,
            height: 50,
            doorPadding: 2,
            rooms: {
                width: {
                    min: 7,
                    max: 15,
                    onlyOdd: true
                },
                height: {
                    min: 7,
                    max: 15,
                    onlyOdd: true
                }
            }
        });

        dungeon.drawToConsole({
            empty: " ",
            emptyColor: "rgb(0, 0, 0)",
            wall: "#",
            wallColor: "rgb(255, 0, 0)",
            floor: "0",
            floorColor: "rgb(210, 210, 210)",
            door: "x",
            doorColor: "rgb(0, 0, 255)",
            fontSize: "8px"
          });

        const map = this.make.tilemap({
            tileWidth: 16,
            tileHeight: 16,
            width: dungeon.width,
            height: dungeon.height 
        });

        const tileset = map.addTilesetImage("spritesheet", "tiles", 16, 16, 0, 0);

        const groundLayer: Phaser.Tilemaps.DynamicTilemapLayer = map.createBlankDynamicLayer("floor", tileset);
        const wallLayer = map.createBlankDynamicLayer("wall", tileset);
        const aboveLayer = map.createBlankDynamicLayer("above", tileset);

        console.log(dungeon.rooms);

        dungeon.rooms.forEach((room, index) => {
            const { x, y, width, height, left, right, top, bottom } = room;

            groundLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, [
                { index: 29, weight: 9 }, // 9/10 times, use index 6
                { index: [30, 31], weight: 1 } // 1/10 times, randomly pick 7, 8 or 26
            ]);

            wallLayer.putTileAt(49, left, top);
            wallLayer.putTileAt(50, right, top);
            wallLayer.putTileAt(64, right, bottom);
            wallLayer.putTileAt(63, left, bottom);

            // Place the non-corner wall tiles using fill with x, y, width, height parameters
            wallLayer.fill(9, left + 1, top + 1, width - 2, 1); // Top
            wallLayer.fill(9, left + 1, bottom, width - 2, 1); // Bottom
            wallLayer.fill(56, left, top + 1, 1, height - 2); // Left
            wallLayer.fill(57, right, top + 1, 1, height - 2); // Right

            aboveLayer.fill(2, left + 1, top, width - 2, 1); // Top
            aboveLayer.fill(2, left + 1, bottom - 1, width - 2, 1); // Bottom

            const doors = room.getDoorLocations();

            console.log(doors);

            for (var i = 0; i < doors.length; i++) {
                if (doors[i].y === 0) { // top

                    groundLayer.putTilesAt([29, 29], x + doors[i].x - 1, y + doors[i].y);

                    if (doors[i].x == 2) {
                        wallLayer.putTilesAt([56, -1, -1, 61], x + doors[i].x - 2, y + doors[i].y);
                    }
                    else {
                        wallLayer.putTilesAt([60, -1, -1, 61], x + doors[i].x - 2, y + doors[i].y);
                    }

                    wallLayer.putTilesAt([-1, -1], x + doors[i].x - 1, y + doors[i].y + 1);
    
                    aboveLayer.removeTileAt(x + doors[i].x - 2, y + doors[i].y);
                    aboveLayer.removeTileAt(x + doors[i].x - 1, y + doors[i].y);
                    aboveLayer.removeTileAt(x + doors[i].x, y + doors[i].y);
                    aboveLayer.removeTileAt(x + doors[i].x + 1, y + doors[i].y);

                } else if (doors[i].y === room.height - 1) { // bottom
                    groundLayer.putTilesAt([29, 29], x + doors[i].x - 1, y + doors[i].y);

                    if (doors[i].x == 2) {
                        wallLayer.putTilesAt([56, -1, -1, 68], x + doors[i].x - 2, y + doors[i].y);
                        aboveLayer.putTilesAt([-1, -1, -1, 51], x + doors[i].x - 2, y + doors[i].y -1);
                    }
                    else {
                        wallLayer.putTilesAt([67, -1, -1, 68], x + doors[i].x - 2, y + doors[i].y);
                        aboveLayer.putTilesAt([52, -1, -1, 51], x + doors[i].x - 2, y + doors[i].y -1);
                    }
                } else if (doors[i].x === 0) { // left
                    groundLayer.putTilesAt([[29], [29]], x + doors[i].x, y + doors[i].y);

                    if (doors[i].y == height - 3) {
                        wallLayer.putTilesAt([[9], [-1], [-1], [9]], x + doors[i].x, y + doors[i].y - 1);
                    }
                    else {
                        wallLayer.putTilesAt([[9], [-1], [-1], [67]], x + doors[i].x, y + doors[i].y - 1);
                    }

                    if (doors[i].y == 2) {
                        aboveLayer.putTilesAt([[2], [-1], [-1], [52]], x + doors[i].x, y + doors[i].y - 2);
                    }
                    else {
                        aboveLayer.putTilesAt([[60], [-1], [-1], [52]], x + doors[i].x, y + doors[i].y - 2);
                    }
                } else if (doors[i].x === room.width - 1) { // right
                    groundLayer.putTilesAt([[29], [29]], x + doors[i].x, y + doors[i].y);

                    if (doors[i].y == height - 3) {
                        wallLayer.putTilesAt([[9], [-1], [-1], [9]], x + doors[i].x, y + doors[i].y - 1);
                    }
                    else {
                        wallLayer.putTilesAt([[9], [-1], [-1], [68]], x + doors[i].x, y + doors[i].y - 1);
                    }

                    if (doors[i].y == 2) {
                        aboveLayer.putTilesAt([[2], [-1], [-1], [51]], x + doors[i].x, y + doors[i].y - 2);
                    }
                    else {
                        aboveLayer.putTilesAt([[61], [-1], [-1], [51]], x + doors[i].x, y + doors[i].y - 2);
                    }
                }
            }

            // this.add.text(room.centerX * 16, room.centerY * 16, `Room ${index}`, {
            //     fontSize: '10px',
            // });
        });

        wallLayer.setCollisionByExclusion([-1]);
        aboveLayer.setDepth(10);

        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // wallLayer.renderDebug(debugGraphics, {
        //     tileColor: null, // Color of non-colliding tiles
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });
 
        // set the boundaries of our game world
        // this.physics.world.bounds.width = groundLayer.width;
        // this.physics.world.bounds.height = groundLayer.height;

        const firstRoom = dungeon.rooms[0];
        console.log(map);

        // create the this.player sprite
        this.player = new Player(this, map.widthInPixels / 2, map.heightInPixels / 2);
        this.physics.add.collider(this.player.sprite, wallLayer);

        const randomRooms = new Set();
        const numDemons = 5;
        while (randomRooms.size !== numDemons) {
            randomRooms.add(Math.floor(Math.random() * (dungeon.rooms.length - 1)) + 1)
        }

        console.log(randomRooms);

        for (const index of Array.from(randomRooms)) {
            const room = dungeon.rooms[index];

            const demon = new Demon(this, room);

            this.demons.push(demon);

            this.physics.add.overlap(this.player.weapon.sprite, demon.sprite, this.demonDie, null, this);
            this.physics.add.overlap(this.player.sprite, demon.sprite, this.playerDamaged, null, this);
        }

        this.heart = new Heart(this);
        this.heart.addHeart();
        this.heart.addHeart();

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player.sprite);

        // set background color, so the sky is not black    
        this.cameras.main.setBackgroundColor('#000'); 

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.restart();
            this.cameras.main.fadeIn(500);
        })

        this.killsDeathsText = this.add.text(138, 0, `Kills: ${this.score.kills} Deaths: ${this.score.deaths}`, {
            fontSize: '10px'
        }).setScrollFactor(0).setDepth(100);

        this.cameras.main.fadeIn(500);
    }

    update(): void {
        if (this.player.sprite.active) {
            this.player.update();
        }

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
    
    demonDie(weapon, demon) {
        this.score.kills++;
        demon.destroy();

        this.demons.splice(this.demons.findIndex(d => d.sprite === demon), 1)

        if (!this.demons.length) {
            this.finish();
        }
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
