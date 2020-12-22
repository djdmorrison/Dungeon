import { Player } from './player';

export class Weapon {
    player; swinging; initialRotation; rotation; 
    sprite: Phaser.GameObjects.Sprite;

    constructor(player) {
        this.player = player;
        this.sprite = this.player.scene.physics.add.sprite(0, 0, "sword")
            .setSize(16, 16)
            .setVisible(false)
            .setOrigin(0.5, 1)
            .setDepth(20);
        this.swinging = false;
        this.initialRotation = 40;
    }

    swing() {
        if (!this.swinging) {
            this.updatePosition();
            this.updateRotation();

            this.swinging = true;
            this.rotation = 0;
            this.sprite.setVisible(true);
        }
    }

    update () {
        if (this.swinging) {
            this.updatePosition();
            this.updateRotation();

            if (this.rotation > 80) {
                this.swinging = false;
                this.sprite.setVisible(false);
            }
        }
    }

    updatePosition () {
        if (this.player.flipped) {
            this.sprite.setPosition(this.player.sprite.x - 4, this.player.sprite.y + 9);
        }
        else {
            this.sprite.setPosition(this.player.sprite.x + 4, this.player.sprite.y + 9);
        }
    }

    updateRotation () {
        let newAngle = this.initialRotation + this.rotation;

        if (this.player.flipped) {
            newAngle *= -1
        }

        this.sprite.setAngle(newAngle);
        this.rotation += 5;
    }
}
