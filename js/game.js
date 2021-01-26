let titleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function titleScene() {
            Phaser.Scene.call(this, { key: 'titleScene' });
        },

    preload: function () {
        this.load.image('bg', 'images/titleScreen.png');
        this.load.image('title', 'images/title.png');
        this.load.image('decor', 'images/feather.png');
    },

    create: function () {
        this.add.image(400, 300, 'bg');
        this.decor = this.add.image(400, 323, 'decor');
        this.add.image(400, 100, 'title');
        this.add.text(320, 150, `Wander The Shadows`);
        this.add.text(340, 500, `Click to Start`);

        this.decor.setScale(0.315);

        this.input.once('pointerdown', function () {
            this.cameras.main.fade(250);
            this.cameras.main.on('camerafadeoutcomplete', function (camera, effect) {
                this.scene.start('gameScene');
            }, this);

        }, this);

    },
    update: function (time, delta) {
        this.decor.rotation += 0.005;
    }
});

let gameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function gameScene() {
            Phaser.Scene.call(this, { key: 'gameScene' });

            // Player variables
            this.alive = true;
            this.speed = 350;
            this.jumpHeight = 450;
            this.direction = 'STANDING';
            this.inAir = false;
            this.jumpReleased = true;
        },

    preload: function () {
        this.load.image('bg', 'images/titleScreen.png');
        this.load.image('title', 'images/title.png');
        this.load.image('player', 'images/sprites/player_still_crossarmed.png');
        this.load.image('platform', 'images/sprites/platform.png');
    },

    platformCreator: function () {
        return {
            key: 'platform',
            repeat: 10, // Number of platforms
            setXY: {
                x: -1000, // Starting Point
                y: 500,
                stepX: 850, // Offset direction
                stepY: 0
            },
            setScale: {
                x: 5,
                y: 1
            }
        };
    },

    create: function () {
        // Player Create
        this.player = this.physics.add.sprite(0, 450, 'player');
        this.player.setBounce(0.05);
        this.player.setPipeline('Light2D');

        // Light
        this.playerLight = this.lights.addLight(0, 0, 250).setIntensity(2);
        this.lights.enable().setAmbientColor(0x000000);

        // Platforms
        this.platforms = this.physics.add.staticGroup(this.platformCreator());

        Phaser.Actions.Call(this.platforms.getChildren(), platform => {
            platform.setPipeline('Light2D');
            platform.refreshBody();
        }, this);

        this.physics.add.collider(this.player, this.platforms);

        //  Create our keyboard controls
        cursors = this.input.keyboard.createCursorKeys();
        aKeyObj = this.input.keyboard.addKey('A');
        dKeyObj = this.input.keyboard.addKey('D');
        wKeyObj = this.input.keyboard.addKey('W');
        sKeyObj = this.input.keyboard.addKey('S');
        spaceKeyObj = this.input.keyboard.addKey('SPACE');

        // Camera
        //this.cameras.main.setBounds(0, 0, 720 * 2, 176);
        this.cameras.main.startFollow(this.player, true);
    },

    update: function (time, delta) {
        // Set player collision
        // let playerRect = this.player.getBounds();

        // Handle player movement
        this.playerHandler();

        if (this.player.y > 850) {
            this.gameOver();
        }

    },

    playerHandler: function () {
        // Left
        if ((cursors.left.isDown || aKeyObj.isDown) && this.player.body.touching.down) {
            this.direction = 'LEFT';
        }

        // Right
        if ((cursors.right.isDown || dKeyObj.isDown) && this.player.body.touching.down) {
            this.direction = 'RIGHT';
        }

        // Jump
        if (this.jumpReleased && (cursors.up.isDown || spaceKeyObj.isDown || wKeyObj.isDown) && this.player.body.touching.down) {
            this.jump();
            this.jumpReleased = false;
        }
        if (cursors.up.isUp && spaceKeyObj.isUp && wKeyObj.isUp && this.player.body.touching.down)
            this.jumpReleased = true;

        // In Air Handler
        if (this.player.body.touching.down) {
            this.inAir = false;
        } else {
            this.inAir = true;
        }

        // Crouch
        if (cursors.down.isDown || sKeyObj.isDown) {
            this.direction = "CROUCH";
        }

        // Standing in place or jumping in place
        if (((cursors.right.isUp && cursors.left.isUp) && (aKeyObj.isUp && dKeyObj.isUp)) && this.player.body.touching.down || ((cursors.right.isDown && cursors.left.isDown) || (aKeyObj.isDown && dKeyObj.isDown) && this.player.body.touching.down)) {
            this.direction = "STANDING";
        }


        this.move(this.direction);

        // Set Light Position
        this.playerLight.x = this.player.x;
        this.playerLight.y = this.player.y;
    },

    move: function (direction) {
        if (direction === 'LEFT') {
            this.player.setVelocityX(-this.speed);
            this.player.flipX = true;
        }
        else if (direction === 'RIGHT') {
            this.player.setVelocityX(this.speed);
            this.player.flipX = false;
        }
        else if (direction === 'STANDING') {
            this.player.setVelocityX(0);
        }
    },

    jump: function () {
        this.player.body.setVelocityY(-this.jumpHeight);
    },

    gameOver: function () {
        this.cameras.main.fade(750);
        this.cameras.main.on('camerafadeoutcomplete', function (camera, effect) {
            this.playerLight.setIntensity(0);
            this.scene.stop();
            this.scene.start('endScene');
        }, this);
    }
});

let endScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function endScene() {
            Phaser.Scene.call(this, { key: 'endScene' });
        },

    preload: function () {
        this.load.image('bg', 'images/titleScreen.png');
    },

    create: function () {
        this.add.text(360, 150, `GAME OVER`);
        this.add.text(320, 500, `Click to try again`);

        this.input.once('pointerdown', function () {
            this.cameras.main.fade(250);
            this.cameras.main.on('camerafadeoutcomplete', function (camera, effect) {
                this.scene.start('gameScene');
            }, this);

        }, this);

    },
    update: function (time, delta) {

    }


});

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    scene: [titleScene, gameScene, endScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                y: 700
            },
        },
    },
};

let game = new Phaser.Game(config);