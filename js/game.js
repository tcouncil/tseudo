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
        this.add.text(315, 500, `Press Space to Start`);

        this.decor.setScale(0.315);

        spaceKeyObj = this.input.keyboard.addKey('SPACE');
        this.spacePressed = false;
    },
    update: function (time, delta) {
        this.decor.rotation += 0.005;

        if (spaceKeyObj.isDown && !this.spacePressed) {
            this.spacePressed = true;
            this.cameras.main.fade(250);
            this.cameras.main.on('camerafadeoutcomplete', function (camera, effect) {
                this.scene.start('gameScene');
            }, this);
        }
    }
});

let gameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function gameScene() {
            Phaser.Scene.call(this, { key: 'gameScene' });


        },

    preload: function () {
        this.load.image('bg', 'images/titleScreen.png');
        this.load.image('title', 'images/title.png');
        this.load.image('player', 'images/sprites/player_still_crossarmed.png');
        this.load.image('platform', 'images/sprites/platform.png');
        this.load.image('orb', 'images/sprites/insight.png');
    },

    generateLevel: function () {
        const getRandomInt = (max) => {
            return Math.floor(Math.random() * Math.floor(max));
        }

        // Constant Variables
        const basePlatformAmount = 10;

        // Generate Random Numbers
        const numberOfPlatforms = getRandomInt(15) + basePlatformAmount;

        // Orbs // Declare A Static Group
        this.orbs = this.physics.add.staticGroup();

        // Platforms // Declare A Static Group
        this.platforms = this.physics.add.staticGroup();
        this.platformCreator(numberOfPlatforms); // Platforms Generation

        Phaser.Actions.Call(this.platforms.getChildren(), platform => {
            platform.setPipeline('Light2D');
            platform.refreshBody();
        }, this);

        Phaser.Actions.Call(this.orbs.getChildren(), orb => {
            orb.setPipeline('Light2D');
            orb.refreshBody();
        }, this);

    },

    platformCreator: function (numberOfPlatforms) {
        const getRandomInt = (max) => {
            return Math.floor(Math.random() * Math.floor(max));
        }

        // Main Starting Platform
        this.platforms.create(0, 500, 'platform').setScale(5, 1);

        // Minimum Distance between platforms 
        const minX = 96, minY = 96;

        // Previous platform variables
        let posX = 0, posY = 500;

        // Generator
        for (let i = 0; i < numberOfPlatforms; i++) {
            // New position
            posX = posX + getRandomInt(96) + minX;
            posY = posY - getRandomInt(96) - minY;

            const bool1 = getRandomInt(2) === 1 ? true : false;
            const bool2 = getRandomInt(2) === 1 ? true : false;
            const bool3 = getRandomInt(2) === 1 ? true : false;
            console.log(`${bool1} ${bool2} ${bool3}`);

            //console.log(`Platform #${i} generated at ${posX} ${posY}`);

            // Right side of the level
            this.platforms.create(posX, posY, 'platform');

            // Creates set of 3 orbs on the platform
            if (bool1) {
                if (bool3)
                    this.orbs.create(posX, posY - 32, 'orb').setScale(0.5);
                if (bool2) {
                    this.orbs.create(posX + 32, posY - 32, 'orb').setScale(0.5);
                    this.orbs.create(posX - 32, posY - 32, 'orb').setScale(0.5);
                }
            }

            // Left side of the level
            this.platforms.create(-posX, posY, 'platform');

            // Creates set of 3 orbs on the platform
            if (!bool1) {
                if (!bool3)
                    this.orbs.create(-posX, posY - 32, 'orb').setScale(0.5);
                if (!bool2) {
                    this.orbs.create(-posX + 32, posY - 32, 'orb').setScale(0.5);
                    this.orbs.create(-posX - 32, posY - 32, 'orb').setScale(0.5);
                }
            }
        }
    },

    create: function () {
        // Player Create
        this.player = this.physics.add.sprite(0, 450, 'player');
        this.player.setBounce(0.05);
        this.player.setPipeline('Light2D');

        // Player variables
        this.alive = true;
        this.speed = 350;
        this.jumpHeight = 550;
        this.direction = 'STANDING';
        this.inAir = false;
        this.jumpReleased = true;
        this.score = 0;
        this.level = 1;
        this.insight = 0;
        timeNumber = 0;

        // Light
        this.playerLight = this.lights.addLight(0, 0, 250).setIntensity(2);
        this.lights.enable().setAmbientColor(0x000000);

        // Generate Level
        this.generateLevel();

        // Add Colliders
        this.physics.add.collider(this.player, this.platforms);


        text = this.add.text(32, 32, '', { font: '12px Courier', fill: '#00ff00' });

        //  Create our keyboard controls
        cursors = this.input.keyboard.createCursorKeys();
        aKeyObj = this.input.keyboard.addKey('A');
        dKeyObj = this.input.keyboard.addKey('D');
        wKeyObj = this.input.keyboard.addKey('W');
        sKeyObj = this.input.keyboard.addKey('S');
        spaceKeyObj = this.input.keyboard.addKey('SPACE');

        // Camera
        this.cameras.main.startFollow(this.player, true);

        this.time.addEvent({ delay: 1000, callback: this.setTimer, loop: true })
    },

    update: function (time, delta) {
        // Set player collision
        let playerRect = this.player.getBounds();

        // Handle player movement
        this.playerHandler();

        Phaser.Actions.Call(this.orbs.getChildren(), orb => {

            let orbRect = orb.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, orbRect)) {
                this.insight += 1;
                this.score += 5;
                orb.destroy();
            }

        }, this);


        if (this.player.y > 850) {
            this.gameOver();
        }

    },

    playerHandler: function () {
        // Left
        if (cursors.left.isDown || aKeyObj.isDown) {
            this.direction = 'LEFT';
        }

        // Right
        if (cursors.right.isDown || dKeyObj.isDown) {
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
        if (((cursors.right.isUp && cursors.left.isUp) && (aKeyObj.isUp && dKeyObj.isUp)) || ((cursors.right.isDown && cursors.left.isDown) || (aKeyObj.isDown && dKeyObj.isDown))) {
            this.direction = "STANDING";
        }

        // Update player stats and check for level up conditions
        this.stats();

        // Apply movement
        this.move(this.direction);

        // Set Light Position
        this.playerLight.x = this.player.x;
        this.playerLight.y = this.player.y;
    },

    stats: function () {
        this.data.set('level', this.level);
        this.data.set('insight', this.insight);
        this.data.set('score', this.score);
        this.data.set('time', timeNumber);


        text.setText([
            'Level: ' + this.data.get('level'),
            'Insight: ' + this.data.get('insight'),
            'Score: ' + this.data.get('score'),
            'Timer: ' + this.data.get('time')
        ]).setScrollFactor(0);

        if (this.alive) {
            this.level = Math.ceil(this.insight / 50);
            this.playerLight.setRadius(200 + (50 * this.level)).setIntensity(1 + this.level);
            this.speed = 340 + (this.level * 10);
        }

    },

    setTimer: function () {
        timeNumber++;
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
        text.setText("");
        this.alive = false;
        this.cameras.main.fade(750);
        this.cameras.main.on('camerafadeoutcomplete', function (camera, effect) {
            this.playerLight.setIntensity(0);

            this.scene.stop();
            this.scene.start('endScene');
        }, this);
    },

    endGame: function () {
        text.setText("");
        this.alive = false;
        this.cameras.main.fade(750);
        this.cameras.main.on('camerafadeoutcomplete', function (camera, effect) {
            this.playerLight.setIntensity(0);

            this.scene.stop();
            this.scene.start('winScene');
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
    },

    create: function () {
        this.add.text(360, 150, `GAME OVER`);
        this.add.text(300, 500, `Press Space to try again`);

        spaceKeyObj = this.input.keyboard.addKey('SPACE');
        this.spacePressed = false;
    },
    update: function (time, delta) {
        if (spaceKeyObj.isDown && !this.spacePressed) {
            this.spacePressed = true;
            this.cameras.main.fade(250);
            this.cameras.main.on('camerafadeoutcomplete', function (camera, effect) {
                this.scene.start('gameScene');
            }, this);
        }
    }
});

let winScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function endScene() {
            Phaser.Scene.call(this, { key: 'winScene' });
        },

    preload: function () {
    },

    create: function () {
        this.add.text(360, 150, `YOU WON!`);
        this.add.text(300, 500, `Press Space to try again`);

        spaceKeyObj = this.input.keyboard.addKey('SPACE');
        this.spacePressed = false;
    },
    update: function (time, delta) {
        if (spaceKeyObj.isDown && !this.spacePressed) {
            this.spacePressed = true;
            this.cameras.main.fade(250);
            this.cameras.main.on('camerafadeoutcomplete', function (camera, effect) {
                this.scene.start('gameScene');
            }, this);
        }
    }


});

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    scene: [titleScene, gameScene, endScene, winScene],
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