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
        },


    preload: function () {
        this.load.image('bg', 'images/titleScreen.png');

        this.load.image('title', 'images/title.png');
        this.load.image('player', 'images/sprites/player_still_crossarmed.png');
    },

    create: function () {
        this.add.image(400, 300, 'bg');
        this.player = this.physics.add.image(400, 300, 'player', 0);
        this.add.text(320, 150, `Wander The Shadows`);

        //  Create our keyboard controls
        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta) {
        this.player.setVelocity(0);

        if (cursors.left.isDown) {
            console.log('Hello from the Left Key!');
            let direction = 'LEFT';
            this.move(direction);
        }
        else if (cursors.right.isDown) {
            console.log('Hello from the Right Key!');
            let direction = 'RIGHT';
            this.move(direction);
        }
        else if (cursors.up.isDown) {
            console.log('Hello from the Up Key!');
        }
        else if (cursors.down.isDown) {
            console.log('Hello from the Down Key!');
        }


        /* End Game
        console.log('From gameScene to endScene');
        this.scene.start('endScene');
        */
    },

    move: function (direction){
        if(direction === 'LEFT'){
            this.player.setVelocityX(-this.speed);
            this.player.flipX = true;
        }
        else if(direction === 'RIGHT'){
            this.player.setVelocityX(this.speed);
            this.player.flipX = false;
        }
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
          y:5,
        },
      },
    },
};

let game = new Phaser.Game(config);