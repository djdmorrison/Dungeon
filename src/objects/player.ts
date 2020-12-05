import { Weapon } from './weapon';

export class Player {
    scene; jumping; sprite; input; cursors; weapon; flipped; bouncing; 
    
    maxHealth = 6;
    health;

    speed = 200;
    immune = false;

    constructor(scene, x, y) {
        this.scene = scene;
        this.weapon = new Weapon(this);
        this.health = 4;

        const anims = scene.anims;
        this.cursors = scene.input.keyboard.createCursorKeys();
        
        anims.create({
            key: 'hero_idle',
            frames: anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        anims.create({
            key: 'hero_run',
            frames: anims.generateFrameNumbers('hero', { start: 4, end: 7 }),
            frameRate: 10
        });

        this.sprite = scene.physics.add
            .sprite(x, y, "hero")
            .setSize(16, 16)
            .setOffset(0, 16);
    }

    update() {
        if (!this.bouncing) {
            if (this.cursors.left.isDown) {
                this.sprite.setVelocityX(-this.speed);
                this.sprite.flipX = true;
                this.flipped = true;
            }
            else if (this.cursors.right.isDown) {
                this.sprite.setVelocityX(this.speed);
                this.sprite.flipX = false;
                this.flipped = false;
            }

            if (this.cursors.up.isDown) {
                this.sprite.setVelocityY(-this.speed);
            }
            else if (this.cursors.down.isDown) {
                this.sprite.setVelocityY(this.speed);
            }

            if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
                this.sprite.setVelocityX(0);

            }

            if (!this.cursors.up.isDown && !this.cursors.down.isDown) {
                this.sprite.setVelocityY(0);
            }
        }

        if (this.cursors.space.isDown) {
            this.weapon.swing();
        }

        this.sprite.body.velocity.normalize().scale(this.speed);

        if (this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0) {
            this.sprite.anims.play('hero_run', true);
        } 
        else {
            this.sprite.anims.play("hero_idle", true);
        }

        this.weapon.update();
    }

    jumpBack() {
        this.bouncing = true;

        this.sprite.setTint(0xff0000);
        setTimeout(() => {
            this.sprite.setTint(0xffffff);
            this.bouncing = false;
        }, 100);
    }

    freeze() {
        this.sprite.body.moves = false;
    }
}