class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload() {
    // Carregando todas as imagens e o vídeo necessários para o menu
    this.load.image("background", "assets/background.png");
    this.load.image("title", "assets/title.png");
    this.load.image("start", "assets/start.png");
    this.load.image("gameBackground", "assets/gameBackground.png");
    this.load.image("newGame", "assets/new_game.png");
    this.load.video("intro", "assets/videoNewGame.mp4");
    this.load.video("inicio", "assets/videoinicio.mp4");

    this.load.audio("click", "assets/clickMouse.mp3");

    this.load.audio("musicaJogo", "assets/musicaJogo.mp3");
  }

  create() {
    //  Toca a música
    if (!this.sound.get("musicaJogo")) {
      this.musicaJogo = this.sound.add("musicaJogo", {
        loop: true,
        volume: 0.2,
      });
      this.musicaJogo.play();
    }
    const { width, height } = this.scale;

    // Tela de fundo inicial
    const bg = this.add
      .image(0, 0, "background")
      .setOrigin(0)
      .setDisplaySize(width, height);

    // Título do jogo
    const title = this.add.image(width / 2, 300, "title").setScale(0.8);

    // Botão START
    const start = this.add.image(width / 2, 550, "start").setScale(0.4);

    // Animação flutuante para título e botão START
    this.tweens.add({
      targets: [title, start],
      y: "+=10",
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Configuração das teclas
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.enterKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );

    // Quando o botão START for clicado
    start.setInteractive({ cursor: "pointer" });
    start.on("pointerdown", () => {
      this.handleStartClick();
    });

    // Função para lidar com o clique no START
    this.handleStartClick = () => {
      this.sound.play("click");
      title.setVisible(false);
      start.setVisible(false);
      bg.setVisible(false);

      // Adiciona e reproduz o vídeo de início
      const videoInicio = this.add.video(width / 2, height / 2, "inicio");

      videoInicio.setVolume(0.025);

      // Lower background music volume during video
      if (this.musicaJogo) {
        this.musicaJogo.setVolume(0.0);
      }

      // Adiciona o botão de pular
      const skipButton = this.add
        .text(width - 140, 30, "Pular", {
          fontFamily: '"Press Start 2P"',
          fontSize: "22px",
          fill: "#ffffff",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: { x: 10, y: 5 },
          border: { color: "#ffffff", width: 2 },
        })
        .setInteractive({ cursor: "pointer" })
        .setDepth(1001);

      // Função para mostrar a tela de NEW GAME
      const showNewGameScreen = () => {
        videoInicio.destroy();
        skipButton.destroy();

        // Mostra a nova tela com o botão NEW GAME
        const gameBg = this.add
          .image(0, 0, "gameBackground")
          .setOrigin(0)
          .setDisplaySize(width, height);
        const newGameBtn = this.add
          .image(width / 2, 480, "newGame")
          .setScale(0.6)
          .setInteractive({ cursor: "pointer" });

        // Aplica a mesma animação flutuante no botão NEW GAME
        this.tweens.add({
          targets: newGameBtn,
          y: "+=10",
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        // Quando o botão NEW GAME for clicado
        newGameBtn.on("pointerdown", () => {
          this.sound.play("click");
          gameBg.setVisible(false);
          newGameBtn.setVisible(false);

          // Adiciona e reproduz o vídeo
          const video = this.add.video(width / 2, height / 2, "intro");

          video.once("play", () => {
            video.setDisplaySize(width, height);
            video.setDepth(1000);
          });

          video.play(false);

          video.once("complete", () => {
            video.destroy();
            this.scene.start("MainScene");
          });
        });

        // Adiciona eventos de teclado para o NEW GAME
        this.input.keyboard.on("keydown-SPACE", () => {
          if (newGameBtn.visible) {
            this.sound.play("click");
            gameBg.setVisible(false);
            newGameBtn.setVisible(false);

            // Adiciona e reproduz o vídeo
            const video = this.add.video(width / 2, height / 2, "intro");

            video.once("play", () => {
              video.setDisplaySize(width, height);
              video.setDepth(1000);
            });

            video.play(false);

            video.once("complete", () => {
              video.destroy();
              this.scene.start("MainScene");
            });
          }
        });

        this.input.keyboard.on("keydown-ENTER", () => {
          if (newGameBtn.visible) {
            this.sound.play("click");
            gameBg.setVisible(false);
            newGameBtn.setVisible(false);

            // Adiciona e reproduz o vídeo
            const video = this.add.video(width / 2, height / 2, "intro");

            video.once("play", () => {
              video.setDisplaySize(width, height);
              video.setDepth(1000);
            });

            video.play(false);

            video.once("complete", () => {
              video.destroy();
              this.scene.start("MainScene");
            });
          }
        });
      };

      // Adiciona evento de clique no botão pular
      skipButton.on("pointerdown", () => {
        this.sound.play("click");
        if (this.musicaJogo) {
          this.musicaJogo.setVolume(0.2);
        }
        showNewGameScreen();
      });

      // Adiciona evento de teclado para pular com ESC
      this.input.keyboard.on("keydown-ESC", () => {
        if (videoInicio.isPlaying()) {
          if (this.musicaJogo) {
            this.musicaJogo.setVolume(0.2);
          }
          showNewGameScreen();
        }
      });

      videoInicio.once("play", () => {
        videoInicio.setDisplaySize(width, height);
        videoInicio.setDepth(1000);
      });

      videoInicio.play(false);

      videoInicio.once("complete", () => {
        // Restore original music volume
        if (this.musicaJogo) {
          this.musicaJogo.setVolume(0.2);
        }
        showNewGameScreen();
      });
    };

    // Adiciona o evento de teclado para o START
    this.input.keyboard.on("keydown-SPACE", () => {
      if (start.visible) {
        this.handleStartClick();
      }
    });

    this.input.keyboard.on("keydown-ENTER", () => {
      if (start.visible) {
        this.handleStartClick();
      }
    });
  }

  update() {
    // Verifica se as teclas foram pressionadas
    if (this.spaceKey.isDown || this.enterKey.isDown) {
      if (this.scene.isActive("MenuScene")) {
        const start = this.children.list.find(
          (child) => child.texture && child.texture.key === "start"
        );
        if (start && start.visible) {
          this.handleStartClick();
        }
      }
    }
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
    parent: "game-container", // ID do elemento HTML onde o jogo será injetado
    width: 1920,
    height: 1080,
  },

  // Configuração da física (Arcade Physics é leve e bom para a maioria dos jogos 2D)
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }, // Jogo top-down, sem gravidade vertical
      debug: false, // Defina como true para ver os corpos de colisão e debug de física
    },
  },

  scene: [MenuScene, MainScene],

  parent: "game-container",
};

// Inicializa a instância do jogo Phaser com a configuração definida
window.game = new Phaser.Game(config);
