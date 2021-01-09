var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('bg', 'images/titleScreen.png');
    this.load.image('title', 'images/title.png');
}

function create() {
    this.add.image(400, 300, 'bg');
    this.add.image(400, 100, 'title');
    this.add.text(240,150, `Some game... that's about something`);
    this.add.text(300,500, `Press Anykey to Start`);
}