import Dungeon from "@mikewesthad/dungeon";
import { Mrpas } from 'mrpas'


import { DungeonGenerator, Layers } from './dungeonGenerator';
// import TilemapVisibility from "./tileMapVisibility";


import { Player } from '../objects/player';
import { Demon } from '../objects/demon';
import { Heart } from '../objects/heart';


export class MainScene extends Phaser.Scene {

    private debug: boolean = false;

    private player: Player;
    private demons: Demon[];
    private heart: Heart;
    private dungeon: Dungeon;
    public map: Phaser.Tilemaps.Tilemap;
    public layers: Layers;
    // private tilemapVisibility: TilemapVisibility;

    private vistedTiles: Set<Phaser.Tilemaps.Tile> = new Set();

    private fov: Mrpas;

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
    

    init(): void {

        
        // this.game.debug.inputInfo(32, 32);
    }

    preload(): void {
        this.input.keyboard.on('keydown-' + 'D', function (event) { this.debug = !this.debug; });

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

        // this.tilemapVisibility = new TilemapVisibility(layers.shadowLayer);

        this.fov = new Mrpas(this.map.width, this.map.height, (x, y) => {
            const tile = this.layers.groundLayer.getTileAt(x, y)
            
            if (tile) {
                return tile && !tile.collides
            }

            const wallTile = this.layers.groundLayer.getTileAt(x, y)

            return wallTile && !wallTile.collides;
        })
        
        console.log(this.fov);
        
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
        this.computeFOV();

        // console.log(this.game.config.physics.arcade.debug);
        this.game.config.physics.arcade.debug = false;

        // this.game.debug;
        if (this.player.sprite.active) {
            this.player.update();
        }
          
        // Find the player's room using another helper method from the dungeon that converts from
        // dungeon XY (in grid units) to the corresponding room instance
        const playerTileX = this.layers.groundLayer.worldToTileX(this.player.sprite.x);
        const playerTileY = this.layers.groundLayer.worldToTileY(this.player.sprite.y);
        const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);
        
        // this.tilemapVisibility.setActiveRoom(playerRoom);

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

    computeFOV(){
        if (!this.fov || !this.map || !this.layers.groundLayer || !this.player)
        {
            return
        }

        // get camera view bounds
        const camera = this.cameras.main
        const bounds = new Phaser.Geom.Rectangle(
            this.map.worldToTileX(camera.worldView.x) - 1,
            this.map.worldToTileY(camera.worldView.y) - 1,
            this.map.worldToTileX(camera.worldView.width) + 2,
            this.map.worldToTileX(camera.worldView.height) + 3
        )

        // set all tiles within camera view to invisible
        for (let y = bounds.y; y < bounds.y + bounds.height; y++)
        {
            for (let x = bounds.x; x < bounds.x + bounds.width; x++)
            {
                if (y < 0 || y >= this.map.height || x < 0 || x >= this.map.width)
                {
                    continue
                }

                const tile = this.layers.groundLayer.getTileAt(x, y)
                const wallTile = this.layers.wallLayer.getTileAt(x, y)
                const aboveTile = this.layers.aboveLayer.getTileAt(x, y)
                if (!tile && !wallTile && !aboveTile)
                {
                    continue
                }

                if (tile) {
                    tile.alpha = this.vistedTiles.has(tile) ? 1 : 0;
                    tile.tint = Phaser.Display.Color.GetColor(64, 64, 64)
                }
                if (wallTile) {
                    wallTile.alpha = this.vistedTiles.has(wallTile) ? 1 : 0;
                    wallTile.tint = Phaser.Display.Color.GetColor(64, 64, 64)
                }
                if (aboveTile) {
                    aboveTile.alpha = this.vistedTiles.has(aboveTile) ? 1 : 0;
                    aboveTile.tint = Phaser.Display.Color.GetColor(64, 64, 64)
                }
            }
        }

        // get player's position
        const px = this.map.worldToTileX(this.player.sprite.x)
        const py = this.map.worldToTileY(this.player.sprite.y)
        
        // compute fov from player's position
        this.fov.compute(
            px,
            py,
            7,
            (x, y) => {
                const tile = this.layers.groundLayer.getTileAt(x, y)
                const wallTile = this.layers.wallLayer.getTileAt(x, y)
                const aboveTile = this.layers.aboveLayer.getTileAt(x, y)

                if (!tile && !wallTile && !aboveTile) {
                    return false
                }

                return (tile && tile.tint === 0xffffff) || (wallTile && wallTile.tint === 0xffffff) || (aboveTile && aboveTile.tint === 0xffffff)
            },
            (x, y) => {
                const tile = this.layers.groundLayer.getTileAt(x, y)
                const wallTile = this.layers.wallLayer.getTileAt(x, y)
                const aboveTile = this.layers.aboveLayer.getTileAt(x, y - 1)

                if (!tile && !wallTile && !aboveTile) {
                    return false
                }

                const d = Phaser.Math.Distance.Between(py, px, y, x)
                const alpha = Math.min(2 - d / 4, 1)

                if (tile) {
                    tile.tint = 0xffffff
                    tile.alpha =  alpha

                    this.vistedTiles.add(tile);
                }
                if (wallTile) { 
                    wallTile.tint = 0xffffff
                    wallTile.alpha =  alpha

                    this.vistedTiles.add(wallTile);
                }
                if (aboveTile) { 
                    aboveTile.tint = 0xffffff
                    aboveTile.alpha =  alpha

                    this.vistedTiles.add(aboveTile);
                }
            }
        )
    }

    createPlayer() {
        this.player = new Player(this, this.map.widthInPixels / 2, this.map.heightInPixels / 2);
        this.physics.add.collider(this.player.sprite, this.layers.wallLayer);
    }

    createDemons() {
        const randomRooms = new Set();
        const numDemons = Math.ceil(this.dungeon.rooms.length / 4);

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
    
    demonDie(weapon, demon) {
        if (!weapon.visible) {
            return;
        }

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
        const dx = player.x - demon.x;
        const dy = player.y - demon.y;

        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(20);

        player.setVelocity(dir.x, dir.y);

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
