class Bot {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player_frente1');
    this.sprite.setScale(0.6);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(1);
    this.setRandomVelocity();
    this.messageText = null;
  }

  setRandomVelocity() {
    const vx = Phaser.Math.Between(-50, 50);
    const vy = Phaser.Math.Between(-50, 50);
    this.sprite.setVelocity(vx, vy);
  }

  updateAnimation() {
    const vx = this.sprite.body.velocity.x;
    const vy = this.sprite.body.velocity.y;

    if (Math.abs(vx) > Math.abs(vy)) {
      if (vx > 0) {
        this.playAnimIfNotPlaying('walk_right');
      } else if (vx < 0) {
        this.playAnimIfNotPlaying('walk_left');
      } else {
        this.stopAnimAndSetFrame('right');
      }
    } else if (Math.abs(vy) > 0) {
      if (vy > 0) {
        this.playAnimIfNotPlaying('walk_down');
      } else if (vy < 0) {
        this.playAnimIfNotPlaying('walk_up');
      }
    } else {
      this.stopAnimAndSetFrame('down');
    }
  }

  playAnimIfNotPlaying(key) {
    if (this.sprite.anims.currentAnim?.key !== key) {
      this.sprite.anims.play(key, true);
    }
  }

  stopAnimAndSetFrame(direction) {
    this.sprite.anims.stop();

    const frameKeyMap = {
      down: 'player_frente1',
      up: 'player_costas1',
      left: 'player_esquerda1',
      right: 'player_direita1'
    };

    this.sprite.setTexture(frameKeyMap[direction]);
  }

  takeDamageFrom(player) {
    const dx = this.sprite.x - player.x;
    const dy = this.sprite.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const knockbackPower = 100;

    this.sprite.setVelocity((dx / dist) * knockbackPower, (dy / dist) * knockbackPower);
    this.sprite.setAlpha(0.5);

    this.scene.time.delayedCall(500, () => {
      this.sprite.setAlpha(1);
    });
  }
}

class Guarda {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'guarda_direita1');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(0.4);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(1);
    this.originalY = y;

    this.isChasing = false;
    this.chaseTimer = null;

    this.setRandomVelocity();
    this.messageText = null;
  }

  setRandomVelocity() {
    if (!this.isChasing) {
      const vx = Phaser.Math.Between(-50, 50);
      const vy = Phaser.Math.Between(-50, 50);
      this.sprite.setVelocity(vx, vy);
    }
  }

  startChasing(target) {
    this.isChasing = true;
    this.chaseTarget = target;

    if (this.chaseTimer) {
      this.chaseTimer.remove(false);
    }

    this.chaseTimer = this.scene.time.delayedCall(6000, () => {
      this.isChasing = false;
      this.chaseTarget = null;
      this.setRandomVelocity();
    });
  }

  updateAnimation() {
    const vx = this.sprite.body.velocity.x;
    const vy = this.sprite.body.velocity.y;

    if (Math.abs(vx) > Math.abs(vy)) {
      if (vx > 0) {
        this.playAnimIfNotPlaying('guarda_walk_right');
      } else if (vx < 0) {
        this.playAnimIfNotPlaying('guarda_walk_left');
      } else {
        this.stopAnimAndSetFrame('right');
      }
    } else if (Math.abs(vy) > 0) {
      if (vy > 0) {
        this.playAnimIfNotPlaying('guarda_walk_down');
      } else if (vy < 0) {
        this.playAnimIfNotPlaying('guarda_walk_up');
      }
    } else {
      this.stopAnimAndSetFrame('down');
    }
  }

  update() {
    if (this.isChasing && this.chaseTarget) {
      const speed = 60;
      const dx = this.chaseTarget.x - this.sprite.x;
      const dy = this.chaseTarget.y - this.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      this.sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    }
  }

  playAnimIfNotPlaying(key) {
    if (this.sprite.anims.currentAnim?.key !== key) {
      this.sprite.anims.play(key, true);
    }
  }

  stopAnimAndSetFrame(direction) {
    this.sprite.anims.stop();

    const frameKeyMap = {
      down: 'guarda_frente1',
      up: 'guarda_costas1',
      left: 'guarda_esquerda1',
      right: 'guarda_direita1'
    };

    this.sprite.setTexture(frameKeyMap[direction]);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(0.4);
    this.sprite.setY(this.originalY);
  }

  speak() {
    const phrases = [
      "Não fuja, vou te prender, fique atento.",
      "Você não vai escapar dessa vez.",
      "Fique parado ou eu vou ter que agir.",
      "Estou de olho em você.",
      "Se mexer, eu vou atrás.",
      "Essa prisão não é lugar para brincadeira.",
      "Tente fugir e verá as consequências.",
      "Não pense que pode me enganar.",
      "Sua hora vai chegar.",
      "Eu vigio todos os cantos daqui."
    ];
    return Phaser.Utils.Array.GetRandom(phrases);
  }

  takeDamageFrom(player) {
    const dx = this.sprite.x - player.x;
    const dy = this.sprite.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const knockbackPower = 100;

    this.sprite.setVelocity((dx / dist) * knockbackPower, (dy / dist) * knockbackPower);
    this.sprite.setAlpha(0.5);

    this.scene.time.delayedCall(500, () => {
      this.sprite.setAlpha(1);
    });

    // Chama a perseguição dos 3 guardas
    this.scene.startChasingAllGuards(player);
  }
}

class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');

    this.botMessages = [
      "Some daqui!",
      "Não quero falar agora.",
      "Pra fugir da prisão, tente o duto secreto.",
      "Se manda!",
      "Tá olhando o quê?",
      "Pule as grades.",
      "Foi preso por quê?",
      "Melhor ficar na sua.",
      "Tem um plano aí?",
      "Cuidado com os guardas.",
      "Não confie em ninguém aqui.",
      "A noite é perigosa.",
      "Fique esperto com os informantes.",
      "Essa prisão tem seus segredos.",
      "Tente fazer amigos, ou vai sofrer.",
      "Os guardas estão mais atentos hoje.",
      "Ouvi falar de uma fuga ontem.",
      "Não crie inimizades à toa.",
      "Aqui dentro o silêncio é ouro.",
      "Não deixe ninguém te enganar.",
      "Já viu o túnel na cela 3?",
      "Cuidado com as câmeras.",
      "Procure o velho Carlos, ele sabe tudo.",
      "Se precisar de ajuda, me chame.",
      "Não seja bobo, proteja o que é seu.",
      "Eles sempre estão de olho.",
      "Tem muita gente que não é quem parece.",
      "Nada é como parece por aqui.",
      "A saída não é fácil, mas existe.",
      "Fique calmo e espere a hora certa.",
      "O silêncio pode salvar sua vida.",
      "Nunca confie nas promessas dos outros.",
      "Lembre-se: aqui dentro, o tempo passa devagar."
    ];

    this.guards = []; // para guardar os 3 guardas que perseguem
  }

  preload() {
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

    this.load.image('guarda_frente1', 'assets/guarda_frente1.png');
    this.load.image('guarda_frente2', 'assets/guarda_frente2.png');
    this.load.image('guarda_costas1', 'assets/guarda_costas1.png');
    this.load.image('guarda_costas2', 'assets/guarda_costas2.png');
    this.load.image('guarda_direita1', 'assets/guarda_direita1.png');
    this.load.image('guarda_direita2', 'assets/guarda_direita2.png');
    this.load.image('guarda_esquerda1', 'assets/guarda_esquerda1.png');
    this.load.image('guarda_esquerda2', 'assets/guarda_esquerda2.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#99cccc');

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

    this.anims.create({
      key: 'guarda_walk_down',
      frames: [
        { key: 'guarda_frente1' },
        { key: 'guarda_frente2' }
      ],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'guarda_walk_up',
      frames: [
        { key: 'guarda_costas1' },
        { key: 'guarda_costas2' }
      ],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'guarda_walk_left',
      frames: [
        { key: 'guarda_esquerda1' },
        { key: 'guarda_esquerda2' }
      ],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'guarda_walk_right',
      frames: [
        { key: 'guarda_direita1' },
        { key: 'guarda_direita2' }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.player = this.add.sprite(400, 300, 'player_frente1');
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.setScale(0.6);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    this.bots = [];
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      this.bots.push(new Bot(this, x, y));
    }

    // Criar 3 guardas
    this.guards = [];
    for(let i = 0; i < 3; i++){
      let guardX = Phaser.Math.Between(300, 500);
      let guardY = Phaser.Math.Between(300, 500);
      const guard = new Guarda(this, guardX, guardY);
      this.guards.push(guard);
      this.bots.push(guard);
    }

    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        this.bots.forEach(bot => bot.setRandomVelocity());
      }
    });
  }

  startChasingAllGuards(player) {
    this.guards.forEach(guard => {
      guard.startChasing(player);
    });
  }

  update() {
    const speed = 100;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      if (this.player.anims.currentAnim?.key !== 'walk_left') {
        this.player.anims.play('walk_left', true);
      }
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      if (this.player.anims.currentAnim?.key !== 'walk_right') {
        this.player.anims.play('walk_right', true);
      }
    } else if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      if (this.player.anims.currentAnim?.key !== 'walk_up') {
        this.player.anims.play('walk_up', true);
      }
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      if (this.player.anims.currentAnim?.key !== 'walk_down') {
        this.player.anims.play('walk_down', true);
      }
    } else {
      this.player.anims.stop();
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.bots.forEach(bot => {
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          bot.sprite.x, bot.sprite.y
        );
        if (dist < 50) {
          if (bot instanceof Guarda) {
            this.showBotMessage(bot, bot.speak());
          } else {
            const msg = Phaser.Utils.Array.GetRandom(this.botMessages);
            this.showBotMessage(bot, msg);
          }
        }
      });
    }

    if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      this.bots.forEach(bot => {
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          bot.sprite.x, bot.sprite.y
        );
        if (dist < 50) {
          bot.takeDamageFrom(this.player);
        }
      });
    }

    this.bots.forEach(bot => {
      if (bot instanceof Guarda) {
        bot.update();
      }
      bot.updateAnimation();
      if (bot.messageText) {
        bot.messageText.setPosition(bot.sprite.x, bot.sprite.y - 40);
      }
    });
  }

  showBotMessage(bot, message) {
    if (bot.messageText) {
      bot.messageText.destroy();
    }

    bot.messageText = this.add.text(bot.sprite.x, bot.sprite.y - 40, message, {
      font: '16px Arial',
      fill: '#fff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 5, y: 3 },
      align: 'center',
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      if (bot.messageText) {
        bot.messageText.destroy();
        bot.messageText = null;
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: MainScene
};

new Phaser.Game(config);
