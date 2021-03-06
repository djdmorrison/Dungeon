import { Player } from './player';
import { Room } from "@mikewesthad/dungeon";
import { v4 as uuidv4 } from 'uuid';
import { MainScene } from '../scenes/mainScene';

interface Position {
    x: number;
    y: number;
    mark?: any;
}

export class Demon {
    scene: MainScene;
    sprite; room; idle; 
    
    
    nextPosition: Position;
    speed = 30;
    id = uuidv4();

    constructor(scene, room: Room) {
        this.scene = scene;
        this.room = room;

        const anims = scene.anims;

        anims.create({
            key: 'demon_idle',
            frames: anims.generateFrameNumbers('demon', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        anims.create({
            key: 'demon_run',
            frames: anims.generateFrameNumbers('demon', { start: 4, end: 7 }),
            frameRate: 10
        });

        this.sprite = scene.physics.add
            .sprite(this.room.centerX * 16 + 10, this.room.centerY * 16 + 8, "demon")
            .setSize(16, 16);

        this.sprite.flipX = true;

        this.nextPosition = {
            x: this.sprite.x,
            y: this.sprite.y
        }
    }

    update () {
        if (!this.nextPosition) {
            this.setNextPosition();
        }

        const flooredX = Math.floor(this.sprite.x);
        const flooredY = Math.floor(this.sprite.y);

        if (!this.idle) {
            if (flooredX < this.nextPosition.x) {
                this.sprite.setVelocityX(this.speed);
                this.sprite.flipX = false;
            }
            else if (flooredX > this.nextPosition.x) {
                this.sprite.setVelocityX(-this.speed);
                this.sprite.flipX = true;
            }
            else {
                this.sprite.setVelocityX(0);
            }
            
            if (flooredY < this.nextPosition.y) {
                this.sprite.setVelocityY(this.speed);
            }
            else if (flooredY > this.nextPosition.y) {
                this.sprite.setVelocityY(-this.speed);
            }
            else {
                this.sprite.setVelocityY(0);
            }
    
            if (Math.floor(this.sprite.x) === this.nextPosition.x && Math.floor(this.sprite.y) === this.nextPosition.y) {
                this.setNextPosition();
            }
        }

        if (this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0) {
            this.sprite.anims.play('demon_run', true);
        } 
        else {
            this.sprite.anims.play("demon_idle", true);
        }

        this.sprite.body.velocity.normalize().scale(this.speed);

        // get the tile the sprite is currently on, determine whether it's visible to the player or not, and match 
        const tile = this.scene.layers.groundLayer.getTileAt(this.scene.map.worldToTileX(this.sprite.x), this.scene.map.worldToTileY(this.sprite.y));        

        if (tile.tint === 16777215) {
            this.sprite.visible = true;
            this.sprite.alpha = tile.alpha;
        }
        else {
            this.sprite.visible = false;
        }
    }

    setNextPosition() {
        this.idle = true;

        if (this.nextPosition.mark) {
            this.nextPosition.mark.destroy();
        }

        setTimeout(function() {
            this.nextPosition = {
                x: randomIntFromInterval(this.room.left + 2, this.room.right - 1) * 16, 
                y: randomIntFromInterval(this.room.top + 2, this.room.bottom - 1) * 16
            };
    
            // this.nextPosition.mark = this.scene.add.text(this.nextPosition.x, this.nextPosition.y, `x`, {
            //     fontSize: '10px'
            // })

            this.idle = false;
        }.bind(this), Math.random() * 1000);
    }

    jumpBack() {
        this.sprite.setX(this.sprite.x - 15);

        this.sprite.setTint(0xff0000);
        setTimeout(() => {
            this.sprite.setTint(0xffffff);
        }, 100);
    }
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }