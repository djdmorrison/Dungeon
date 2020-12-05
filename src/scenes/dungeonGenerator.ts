import Dungeon from "@mikewesthad/dungeon";

import { TILE_MAPPING } from '../config/tiles';

export interface Layers {
    groundLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    wallLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    aboveLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    shadowLayer: Phaser.Tilemaps.DynamicTilemapLayer;
}

export class DungeonGenerator {
    private dungeon: Dungeon;
    private layers: Layers;
    private scene: Phaser.Scene;

    constructor(scene) {
        this.scene = scene;
    }

    generate() {
        const dungeon = new Dungeon({
            width: 50,
            height: 50,
            doorPadding: 2,
            rooms: {
                width: {
                    min: 7,
                    max: 13,
                    onlyOdd: true
                },
                height: {
                    min: 7,
                    max: 13,
                    onlyOdd: true
                },
                maxRooms: 15,
                maxArea: 100
            }
        });

        const map = this.scene.make.tilemap({
            tileWidth: 16,
            tileHeight: 16,
            width: dungeon.width,
            height: dungeon.height 
        });

        const tileset = map.addTilesetImage("spritesheet", "tiles", 16, 16, 1, 2);

        const layers = {
            groundLayer: map.createBlankDynamicLayer("floor", tileset),
            wallLayer: map.createBlankDynamicLayer("wall", tileset),
            aboveLayer: map.createBlankDynamicLayer("above", tileset),
            shadowLayer: map.createBlankDynamicLayer("Shadow", tileset)
        }

        dungeon.rooms.forEach((room, index) => {
            const { x, y, width, height, left, right, top, bottom } = room;

            layers.groundLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, TILE_MAPPING.FLOOR);

            layers.wallLayer.putTileAt(49, left, top);
            layers.wallLayer.putTileAt(50, right, top);
            layers.wallLayer.putTileAt(64, right, bottom);
            layers.wallLayer.putTileAt(63, left, bottom);

            // Place the non-corner wall tiles using fill with x, y, width, height parameters
            layers.wallLayer.weightedRandomize(left + 1, top + 1, width - 2, 1, TILE_MAPPING.WALL); // Top
            layers.wallLayer.weightedRandomize(left + 1, bottom, width - 2, 1, TILE_MAPPING.WALL); // Bottom
            layers.wallLayer.fill(56, left, top + 1, 1, height - 2); // Left
            layers.wallLayer.fill(57, right, top + 1, 1, height - 2); // Right

            layers.aboveLayer.fill(2, left + 1, top, width - 2, 1); // Top
            layers.aboveLayer.fill(2, left + 1, bottom - 1, width - 2, 1); // Bottom

            const doors = room.getDoorLocations();

            for (var i = 0; i < doors.length; i++) {
                if (doors[i].y === 0) { // top

                    layers.groundLayer.putTilesAt([29, 29], x + doors[i].x - 1, y + doors[i].y);

                    if (doors[i].x == 2) {
                        layers.wallLayer.putTilesAt([56, -1, -1, 61], x + doors[i].x - 2, y + doors[i].y);
                    }
                    else {
                        layers.wallLayer.putTilesAt([60, -1, -1, 61], x + doors[i].x - 2, y + doors[i].y);
                    }

                    layers.wallLayer.putTilesAt([-1, -1], x + doors[i].x - 1, y + doors[i].y + 1);

                    layers.aboveLayer.removeTileAt(x + doors[i].x - 2, y + doors[i].y);
                    layers.aboveLayer.removeTileAt(x + doors[i].x - 1, y + doors[i].y);
                    layers.aboveLayer.removeTileAt(x + doors[i].x, y + doors[i].y);
                    layers.aboveLayer.removeTileAt(x + doors[i].x + 1, y + doors[i].y);

                } else if (doors[i].y === room.height - 1) { // bottom
                    layers.groundLayer.putTilesAt([29, 29], x + doors[i].x - 1, y + doors[i].y);

                    if (doors[i].x == 2) {
                        layers.wallLayer.putTilesAt([56, -1, -1, 68], x + doors[i].x - 2, y + doors[i].y);
                        layers.aboveLayer.putTilesAt([-1, -1, -1, 51], x + doors[i].x - 2, y + doors[i].y - 1);
                    }
                    else {
                        layers.wallLayer.putTilesAt([67, -1, -1, 68], x + doors[i].x - 2, y + doors[i].y);
                        layers.aboveLayer.putTilesAt([52, -1, -1, 51], x + doors[i].x - 2, y + doors[i].y - 1);
                    }
                } else if (doors[i].x === 0) { // left
                    layers.groundLayer.putTilesAt([[29], [29]], x + doors[i].x, y + doors[i].y);

                    if (doors[i].y == height - 3) {
                        layers.wallLayer.putTilesAt([[9], [-1], [-1], [9]], x + doors[i].x, y + doors[i].y - 1);
                    }
                    else {
                        layers.wallLayer.putTilesAt([[9], [-1], [-1], [67]], x + doors[i].x, y + doors[i].y - 1);
                    }

                    if (doors[i].y == 2) {
                        layers.aboveLayer.putTilesAt([[2], [-1], [-1], [52]], x + doors[i].x, y + doors[i].y - 2);
                    }
                    else {
                        layers.aboveLayer.putTilesAt([[60], [-1], [-1], [52]], x + doors[i].x, y + doors[i].y - 2);
                    }
                } else if (doors[i].x === room.width - 1) { // right
                    layers.groundLayer.putTilesAt([[29], [29]], x + doors[i].x, y + doors[i].y);

                    if (doors[i].y == height - 3) {
                        layers.wallLayer.putTilesAt([[9], [-1], [-1], [9]], x + doors[i].x, y + doors[i].y - 1);
                    }
                    else {
                        layers.wallLayer.putTilesAt([[9], [-1], [-1], [68]], x + doors[i].x, y + doors[i].y - 1);
                    }

                    if (doors[i].y == 2) {
                        layers.aboveLayer.putTilesAt([[2], [-1], [-1], [51]], x + doors[i].x, y + doors[i].y - 2);
                    }
                    else {
                        layers.aboveLayer.putTilesAt([[61], [-1], [-1], [51]], x + doors[i].x, y + doors[i].y - 2);
                    }
                }
            }

            // TODO: Don't overlap doors
            if (Math.random() > 0.5) {
                if (width > 3) {                    
                    layers.wallLayer.weightedRandomize(x + Math.floor(width / 2), top + 1, 1, 1, [
                        { index: [15, 16, 22, 23], weight: 2.5 }
                    ])
                }
            }

            // this.add.text(room.centerX * 16, room.centerY * 16, `Room ${index}`, {
            //     fontSize: '10px',
            // });
        });

        layers.shadowLayer.fill(0);

        layers.aboveLayer.setDepth(10);
        layers.shadowLayer.setDepth(99);

        return {
            dungeon, layers, map
        }
    }
}
