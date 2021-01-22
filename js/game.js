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
                game.scene.start('gameScene');
                console.log('Loading The Game!');
                console.log('From titleScene to gameScene');
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



            // Our player variables
            this.alive = true;
            this.speed = 250;
            this.direction = 'LEFT';
            this.playerOnPlatform = false;
        },


    preload: function () {
        this.load.image('bg', 'images/titleScreen.png');
        this.load.image('title', 'images/title.png');
        this.load.image('player', 'images/sprites/player_still_crossarmed.png');
        this.load.image('platform', 'images/sprites/platform.png');
    },

    create: function () {




        this.add.image(400, 300, 'bg');
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.add.text(320, 150, `Wander The Shadows`);

        this.platforms = this.add.group({
            key: 'platform',
            repeat: 5,
            setXY: {
                x: 90,
                y: 500,
                stepX: 80,
                stepY: 0
            }
        });

        //  Create our keyboard controls
        cursors = this.input.keyboard.createCursorKeys();




    },

    update: function (time, delta) {
        // Set player collision
        let playerRect = this.player.getBounds();


        if (!this.playerOnPlatform)
            this.player.body.setVelocityY(500);
        else
            this.player.body.setVelocityY(0);


        // Movement
        if (cursors.left.isDown) {
            console.log('Hello from the Left Key!');
            let direction = 'LEFT';
            this.move(direction);
        }
        if (cursors.right.isDown) {
            console.log('Hello from the Right Key!');
            let direction = 'RIGHT';
            this.move(direction);
        }
        if (cursors.up.isDown && this.playerOnPlatform) {
            this.jump();
        } if (cursors.down.isDown) {
            console.log('Hello from the Down Key!');
        } if (cursors.right.isUp && cursors.left.isUp) {
            this.player.setVelocityX(0);
        }

        Phaser.Actions.Call(this.platforms.getChildren(), platform => {
            // check enemy overlap
            let platformRect = platform.getBounds();

            if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, platformRect)) {
                this.playerOnPlatform = true;

                console.log(this.playerOnPlatform);
            }
            if (!Phaser.Geom.Intersects.RectangleToRectangle(playerRect, platformRect)) {
                this.playerOnPlatform = false;
                console.log(this.playerOnPlatform);
            }

        }, this);

        /* End Game
        console.log('From gameScene to endScene');
        this.scene.start('endScene');
        */
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
    },

    jump: function () {
        this.playerOnPlatform = false;
        this.player.body.setVelocityY(-2000);
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
            debug: true,
            gravity: {

            },
        },
    },
};

let game = new Phaser.Game(config);