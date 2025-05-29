
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('title', 'assets/title.png');
    this.load.image('start', 'assets/start.png');
  }

  create() {
    this.bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
    this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.title = this.add.image(this.cameras.main.centerX, 150, 'title').setScale(0.5);
    this.titleOriginalY = this.title.y;

    this.start = this.add.image(this.cameras.main.centerX, 300, 'start').setScale(0.25);
    this.startOriginalY = this.start.y;

    this.start.setInteractive({ cursor: 'pointer' });

    this.start.on('pointerdown', () => {
      this.scene.start('LevelOneScene');
    });

    this.scale.on('resize', this.resize, this);
  }

  update(time, delta) {
    const amplitude = 10;
    const speed = 0.002;

    this.title.y = this.titleOriginalY + Math.sin(time * speed) * amplitude;
    this.start.y = this.startOriginalY + Math.sin(time * speed) * amplitude;
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.cameras.resize(width, height);
    this.bg.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    this.title.setPosition(width / 2, 150);
    this.start.setPosition(width / 2, 300);
  }
}

class MainGameScene extends Phaser.Scene {
  constructor() {
    super('MainGameScene');
  }

  preload() {
    this.load.image('gameBackground', 'assets/gameBackground.png');
  }

  create() {
    this.bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'gameBackground');
    this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Bem-vindo ao jogo!`, {
      fontFamily: "'Press Start 2P', cursive, monospace",
      fontSize: '24px',
      fill: '#00FF00',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.scale.on('resize', this.resize, this);
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.cameras.resize(width, height);
    this.bg.setPosition(width / 2, height / 2).setDisplaySize(width, height);
  }
}

class LevelOneScene extends Phaser.Scene {
  constructor() {
    super('LevelOneScene');
  }

  preload() {
    this.load.image('newGameImage', 'assets/new_game.png');
    this.load.image('gameBackground', 'assets/gameBackground.png');
  }

  create() {
    this.bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'gameBackground');
    this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.newGame = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'newGameImage')
      .setOrigin(0.5)
      .setScale(0.5)
      .setInteractive({ cursor: 'pointer' });

    this.newGameOriginalY = this.newGame.y;

    this.newGame.on('pointerdown', () => {
      this.scene.start('MainGameScene');
    });

    this.scale.on('resize', this.resize, this);
  }

  update(time, delta) {
    const amplitude = 10;
    const speed = 0.002;
    this.newGame.y = this.newGameOriginalY + Math.sin(time * speed) * amplitude;
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.cameras.resize(width, height);
    this.bg.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    this.newGame.setPosition(width / 2, height / 2);
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  scene: [MenuScene, LevelOneScene, MainGameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);
