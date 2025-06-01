class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // Carregando todas as imagens e o vídeo necessários
    this.load.image('background', 'assets/background.png');
    this.load.image('title', 'assets/title.png');
    this.load.image('start', 'assets/start.png');
    this.load.image('gameBackground', 'assets/gameBackground.png');
    this.load.image('newGame', 'assets/new_game.png');
    this.load.video('intro', 'assets/videoNewGame.mp4');
  }

  create() {
    const { width, height } = this.scale;

    // Tela de fundo inicial
    const bg = this.add.image(0, 0, 'background').setOrigin(0).setDisplaySize(width, height);

    // Título do jogo
    const title = this.add.image(width / 2, 300, 'title').setScale(0.8);

    // Botão START
    const start = this.add.image(width / 2, 550, 'start').setScale(0.4);

    // Animação flutuante para título e botão START
    this.tweens.add({
      targets: [title, start],
      y: '+=10',
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Quando o botão START for clicado
    start.setInteractive({ cursor: 'pointer' });
    start.on('pointerdown', () => {
      title.setVisible(false);
      start.setVisible(false);
      bg.setVisible(false);

      // Mostra a nova tela com o botão NEW GAME
      const gameBg = this.add.image(0, 0, 'gameBackground').setOrigin(0).setDisplaySize(width, height);
      const newGameBtn = this.add.image(width / 2,480, 'newGame').setScale(0.6).setInteractive({ cursor: 'pointer' });

      // Aplica a mesma animação flutuante no botão NEW GAME
      this.tweens.add({
        targets: newGameBtn,
        y: '+=10',
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Quando o botão NEW GAME for clicado
      newGameBtn.on('pointerdown', () => {
        gameBg.setVisible(false);
        newGameBtn.setVisible(false);

        // Adiciona e reproduz o vídeo
        const video = this.add.video(width / 2, height / 2, 'intro');

        video.once('play', () => {
          video.setDisplaySize(width, height);
          video.setDepth(1000);
        });

        video.play(false);

        // Ação ao finalizar o vídeo
        
        video.once('complete', () => {
          video.destroy(); // Remove o vídeo da tela
    
          this.scene.start('game')
        });
      });
    });
  }
}

// Configuração do jogo
const config = {
  type: Phaser.AUTO,
  width: 2048,
  height: 1153,
  scene: [MenuScene],
  parent: 'game-container'
};

// Inicializa o jogo
new Phaser.Game(config);