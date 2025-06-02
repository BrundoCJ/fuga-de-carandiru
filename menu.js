// Importa a MainScene de game.js
// É crucial que game.js seja carregado ANTES de menu.js no index.html
// para que MainScene esteja definida quando este script for executado.
// Se você está usando módulos ES6 (import/export), a sintaxe seria:
// import { MainScene } from './game.js';
// Mas como você está usando scripts globais no index.html, MainScene
// já estará disponível no escopo global.

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // Carregando todas as imagens e o vídeo necessários para o menu
    this.load.image('background', 'assets/background.png');
    this.load.image('title', 'assets/title.png');
    this.load.image('start', 'assets/start.png');
    this.load.image('gameBackground', 'assets/gameBackground.png');
    this.load.image('newGame', 'assets/new_game.png');
    this.load.video('intro', 'assets/videoNewGame.mp4');

    // **IMPORTANTE**: Embora as cenas carreguem seus próprios assets,
    // se você quiser garantir que MainScene esteja pronta para iniciar
    // sem um delay de carregamento, você pode pré-carregar os assets
    // dela aqui também, ou mostrar uma tela de loading.
    // Por simplicidade, vou manter a carga de assets da MainScene
    // dentro de game.js, mas tenha isso em mente para jogos maiores.
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
      const newGameBtn = this.add.image(width / 2, 480, 'newGame').setScale(0.6).setInteractive({ cursor: 'pointer' });

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
          video.setDepth(1000); // Garante que o vídeo fique acima de tudo
        });

        video.play(false); // Reproduz o vídeo

        // Ação ao finalizar o vídeo
        video.once('complete', () => {
          video.destroy(); // Remove o vídeo da tela
          this.scene.start('MainScene'); // Inicia a MainScene que está em game.js
        });
      });
    });
  }
}

// Configuração principal do jogo Phaser
const config = {
  type: Phaser.AUTO, // Phaser tentará usar WebGL, mas voltará para Canvas se necessário
  
  // As dimensões base (de design) do seu jogo.
  // O Phaser usará essas dimensões para escalar o jogo.
  width: 2048,
  height: 1153,

  // Configurações de escala para se adaptar a diferentes dispositivos
  scale: {
    mode: Phaser.Scale.FIT, // O jogo será dimensionado para caber na tela, mantendo a proporção
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centraliza o canvas horizontal e verticalmente
    parent: 'game-container', // ID do elemento HTML onde o jogo será injetado
    // Estas propriedades `width` e `height` aqui são redundantes se já definidas acima,
    // mas podem ser úteis para clareza ou se você quiser uma base diferente para a escala.
    // Manter as mesmas da configuração principal é geralmente o ideal.
    width: 1920,
    height: 1080
  },

  // Configuração da física (Arcade Physics é leve e bom para a maioria dos jogos 2D)
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // Jogo top-down, sem gravidade vertical
      debug: false // Defina como true para ver os corpos de colisão e debug de física
    }
  },

  // As cenas do seu jogo.
  // MenuScene é a primeira a ser carregada.
  // MainScene deve ser adicionada aqui para que o Phaser a conheça e possa iniciar.
  scene: [MenuScene, MainScene], // **Certifique-se de que MainScene está aqui**
  
  // O elemento HTML onde o canvas do jogo será adicionado.
  // Já definido na seção `scale.parent`, mas bom ter aqui também.
  parent: 'game-container'
};

// Inicializa a instância do jogo Phaser com a configuração definida
new Phaser.Game(config);