export class Heart {
    sprites = [];
    scene;
    numHearts = 0;

    constructor(scene) {
        this.scene = scene;
    }

    addHeart() {
        this.numHearts++;
        this.sprites.push(this.scene.physics.add.sprite(32 + (this.numHearts * 16), 32, "heart").setOrigin(0, 0));
    }

    updateHearts(currentHealth) {
        if (currentHealth === 0) {
            this.sprites[0].setFrame(2);
            return;
        }

        if (currentHealth > 0) {
            const heartIndex = currentHealth / 2;

            if (heartIndex % 1 === 0) {
                this.sprites[Math.floor(heartIndex)].setFrame(2);
            }
            else {
                this.sprites[Math.floor(heartIndex)].setFrame(1);
            }
        }
    }
}

