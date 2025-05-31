class Bot {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, "player_frente1");
    this.sprite.setScale(0.5);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(1);

    this.sprite.body.setSize(30, 70);
    this.sprite.body.setOffset(15, 10);

    this.maxHealth = 50;
    this.health = this.maxHealth;
    this.alive = true;

    this.angry = false; // fica bravo e persegue após tomar dano
    this.angerHits = 0; // conta os socos que tomou antes de atacar

    this.hitsDealt = 0; // quantos golpes já deu no jogador
    this.maxHits = 3; // limite de golpes causados no jogador

    this.setRandomVelocity();
    this.messageText = null;

    this.healthBar = scene.add.graphics();
    this.healthBar.setAlpha(0);
  }

  setRandomVelocity() {
    if (!this.alive || this.angry) {
      this.sprite.setVelocity(0, 0);
      return;
    }
    const vx = Phaser.Math.Between(-50, 50);
    const vy = Phaser.Math.Between(-50, 50);
    this.sprite.setVelocity(vx, vy);
  }

  updateAnimation() {
    if (!this.alive) return;
    const vx = this.sprite.body.velocity.x;
    const vy = this.sprite.body.velocity.y;

    if (Math.abs(vx) > Math.abs(vy)) {
      if (vx > 0) this.playAnimIfNotPlaying("walk_right");
      else if (vx < 0) this.playAnimIfNotPlaying("walk_left");
      else this.stopAnimAndSetFrame("right");
    } else if (Math.abs(vy) > 0) {
      if (vy > 0) this.playAnimIfNotPlaying("walk_down");
      else if (vy < 0) this.playAnimIfNotPlaying("walk_up");
    } else {
      this.stopAnimAndSetFrame("down");
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
      down: "player_frente1",
      up: "player_costas1",
      left: "player_esquerda1",
      right: "player_direita1",
    };
    this.sprite.setTexture(frameKeyMap[direction]);
  }

  takeDamageFrom(player) {
    if (!this.alive) return;

    this.health--;
    if (this.health <= 0) {
      this.die();
    } else {
      if (!this.angry) {
        this.angerHits++;
        if (this.angerHits >= 3) {
          this.angry = true;
          this.startChasing(player);
        }
      }

      const dx = this.sprite.x - player.x;
      const dy = this.sprite.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const knockbackPower = 100;

      this.sprite.setVelocity(
        (dx / dist) * knockbackPower,
        (dy / dist) * knockbackPower
      );
      this.sprite.setAlpha(0.5);

      this.showHealthBar();

      this.scene.time.delayedCall(500, () => {
        this.sprite.setAlpha(1);
      });
    }
  }

  startChasing(target) {
    this.angry = true;
    this.chaseTarget = target;
  }

  update() {
    if (!this.alive) return;
    if (this.angry && this.chaseTarget) {
      const speed = 80;
      const dx = this.chaseTarget.x - this.sprite.x;
      const dy = this.chaseTarget.y - this.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      this.sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    }
  }

  die() {
    this.alive = false;
    this.sprite.setVelocity(0, 0);
    this.sprite.setTint(0xff6666);
    this.sprite.setAlpha(0.5);
    this.sprite.anims.stop();
    this.healthBar.clear();
    this.healthBar.setAlpha(0);
  }

  showHealthBar() {
    const width = 30;
    const height = 5;
    const lifeRatio = this.health / this.maxHealth;

    this.healthBar.clear();
    this.healthBar.fillStyle(0x00ff00, 0.4);
    this.healthBar.fillRect(
      this.sprite.x - width / 2,
      this.sprite.y - 55,
      width * lifeRatio,
      height
    );
    this.healthBar.setAlpha(1);

    if (this.healthBarTimer) {
      this.healthBarTimer.remove(false);
    }

    this.healthBarTimer = this.scene.time.delayedCall(3000, () => {
      this.healthBar.setAlpha(0);
    });
  }

  updateHealthBarPosition() {
    if (this.healthBar.alpha > 0) {
      const width = 30;
      const height = 5;
      const lifeRatio = this.health / this.maxHealth;

      this.healthBar.clear();
      this.healthBar.fillStyle(0x00ff00, 0.4);
      this.healthBar.fillRect(
        this.sprite.x - width / 2,
        this.sprite.y - 55,
        width * lifeRatio,
        height
      );
    }
  }
}

class Guarda {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, "guarda_direita1");
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(0.3);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(1);

    this.sprite.body.setSize(70, 130);
    this.sprite.body.setOffset(15, 10);

    this.originalY = y;

    this.isChasing = false;
    this.chaseTimer = null;

    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.alive = true;

    this.setRandomVelocity();
    this.messageText = null;

    this.healthBar = scene.add.graphics();
    this.healthBar.setAlpha(0);
  }

  setRandomVelocity() {
    if (!this.alive) {
      this.sprite.setVelocity(0, 0);
      return;
    }
    if (!this.isChasing) {
      const vx = Phaser.Math.Between(-50, 50);
      const vy = Phaser.Math.Between(-50, 50);
      this.sprite.setVelocity(vx, vy);
    }
  }

  startChasing(target) {
    if (!this.alive) return;
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
    if (!this.alive) return;
    const vx = this.sprite.body.velocity.x;
    const vy = this.sprite.body.velocity.y;

    if (Math.abs(vx) > Math.abs(vy)) {
      if (vx > 0) this.playAnimIfNotPlaying("guarda_walk_right");
      else if (vx < 0) this.playAnimIfNotPlaying("guarda_walk_left");
      else this.stopAnimAndSetFrame("right");
    } else if (Math.abs(vy) > 0) {
      if (vy > 0) this.playAnimIfNotPlaying("guarda_walk_down");
      else if (vy < 0) this.playAnimIfNotPlaying("guarda_walk_up");
    } else {
      this.stopAnimAndSetFrame("down");
    }
  }

  update() {
    if (!this.alive) return;
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
      down: "guarda_frente1",
      up: "guarda_costas1",
      left: "guarda_esquerda1",
      right: "guarda_direita1",
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
      "Eu vigio todos os cantos daqui.",
    ];
    return Phaser.Utils.Array.GetRandom(phrases);
  }

  takeDamageFrom(player) {
    if (!this.alive) return;

    this.health--;
    if (this.health <= 0) {
      this.die();
    } else {
      const dx = this.sprite.x - player.x;
      const dy = this.sprite.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const knockbackPower = 100;

      this.sprite.setVelocity(
        (dx / dist) * knockbackPower,
        (dy / dist) * knockbackPower
      );
      this.sprite.setAlpha(0.5);

      this.showHealthBar();

      this.scene.time.delayedCall(500, () => {
        this.sprite.setAlpha(1);
      });
    }

    this.scene.startChasingAllGuards(player);
  }

  die() {
    this.alive = false;
    this.sprite.setVelocity(0, 0);
    this.sprite.setTint(0xff6666);
    this.sprite.setAlpha(0.5);
    this.sprite.anims.stop();
    this.healthBar.clear();
    this.healthBar.setAlpha(0);
  }

  showHealthBar() {
    const width = 30;
    const height = 5;
    const lifeRatio = this.health / this.maxHealth;

    this.healthBar.clear();
    this.healthBar.fillStyle(0x00ff00, 0.4);
    this.healthBar.fillRect(
      this.sprite.x - width / 2,
      this.sprite.y - 55,
      width * lifeRatio,
      height
    );
    this.healthBar.setAlpha(1);

    if (this.healthBarTimer) {
      this.healthBarTimer.remove(false);
    }

    this.healthBarTimer = this.scene.time.delayedCall(3000, () => {
      this.healthBar.setAlpha(0);
    });
  }

  updateHealthBarPosition() {
    if (this.healthBar.alpha > 0) {
      const width = 30;
      const height = 5;
      const lifeRatio = this.health / this.maxHealth;

      this.healthBar.clear();
      this.healthBar.fillStyle(0x00ff00, 0.4);
      this.healthBar.fillRect(
        this.sprite.x - width / 2,
        this.sprite.y - 55,
        width * lifeRatio,
        height
      );
    }
  }
}

class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");

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
      "Lembre-se: aqui dentro, o tempo passa devagar.",
    ];

    this.guards = [];
    this.lives = 10;
    this.maxLives = 10;
    this.livesSprites = [];
    this.livesBar = null;

    this.playerInvincible = false;
  }

  preload() {
    this.load.image("player_frente1", "assets/player_frente1.png");
    this.load.image("player_frente2", "assets/player_frente2.png");
    this.load.image("player_frente3", "assets/player_frente3.png");
    this.load.image("player_costas1", "assets/player_costas1.png");
    this.load.image("player_costas2", "assets/player_costas2.png");
    this.load.image("player_costas3", "assets/player_costas3.png");
    this.load.image("player_direita1", "assets/player_direita1.png");
    this.load.image("player_direita2", "assets/player_direita2.png");
    this.load.image("player_direita3", "assets/player_direita3.png");
    this.load.image("player_esquerda1", "assets/player_esquerda1.png");
    this.load.image("player_esquerda2", "assets/player_esquerda2.png");
    this.load.image("player_esquerda3", "assets/player_esquerda3.png");

    this.load.image("guarda_frente1", "assets/guarda_frente1.png");
    this.load.image("guarda_frente2", "assets/guarda_frente2.png");
    this.load.image("guarda_costas1", "assets/guarda_costas1.png");
    this.load.image("guarda_costas2", "assets/guarda_costas2.png");
    this.load.image("guarda_direita1", "assets/guarda_direita1.png");
    this.load.image("guarda_direita2", "assets/guarda_direita2.png");
    this.load.image("guarda_esquerda1", "assets/guarda_esquerda1.png");
    this.load.image("guarda_esquerda2", "assets/guarda_esquerda2.png");

    this.load.image("key", "assets/key.png");

    this.load.image("vida", "assets/vida.png");

    this.load.image("map", "assets/map.png");
  }

  create() {
    // Adiciona o map.png cobrindo toda a tela
    this.add
      .image(0, 0, "map")
      .setOrigin(0, 0) // canto superior-esquerdo
      .setDisplaySize(this.scale.width, this.scale.height); // estica para preencher

    this.anims.create({
      key: "walk_down",
      frames: [
        { key: "player_frente1" },
        { key: "player_frente2" },
        { key: "player_frente3" },
      ],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "walk_up",
      frames: [
        { key: "player_costas1" },
        { key: "player_costas2" },
        { key: "player_costas3" },
      ],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "walk_left",
      frames: [
        { key: "player_esquerda1" },
        { key: "player_esquerda2" },
        { key: "player_esquerda3" },
      ],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "walk_right",
      frames: [
        { key: "player_direita1" },
        { key: "player_direita2" },
        { key: "player_direita3" },
      ],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "guarda_walk_down",
      frames: [{ key: "guarda_frente1" }, { key: "guarda_frente2" }],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "guarda_walk_up",
      frames: [{ key: "guarda_costas1" }, { key: "guarda_costas2" }],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "guarda_walk_left",
      frames: [{ key: "guarda_esquerda1" }, { key: "guarda_esquerda2" }],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "guarda_walk_right",
      frames: [{ key: "guarda_direita1" }, { key: "guarda_direita2" }],
      frameRate: 8,
      repeat: -1,
    });

    this.player = this.add.sprite(400, 300, "player_frente1");
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.setScale(0.5);
    this.player.body.setSize(30, 70);
    this.player.body.setOffset(15, 9);

    this.cameras.main.startFollow(this.player);

    // Cria o sprite da chave em uma posição fixa no mapa
    this.keyItem = this.physics.add.sprite(200, 300, "key").setScale(0.05);

    // Variável que indica se o jogador tem a chave
    this.hasKey = false;

    // Configura o overlap entre jogador e chave para coletar
    this.physics.add.overlap(
      this.player,
      this.keyItem,
      () => {
        this.hasKey = true;
        this.keyItem.destroy(); // remove a chave do mapa
        this.showKeyIndicator(); // mostra o ícone da chave no HUD
      },
      null,
      this
    );

    // Definindo o zoom (2x)
    this.cameras.main.setZoom(2.5);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    this.bots = [];
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const bot = new Bot(this, x, y);
      this.bots.push(bot);
    }

    this.guards = [];
    for (let i = 0; i < 7; i++) {
      let guardX = Phaser.Math.Between(300, 500);
      let guardY = Phaser.Math.Between(300, 500);
      const guard = new Guarda(this, guardX, guardY);
      this.guards.push(guard);
      this.bots.push(guard);
    }

    // Adiciona colisão entre o jogador e os bots
    this.physics.add.collider(
      this.player,
      this.bots.map((b) => b.sprite)
    );

    // Adiciona colisão entre os bots para evitar sobreposição entre eles
    for (let i = 0; i < this.bots.length; i++) {
      for (let j = i + 1; j < this.bots.length; j++) {
        this.physics.add.collider(this.bots[i].sprite, this.bots[j].sprite);
      }
    }

    // Barra verde de vida do jogador (10 vidas)
    this.lives = 10;
    this.maxLives = 10;
    this.livesBar = this.add.graphics();
    this.drawLivesBar();

    // Algema (vidas) no canto superior direito (5 vidas)
    this.livesSprites = [];
    const startX = this.sys.game.config.width - 35;
    const startY = 10;
    for (let i = 0; i < 5; i++) {
      const vidaSprite = this.add.image(startX - i * 30, startY, "vida");
      vidaSprite.setOrigin(0, 0);
      vidaSprite.setScale(0.04);
      this.livesSprites.push(vidaSprite);
    }
    this.updateLivesSprites();

    this.playerInvincible = false;

    this.physics.add.overlap(
      this.player,
      this.bots.map((b) => b.sprite),
      this.handlePlayerGuardCollision,
      null,
      this
    );

    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        this.bots.forEach((bot) => bot.setRandomVelocity());
      },
    });

    //BARREIRAS ==========================================================

    // Array para guardar as barreiras
    this.walls = [];

    // Cria primeira barreira invisível
    const barrier1 = this.add.rectangle(195, 250, 500, 10);
    this.physics.add.existing(barrier1, true); // corpo estático
    barrier1.setVisible(false);
    this.walls.push(barrier1);

    // Cria segunda barreira invisível
    const barrier2 = this.add.rectangle(195, 360, 130, 25);
    this.physics.add.existing(barrier2, true);
    barrier2.setVisible(false);
    this.walls.push(barrier2);

    // Cria terceira barreira invisível
    const barrier3 = this.add.rectangle(600, 400, 300, 20);
    this.physics.add.existing(barrier3, true);
    barrier3.setVisible(false);
    this.walls.push(barrier3);

    // Adicionar colisões para todas as barreiras:
    this.walls.forEach((barrier) => {
      this.physics.add.collider(this.player, barrier);
      this.physics.add.collider(
        this.bots.map((b) => b.sprite),
        barrier
      );
      this.physics.add.collider(
        this.guards.map((g) => g.sprite),
        barrier
      );
    });

    //BARREIRAS ==========================================================
  }

  showKeyIndicator() {
    if (!this.keyIcon) {
      // Posição (50,50) no canto superior esquerdo, sem movimento com a câmera
      this.keyIcon = this.add.image(50, 50, "key").setScale(0.07);
    }
  }

  drawLivesBar() {
    const width = 150;
    const height = 10;
    const x = 10;
    const y = 10;

    this.livesBar.clear();
    this.livesBar.fillStyle(0x008000, 1);
    this.livesBar.fillRect(x, y, (this.lives / this.maxLives) * width, height);
    this.livesBar.lineStyle(2, 0x004000);
    this.livesBar.strokeRect(x, y, width, height);
  }

  updateLivesSprites() {
    for (let i = 0; i < this.livesSprites.length; i++) {
      this.livesSprites[i].setVisible(i < this.lives / 2);
    }
  }

  startChasingAllGuards(player) {
    this.guards.forEach((guard) => {
      guard.startChasing(player);
    });
  }

  handlePlayerGuardCollision(playerSprite, botSprite) {
    const bot = this.bots.find((b) => b.sprite === botSprite);
    if (bot instanceof Guarda || (bot instanceof Bot && bot.angry)) {
      if (!this.playerInvincible) {
        if (bot instanceof Bot && bot.hitsDealt >= bot.maxHits) {
          // Bot já bateu 3x, para de perseguir e volta a andar aleatoriamente
          bot.angry = false;
          bot.chaseTarget = null;
          bot.setRandomVelocity();
          return; // Não causa mais dano
        }

        this.playerInvincible = true;

        this.lives--;
        this.drawLivesBar();
        this.updateLivesSprites();

        if (bot instanceof Bot) {
          bot.hitsDealt++;
        }

        this.startChasingAllGuards(this.player);

        if (this.lives <= 0) {
          this.scene.restart();
        }

        this.time.delayedCall(1500, () => {
          this.playerInvincible = false;
        });
      }
    }
  }

  update() {
    const speed = 100;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      if (this.player.anims.currentAnim?.key !== "walk_left") {
        this.player.anims.play("walk_left", true);
      }
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      if (this.player.anims.currentAnim?.key !== "walk_right") {
        this.player.anims.play("walk_right", true);
      }
    } else if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      if (this.player.anims.currentAnim?.key !== "walk_up") {
        this.player.anims.play("walk_up", true);
      }
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      if (this.player.anims.currentAnim?.key !== "walk_down") {
        this.player.anims.play("walk_down", true);
      }
    } else {
      this.player.anims.stop();
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.bots.forEach((bot) => {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          bot.sprite.x,
          bot.sprite.y
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
      this.bots.forEach((bot) => {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          bot.sprite.x,
          bot.sprite.y
        );
        if (dist < 50) {
          bot.takeDamageFrom(this.player);
        }
      });
    }

    this.bots.forEach((bot) => {
      if (bot instanceof Guarda || bot instanceof Bot) {
        bot.update();
        bot.updateAnimation();
        bot.updateHealthBarPosition();
      }
      if (bot.messageText) {
        bot.messageText.setPosition(bot.sprite.x, bot.sprite.y - 40);
      }
    });
  }

  showBotMessage(bot, message) {
    if (bot.messageText) {
      bot.messageText.destroy();
    }

    bot.messageText = this.add
      .text(bot.sprite.x, bot.sprite.y - 40, message, {
        font: "16px Arial",
        fill: "#fff",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 5, y: 3 },
        align: "center",
      })
      .setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      if (bot.messageText) {
        bot.messageText.destroy();
        bot.messageText = null;
      }
    });
  }
}
