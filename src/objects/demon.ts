import { Player } from './player';

export class Demon {
    scene; sprite; hit; hitOverlap;

    constructor(scene, x, y) {
        this.scene = scene;
        this.hit = false;

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
            .sprite(x, y, "demon")
            .setSize(16, 16)
            .setCollideWorldBounds(true);

        this.sprite.flipX = true;
    }

    update () {
        if (this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0) {
            this.sprite.anims.play('demon_run', true);
        } 
        else {
            this.sprite.anims.play("demon_idle", true);
        }
    }

    overlap () {
        // this.scene.physics.removeCollider(this.hitOverlap);

        console.log(this.sprite.destroy());

        console.log('OVERLAP');
    }
}