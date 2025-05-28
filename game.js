class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // Carregar imagens separadas para cada direção
    this.load.image('player_frente1', 'assets/player_frente1.png');
    this.load.image('player_frente2', 'assets/player_frente2.png');
    this.load.image('player_frente3', 'assets/player_frente3.png');

    this.load.image('player_costas1', 'assets/player_costas1.png');
    this.load.image('player_costas2', 'assets/player_costas2.png');
    this.load.image('player_costas3', 'assets/player_costas3.png');

    this.load.image('player_direita1', 'assets/player_direita1.png');
    this.load.image('player_direita2', 'assets/player_direita2.png');
    this.load.image('player_direita3', 'assets/player_direita3.png');

    this.load.image('player_esquerda1', 'assets/player_esquerda1.png');
    this.load.image('player_esquerda2', 'assets/player_esquerda2.png');
    this.load.image('player_esquerda3', 'assets/player_esquerda3.png');
  }

  create() {
    // Fundo simples
    this.cameras.main.setBackgroundColor('#99cccc');

    // Cria o player com a imagem inicial
    this.player = this.add.sprite(400, 300, 'player_frente1');
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.setScale(0.6);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();

    // Configuração das animações manualmente com imagens separadas
    this.anims.create({
      key: 'walk_down',
      frames: [
        { key: 'player_frente1' },
        { key: 'player_frente2' },
        { key: 'player_frente3' }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'walk_up',
      frames: [
        { key: 'player_costas1' },
        { key: 'player_costas2' },
        { key: 'player_costas3' }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'walk_left',
      frames: [
        { key: 'player_esquerda1' },
        { key: 'player_esquerda2' },
        { key: 'player_esquerda3' }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'walk_right',
      frames: [
        { key: 'player_direita1' },
        { key: 'player_direita2' },
        { key: 'player_direita3' }
      ],
      frameRate: 8,
      repeat: -1
    });
  }

  update() {
    const speed = 200;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      this.player.anims.play('walk_left', true);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      this.player.anims.play('walk_right', true);
    } else if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      this.player.anims.play('walk_up', true);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      this.player.anims.play('walk_down', true);
    } else {
      this.player.anims.stop();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: MainScene
};

new Phaser.Game(config);
