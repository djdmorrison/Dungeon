import { Weapon } from './weapon';

export class Player {
    scene; jumping; sprite; input; cursors; weapon; flipped; 
    
    maxHealth = 6;
    health;

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
            .setOffset(0, 16)
            .setCollideWorldBounds(true);
    }

    update() {
        this.sprite.setVelocity(0);
        const sprite = this.sprite;
        const velocity = 50;

        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-velocity);
            this.sprite.flipX = true;
            this.flipped = true;
        }
        else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(velocity);
            this.sprite.flipX = false;
            this.flipped = false;
        }

        if (this.cursors.up.isDown) {
            this.sprite.setVelocityY(-velocity);
        }
        else if (this.cursors.down.isDown) {
            this.sprite.setVelocityY(velocity);
        }

        if (this.cursors.space.isDown) {
            this.weapon.swing();
        }

        if (sprite.body.velocity.x !== 0 || sprite.body.velocity.y !== 0) {
            this.sprite.anims.play('hero_run', true);
        } 
        else {
            this.sprite.anims.play("hero_idle", true);
        }

        this.sprite.body.velocity.normalize().scale(velocity);

        this.weapon.update();
    }

    jumpBack() {
        this.sprite.setX(this.sprite.x - 15);

        this.sprite.setTint(0xff0000);
        setTimeout(() => {
            this.sprite.setTint(0xffffff);
        }, 100);
    }

    freeze() {
        this.sprite.body.moves = false;
    }
}