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
        },

    preload: function () {
        this.load.image('bg', 'images/titleScreen.png');
    },

    create: function () {
        this.add.image(400, 300, 'bg');
    },

    update: function (time, delta) {

        /* End Game
        console.log('From gameScene to endScene');
        this.scene.start('endScene');
        */
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
    scene: [titleScene, gameScene, endScene]
};

let game = new Phaser.Game(config);