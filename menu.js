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
      this.scene.start('MainGameScene');
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
    this.load.image('newGame', 'assets/new_game.png');
  }

  create() {
    this.bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'gameBackground');
    this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.add.text(this.cameras.main.centerX, 50, 'Bem-vindo!', {
      fontSize: '40px',
      fill: '#fff'
    }).setOrigin(0.5);

    const newGameImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'newGame');
    newGameImage.setScale(0.25);
    newGameImage.setAlpha(0);

    newGameImage.setInteractive({ cursor: 'pointer' });

    newGameImage.on('pointerdown', () => {
      this.scene.start('LevelOneScene');
    });

    this.tweens.add({
      targets: newGameImage,
      alpha: { from: 0, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

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
    this.load.spritesheet('player', 'assets/player_spritesheet.png', {
      frameWidth: 500,
      frameHeight: 500
    });
    this.load.image('gameBackground', 'assets/gameBackground.png');
  }

  create() {
    this.bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'gameBackground');
    this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    this.bg.setDepth(0);

    this.cameras.main.setBackgroundColor('#222');

    this.add.text(this.cameras.main.centerX, this.cameras.main.height * 0.1, 'Selecione o nome do seu personagem', {
      fontSize: '32px',
      fill: '#fff'
    }).setOrigin(0.5);

    this.player = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'player');
    this.player.setScale(1);
    this.player.setFrame(0);

    // ✅ Animação de respiração
    this.tweens.add({
      targets: this.player,
      y: this.player.y - 10,   // sobe 10px
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.scale.on('resize', this.resize, this);
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.cameras.resize(width, height);
    this.bg.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    this.player.setPosition(width / 2, height / 2);
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  scene: [MenuScene, MainGameScene, LevelOneScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);
