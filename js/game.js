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

        // Generate Random Numbers
        const numberOfPlatforms = getRandomInt(15) + 10;
        const randomOne = getRandomInt(500) + getRandomInt(150);
        const randomTwo = getRandomInt(150) + getRandomInt(75);
        const randomThree = getRandomInt(500) + getRandomInt(150);
        const randomFour = getRandomInt(200) + getRandomInt(75);

        // Orbs
        this.orbs = this.physics.add.staticGroup(this.orbsCreator((numberOfPlatforms), randomOne, randomTwo));
        this.orbsMed = this.physics.add.staticGroup(this.orbsCreator((numberOfPlatforms), randomTwo, randomThree, 0.6));
        this.orbsLarge = this.physics.add.staticGroup(this.orbsCreator((numberOfPlatforms), randomThree, randomFour, 0.75));

        this.platforms = this.physics.add.staticGroup(this.platformCreator());
        this.secondPlatforms = this.physics.add.staticGroup(this.platformHighCreator(numberOfPlatforms, randomOne, randomTwo));
        this.thirdPlatforms = this.physics.add.staticGroup(this.platformHighCreator(numberOfPlatforms, randomTwo, randomThree));
        this.fourthPlatforms = this.physics.add.staticGroup(this.platformHighCreator(numberOfPlatforms, randomThree, randomFour));

        this.winningOrb = this.physics.add.staticGroup(this.winningOrbsCreator(1, (randomThree * numberOfPlatforms), (randomFour * numberOfPlatforms), 1.5));

        Phaser.Actions.Call(this.platforms.getChildren(), platform => {
            platform.setPipeline('Light2D');
            platform.refreshBody();
        }, this);

        Phaser.Actions.Call(this.secondPlatforms.getChildren(), platform => {
            platform.setPipeline('Light2D');
        }, this);

        Phaser.Actions.Call(this.thirdPlatforms.getChildren(), platform => {
            platform.setPipeline('Light2D');
        }, this);

        Phaser.Actions.Call(this.fourthPlatforms.getChildren(), platform => {
            platform.setPipeline('Light2D');
        }, this);

        Phaser.Actions.Call(this.orbs.getChildren(), orb => {
            orb.setPipeline('Light2D');
            orb.refreshBody();
        }, this);

        Phaser.Actions.Call(this.orbsMed.getChildren(), orb => {
            orb.setPipeline('Light2D');
            orb.refreshBody();
        }, this);


        Phaser.Actions.Call(this.orbsLarge.getChildren(), orb => {
            orb.setPipeline('Light2D');
            orb.refreshBody();
        }, this);

        Phaser.Actions.Call(this.winningOrb.getChildren(), orb => {
            orb.setPipeline('Light2D');
            orb.refreshBody();
        }, this);

    },

    platformCreator: function (numberOfPlatforms) {
        return {
            key: 'platform',
            repeat: numberOfPlatforms, // Number of platforms
            setXY: {
                x: 0, // Starting Point
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

    platformHighCreator: function (numberOfPlatforms, randomOne, randomTwo) {
        return {
            key: 'platform',
            repeat: numberOfPlatforms, // Number of platforms
            setXY: {
                x: 500, // Starting Point
                y: 500,
                stepX: randomOne, // Offset direction
                stepY: -randomTwo
            },
            setScale: {
                x: 1,
                y: 1
            }
        };
    },

    orbsCreator: function (numberOfOrbs, randomOne, randomTwo, size = 0.5) {
        return {
            key: 'orb',
            repeat: numberOfOrbs, // Number of platforms
            setXY: {
                x: 500, // Starting Point
                y: 450,
                stepX: randomOne, // Offset direction
                stepY: -randomTwo
            },
            setScale: {
                x: size,
                y: size
            }
        };
    },

    winningOrbsCreator: function (numberOfOrbs = 1, x, y, size = 0.5) {
        console.log(x, y)
        return {
            key: 'orb',
            repeat: numberOfOrbs, // Number of platforms
            setXY: {
                x: x, // Starting Point
                y: -y,
                stepX: 0, // Offset direction
                stepY: 0
            },
            setScale: {
                x: size,
                y: size
            }
        };
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

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.secondPlatforms);
        this.physics.add.collider(this.player, this.thirdPlatforms);
        this.physics.add.collider(this.player, this.fourthPlatforms);

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

        Phaser.Actions.Call(this.orbsMed.getChildren(), orb => {

            let orbRect = orb.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, orbRect)) {
                this.insight += 5;
                this.score += 25;
                orb.destroy();
            }

        }, this);

        Phaser.Actions.Call(this.orbsLarge.getChildren(), orb => {

            let orbRect = orb.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, orbRect)) {
                this.insight += 10;
                this.score += 50;
                orb.destroy();
            }

        }, this);

        Phaser.Actions.Call(this.winningOrb.getChildren(), orb => {

            let orbRect = orb.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, orbRect)) {
                orb.destroy();
                this.endGame();
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
        console.log(`Timer: ${timeNumber}`);
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
        this.add.text(300, 500, `Click to play again`);

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