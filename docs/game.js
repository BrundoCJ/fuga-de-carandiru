class Bot {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, "player_frente1");
    this.sprite.setScale(0.5);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0);
    this.sprite.setDrag(1000); // Adiciona resistência ao movimento
    this.sprite.setDamping(true); // Habilita amortecimento
    this.sprite.setMaxVelocity(50); // Reduz a velocidade máxima

    this.sprite.body.setSize(30, 70);
    this.sprite.body.setOffset(15, 10);

    this.maxHealth = 15; // Reduzido de 30 para 15
    this.health = this.maxHealth;
    this.alive = true;

    this.angry = false; // fica bravo e persegue após tomar dano
    this.angerHits = 0; // conta os socos que tomou antes de atacar

    this.hitsDealt = 0; // quantos golpes já deu no jogador
    this.maxHits = 1; // limite de golpes causados no jogador

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
    const vx = Phaser.Math.Between(-30, 30); // Reduz a velocidade aleatória
    const vy = Phaser.Math.Between(-30, 30); // Reduz a velocidade aleatória
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
      const dx = this.sprite.x - player.x;
      const dy = this.sprite.y - player.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      // Evita divisão por zero e distância muito pequena
      if (dist < 10) dist = 10;

      const knockbackPower = 30;

      // Direção normalizada multiplicada por knockback limitado
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
class Luladrao extends Bot {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.sprite.setTexture("luladrao_frente1");
    this.sprite.setScale(0.2);
    this.sprite.body.setSize(100, 200);
    this.sprite.body.setOffset(10, 10);
    this.keyItem02 = null;
    this.isDying = false; // Flag para prevenir múltiplas chamadas de die()

    // Mensagens personalizadas do Luladrao
    this.customMessages = [
      "Como o Brasil está na UTI, coloquei um médico pra ser ministro da Fazenda",
      "Se está caro, é só não comprar",
      "FAZ O L",
      "Minha mãe era uma mulher que nasceu analfabeta",
      "Eu ROUBEI uma CHAVE",
      "O salário mínimo nunca será ideal porque ele é mínimo",
      "Feijão puro, feijão puro, feijão puro? Chega!",
      "A gente saia correndo atrás dos calanguinho, pegava o calanguinho, comia os calanguinho, e não tinha mais calanguinho",
      "Eu só sei contar até 9"
    ];
  }

  die() {
    try {
      if (this.isDying || !this.alive) return;
      this.isDying = true;

      this.alive = false;
      this.sprite.setVelocity(0, 0);
      this.sprite.setTint(0xff6666);
      this.sprite.setAlpha(0.5);
      this.sprite.anims.stop();
      this.healthBar.clear();
      this.healthBar.setAlpha(0);

      // Posiciona o item (chave) no local do Luladrao morto
      const picanhaBadge = this.scene.physics.add
        .sprite(this.sprite.x, this.sprite.y, "picanha_badge")
        .setScale(0.08);

      // Configura o overlap entre jogador e badge para coletar
      this.scene.physics.add.overlap(
        this.scene.player,
        picanhaBadge,
        () => {
          try {
            if (
              !this.scene.hasPicanhaBadge &&
              picanhaBadge &&
              picanhaBadge.active
            ) {
              this.scene.hasPicanhaBadge = true;
              picanhaBadge.destroy();
              this.scene.showKeyIndicator = this.scene.add
                .image(1200, 350, "picanha_badge")
                .setScale(0.1)
                .setScrollFactor(0);
              this.scene.badgeIcons.picanha.setAlpha(1); // Torna o ícone visível
              console.log("Badge coletada");
            }
          } catch (error) {
            console.error("Erro ao coletar badge:", error);
          }
        },
        null,
        this.scene
      );

      // Cria a segunda chave apenas se ela ainda não existir
      if (!this.keyItem02 && !this.scene.hasKey02) {
        this.keyItem02 = this.scene.physics.add
          .sprite(this.sprite.x, this.sprite.y, "key")
          .setScale(0.05);
        this.scene.keyItems.add(this.keyItem02);

        // Configura o overlap entre jogador e chave para coletar
        this.scene.physics.add.overlap(
          this.scene.player,
          this.keyItem02,
          () => {
            try {
              if (
                !this.scene.hasKey02 &&
                this.keyItem02 &&
                this.keyItem02.active
              ) {
                this.scene.hasKey02 = true;
                this.keyItem02.destroy();
                this.scene.keyItems.delete(this.keyItem02);
                this.keyItem02 = null;
                this.scene.updateKeyIndicators(); // Atualiza todos os indicadores
                this.scene.keyIcons.key2.setAlpha(1); // Torna o ícone da chave 2 visível
                console.log("Segunda chave coletada");
              }
            } catch (error) {
              console.error("Erro ao coletar segunda chave:", error);
            }
          },
          null,
          this.scene
        );
      }
    } catch (error) {
      console.error("Erro no método die do Luladrao:", error);
    }
  }

  takeDamageFrom(player) {
    super.takeDamageFrom(player);
    if (this.scene.picanha && !this.scene.picanha.isPlaying) {
      this.scene.picanha.play();
    }
  }

  updateAnimation() {
    if (!this.alive) return;
    const vx = this.sprite.body.velocity.x;
    const vy = this.sprite.body.velocity.y;

    if (Math.abs(vx) > Math.abs(vy)) {
      if (vx > 0) this.playAnimIfNotPlaying("luladrao_walk_right");
      else if (vx < 0) this.playAnimIfNotPlaying("luladrao_walk_left");
      else this.stopAnimAndSetFrame("right");
    } else if (Math.abs(vy) > 0) {
      if (vy > 0) this.playAnimIfNotPlaying("luladrao_walk_down");
      else if (vy < 0) this.playAnimIfNotPlaying("luladrao_walk_up");
    } else {
      this.stopAnimAndSetFrame("down");
    }
  }

  stopAnimAndSetFrame(direction) {
    this.sprite.anims.stop();
    const frameKeyMap = {
      down: "luladrao_frente1",
      up: "luladrao_costas1",
      left: "luladrao_esquerda1",
      right: "luladrao_direita1",
    };
    this.sprite.setTexture(frameKeyMap[direction]);
  }
}

class Moreno extends Bot {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.sprite.setTexture("moreno_frente1");
    this.sprite.setScale(0.2);
    this.sprite.body.setSize(100, 200);
    this.sprite.body.setOffset(10, 10);

    // Mensagens personalizadas do Moreno
    this.customMessages = [
      "AOOOOOOOOWWWW",
      "Vamos fazer uma trilha de bike?",
      "Tá no drive, tá no drive",
      "Galera, lembra que a lista é até domingo",
      "Você vai chupar",
      "Tá merecendo uma chupadinha",
      "Vem resolver o exercício no quadro"
    ];
  }

  // Sobrescrevendo o método die() para o bot Moreno
  die() {
    this.alive = false; // Marca o Moreno como morto
    this.sprite.setVelocity(0, 0);
    this.sprite.setTint(0xff6666);
    this.sprite.setAlpha(0.5);
    this.sprite.anims.stop();
    this.healthBar.clear();
    this.healthBar.setAlpha(0);

    // Posiciona o item (badge) no local do Moreno morto
    const BikeBadge = this.scene.physics.add
      .sprite(this.sprite.x, this.sprite.y, "bike_badge")
      .setScale(0.05);

    // Configura o overlap entre jogador e badge para coletar
    this.scene.physics.add.overlap(
      this.scene.player, // Assumindo que o jogador seja chamado "player"
      BikeBadge,
      () => {
        this.scene.hasBikeBadge = true; // Marca que o jogador tem a badge
        BikeBadge.destroy(); // Remove a badge do mapa
        this.scene.badgeIcons.bike.setAlpha(1); // Torna o ícone visível

        // !=================== !AJUSTAR POSIÇÃO DA BADGE (apenas a primeira variável "958 atualmente")! ===================!
        this.scene.showKeyIndicator = this.scene.add
          .image(1250, 350, "bike_badge")
          .setScale(0.05)
          .setScrollFactor(0); // Mostra a badge no HUD
      },
      null,
      this.scene
    );
  }
  // !=========================================== !ADICIONAR SOM DO MORENO!===========================================!
  takeDamageFrom(player) {
    super.takeDamageFrom(player);
    if (this.scene.aow && !this.scene.aow.isPlaying) {
      this.scene.aow.play();
    }
  }

  updateAnimation() {
    if (!this.alive) return;
    const vx = this.sprite.body.velocity.x;
    const vy = this.sprite.body.velocity.y;

    if (Math.abs(vx) > Math.abs(vy)) {
      if (vx > 0) this.playAnimIfNotPlaying("moreno_walk_right");
      else if (vx < 0) this.playAnimIfNotPlaying("moreno_walk_left");
      else this.stopAnimAndSetFrame("right");
    } else if (Math.abs(vy) > 0) {
      if (vy > 0) this.playAnimIfNotPlaying("moreno_walk_down");
      else if (vy < 0) this.playAnimIfNotPlaying("moreno_walk_up");
    } else {
      this.stopAnimAndSetFrame("down");
    }
  }

  stopAnimAndSetFrame(direction) {
    this.sprite.anims.stop();
    const frameKeyMap = {
      down: "moreno_frente1",
      up: "moreno_costas1",
      left: "moreno_esquerda1",
      right: "moreno_direita1",
    };
    this.sprite.setTexture(frameKeyMap[direction]);
  }
}

class Hugo extends Bot {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.sprite.setTexture("hugo_frente1");
    this.sprite.setScale(0.19);
    this.sprite.body.setSize(100, 290);
    this.sprite.body.setOffset(60, 60);

    // Mensagens personalizadas do Hugo
    this.customMessages = [
      "Quem tá me ouvindo bate uma palma",
      "GitHub Desktop não é coisa de viado",
      "Essa foi a turma com a média mais baixa",
      "Vou fazer a chamada",
      "Se você tivesse prestado atenção..."
    ];
  }
  playAnimIfNotPlaying(key) {
    if (this.sprite.anims.currentAnim?.key !== key) {
      this.sprite.anims.play(key, true);
    }
  }

  // Sobrescrevendo o método die() para o bot Hugo
  die() {
    this.alive = false; // Marca o Hugo como morto
    this.sprite.setVelocity(0, 0);
    this.sprite.setTint(0xff6666);
    this.sprite.setAlpha(0.5);
    this.sprite.anims.stop();
    this.healthBar.clear();
    this.healthBar.setAlpha(0);

    // Posiciona o item (ZeroBadge) no local do Hugo morto
    const ZeroBadge = this.scene.physics.add
      .sprite(this.sprite.x, this.sprite.y, "zero_badge")
      .setScale(0.5);

    // Configura o overlap entre jogador e badge para coletar
    this.scene.physics.add.overlap(
      this.scene.player, // Assumindo que o jogador seja chamado "player"
      ZeroBadge,
      () => {
        this.scene.hasZeroBadge = true; // Marca que o jogador tem a badge
        ZeroBadge.destroy(); // Remove a badge do mapa
        this.scene.badgeIcons.zero.setAlpha(1); // Torna o ícone visível

        // !=================== !AJUSTAR POSIÇÃO DA BADGE (apenas a primeira variável "958 atualmente")! ===================!
        this.scene.showKeyIndicator = this.scene.add
          .image(1300, 350, "zero_badge")
          .setScale(0.6)
          .setScrollFactor(0); // Mostra a badge no HUD
      }, //AJUSTADO!!!
      null,
      this.scene
    );
  }
  // !=========================================== !ADICIONAR SOM DO HUGO! ===========================================!
  //   takeDamageFrom(player) {
  //   super.takeDamageFrom(player);
  //   if (this.scene.picanha && !this.scene.picanha.isPlaying) {
  //     this.scene.picanha.play();
  //   }
  // }

  updateAnimation() {
    if (!this.alive) return;
    const vx = this.sprite.body.velocity.x;
    const vy = this.sprite.body.velocity.y;

    if (Math.abs(vx) > Math.abs(vy)) {
      if (vx > 0) this.playAnimIfNotPlaying("hugo_walk_right");
      else if (vx < 0) this.playAnimIfNotPlaying("hugo_walk_left");
      else this.stopAnimAndSetFrame("right");
    } else if (Math.abs(vy) > 0) {
      if (vy > 0) this.playAnimIfNotPlaying("hugo_walk_down");
      else if (vy < 0) this.playAnimIfNotPlaying("hugo_walk_up");
    } else {
      this.stopAnimAndSetFrame("down");
    }
  }

  stopAnimAndSetFrame(direction) {
    this.sprite.anims.stop();
    const frameKeyMap = {
      down: "hugo_frente1",
      up: "hugo_costas1",
      left: "hugo_esquerda1",
      right: "hugo_direita1",
    };
    this.sprite.setTexture(frameKeyMap[direction]);
  }
}

class Guarda {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, "guarda_direita1");
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(0.3);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0);

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

    this.chaseTimer = this.scene.time.delayedCall(30000, () => {
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
    this.sprite.setScale(0.3);
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
      const knockbackPower = 50;

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
  getRandomKeyPosition() {
    const margin = 50; // margem para não spawnar na borda
    const maxAttempts = 100; // evita loop infinito
    const minDistanceFromPlayer = 200; // distância mínima da posição do jogador (spawn)

    // Posição inicial do jogador (spawn)
    const playerSpawnX = 400;
    const playerSpawnY = 300;

    for (let i = 0; i < maxAttempts; i++) {
      const x = Phaser.Math.Between(margin, 1920 - margin);
      const y = Phaser.Math.Between(margin, 1080 - margin);

      // Cria um ponto para teste
      const point = new Phaser.Geom.Point(x, y);

      // Verifica se o ponto está dentro de alguma barreira
      const collides = this.walls.some((barrier) => {
        const rect = new Phaser.Geom.Rectangle(
          barrier.x - barrier.width / 2,
          barrier.y - barrier.height / 2,
          barrier.width,
          barrier.height
        );
        return Phaser.Geom.Rectangle.ContainsPoint(rect, point);
      });

      // Verifica se está longe do spawn do jogador
      const distFromPlayer = Phaser.Math.Distance.Between(
        x,
        y,
        playerSpawnX,
        playerSpawnY
      );

      if (!collides && distFromPlayer >= minDistanceFromPlayer) {
        return { x, y };
      }
    }

    // Se não achou posição após tentativas, retorna uma posição fixa segura longe do spawn
    return { x: playerSpawnX + minDistanceFromPlayer, y: playerSpawnY };
  }

  constructor() {
    super("MainScene");

    this.botMessages = [
      "Some daqui!",
      "Não quero falar agora.",
      "Pra fugir da prisão, tente o duto secreto.",
      "Se manda!",
      "Tá olhando o quê?",
      "Foi preso por quê?",
      "Tem um plano aí?",
      "Cuidado com os guardas.",
      "Não deixe ninguém te enganar.",
      "Já viu o túnel na cela 3?",
      "Procure o velho Lula, dizem que ele está com uma chave.",
      "Se precisar de ajuda, me chame.",
      "Nunca confie nas promessas dos outros.",
      "Lembre-se: aqui dentro, o tempo passa devagar.",
      "Tem uma chave enterrada lá fora",
    ];

    this.guards = [];
    this.lives = 10;
    this.maxLives = 10;
    this.livesSprites = [];
    this.livesBar = null;

    this.playerInvincible = false;

    // Add hole animation state
    this.holeAnimationState = 0;
    this.holeSprite = null;
    this.holeInteractionText = null;
    this.isNearHole = false;
    this.cKey = null;
    this.holeInteractionEnabled = false;

    // Add key states and indicators
    this.hasKey = false;
    this.hasKey02 = false;
    this.hasKey03 = false;
    this.keyIcon = null; // Primeira chave no HUD
    this.keyIcon02 = null; // Segunda chave no HUD
    this.keyIcon03 = null; // Terceira chave no HUD
    this.keyItem03 = null; // Terceira chave (do buraco)
    this.hasBikeBadge = false;
    this.hasZeroBadge = false;
    this.hasPicanhaBadge = false;

    this.remainingTime = 300; // 5 minutos em segundos TEMPO
    this.timerText = null;

    this.keyItems = new Set();
    this.keyIndicators = new Set();
    this.collectedKeys = []; // Array para controlar a ordem de coleta

    // Add escape related properties
    this.escapeEnabled = false;
    this.escapeSprite = null;
    this.escapeInteractionText = null;
    this.isNearEscape = false;
    this.escapePosition = { x: 1820, y: 160 }; // Posição inicial da saída (será ajustada posteriormente)

    this.badgeIcons = {
      picanha: null,
      bike: null,
      zero: null,
    };

    this.keyIcons = {
      key1: null,
      key2: null,
      key3: null,
    };

    this.attackCooldown = false; // Novo: cooldown para ataque
    this.attackCooldownTime = 700; // Novo: tempo do cooldown em ms (1 segundo)

    this.gameOver = false; // Nova flag para controlar o estado do jogo
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

    this.load.image("map", "assets/map.png");

    this.load.image("heart", "assets/heart_sprite.png");

    this.load.audio("somSoco", "assets/somSoco.mp3");

    this.load.audio("picanha", "assets/picanha.mp3");

    this.load.audio("aow", "assets/aow.mp3");

    this.load.image("luladrao_frente1", "assets/luladrao_frente1.png");
    this.load.image("luladrao_frente2", "assets/luladrao_frente2.png");

    this.load.image("luladrao_costas1", "assets/luladrao_costas1.png");
    this.load.image("luladrao_costas2", "assets/luladrao_costas2.png");

    this.load.image("luladrao_esquerda1", "assets/luladrao_esquerda1.png");
    this.load.image("luladrao_esquerda2", "assets/luladrao_esquerda2.png");

    this.load.image("luladrao_direita1", "assets/luladrao_direita1.png");
    this.load.image("luladrao_direita2", "assets/luladrao_direita2.png");

    this.load.image("picanha_badge", "assets/picanha_badge.png");

    this.load.image("hugo_frente1", "assets/hugo_frente1.png");
    this.load.image("hugo_frente2", "assets/hugo_frente1.png");

    this.load.image("hugo_costas1", "assets/hugo_costas1.png");
    this.load.image("hugo_costas2", "assets/hugo_costas2.png");

    this.load.image("hugo_direita1", "assets/hugo_direita1.png");
    this.load.image("hugo_direita2", "assets/hugo_direita2.png");

    this.load.image("hugo_esquerda1", "assets/hugo_esquerda1.png");
    this.load.image("hugo_esquerda2", "assets/hugo_esquerda2.png");

    this.load.image("zero_badge", "assets/zero_badge.png");

    this.load.image("moreno_frente1", "assets/moreno_frente1.png");
    this.load.image("moreno_frente2", "assets/moreno_frente2.png");

    this.load.image("moreno_direita1", "assets/moreno_direita1.png");
    this.load.image("moreno_direita2", "assets/moreno_direita2.png");

    this.load.image("moreno_esquerda1", "assets/moreno_esquerda1.png");
    this.load.image("moreno_esquerda2", "assets/moreno_esquerda2.png");

    this.load.image("moreno_costas1", "assets/moreno_costas1.png");
    this.load.image("moreno_costas2", "assets/moreno_costas2.png");

    this.load.image("bike_badge", "assets/bike_badge.png");
    // Load hole animation frames
    for (let i = 1; i <= 5; i++) {
      this.load.image(`buraco${i}`, `assets/buraco${i}.png`);
    }
    this.load.image("portaFuga", "assets/portaFuga.png");
  }

  create() {
    // Acessa a música que foi carregada no MenuScene
    this.musicaJogo = this.sound.get("musicaJogo"); // A música já foi carregada no MenuScene

    // Cria o sprite de tela vermelha (transparente inicialmente)
    this.redScreen = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0xff0000)
      .setOrigin(0, 0) // Coloca a origem no canto superior esquerdo
      .setAlpha(0) // Começa invisível
      .setDepth(10); // Coloca acima de tudo na cena

    this.somSoco = this.sound.add("somSoco");
    this.picanha = this.sound.add("picanha");
    this.aow = this.sound.add("aow");
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
      key: "luladrao_walk_down",
      frames: [{ key: "luladrao_frente1" }, { key: "luladrao_frente2" }],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "luladrao_walk_up",
      frames: [{ key: "luladrao_costas1" }, { key: "luladrao_costas2" }],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "luladrao_walk_left",
      frames: [{ key: "luladrao_esquerda1" }, { key: "luladrao_esquerda2" }],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "luladrao_walk_right",
      frames: [{ key: "luladrao_direita1" }, { key: "luladrao_direita2" }],
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

    this.anims.create({
      key: "hugo_walk_down",
      frames: [{ key: "hugo_frente1" }, { key: "hugo_frente2" }],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "hugo_walk_up",
      frames: [{ key: "hugo_costas1" }, { key: "hugo_costas2" }],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "hugo_walk_left",
      frames: [{ key: "hugo_esquerda1" }, { key: "hugo_esquerda2" }],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "hugo_walk_right",
      frames: [{ key: "hugo_direita1" }, { key: "hugo_direita2" }],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "moreno_walk_down",
      frames: [{ key: "moreno_frente1" }, { key: "moreno_frente2" }],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "moreno_walk_up",
      frames: [{ key: "moreno_costas1" }, { key: "moreno_costas2" }],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "moreno_walk_left",
      frames: [{ key: "moreno_esquerda1" }, { key: "moreno_esquerda2" }],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "moreno_walk_right",
      frames: [{ key: "moreno_direita1" }, { key: "moreno_direita2" }],
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

    // Variável que indica se o jogador tem a chave
    this.hasKey = false;
    this.hasKey02 = false;
    this.hasKey03 = false;
    this.keyItem03 = null;
    this.hasBikeBagde = false;
    this.hasZeroBagde = false;
    this.hasPicanhaBagde = false;

    this.lives = 5;
    this.maxLives = 5;

    // Criar corações como HUD
    this.hearts = [];

    // 2) Posição de base (X e Y da chave (ACHO QUE É DO CORAÇÃO)):
    const keyX = 50;
    const keyY = 50;

    // 3) Cálculo das dimensões do sprite do coração já escalado:
    //    - o sprite (origem: 64×64) em setScale(0.5) vira 32×32 na tela.
    const heartWidth = 32; // 64px * 0.5
    const heartHeight = 32; // 64px * 0.5

    // 4) Queremos que eles fiquem "5px acima" do topo da chave
    const spacingBetweenHearts = 2; // em px
    const heartsBaseY = keyY - heartHeight - 5; // 50 - 32 - 5 = 13

    // 5) Agora criamos tantos corações quanto maxLives, alinhados em linha a partir de keyX:
    for (let i = 0; i < this.maxLives; i++) {
      // cada coração desloca em X de "heartWidth + spacing" para o lado direito
      const x = keyX + i * (heartWidth + spacingBetweenHearts);
      const y = heartsBaseY;

      const heartIcon = this.add
        .image(x, y, "heart")
        .setOrigin(-17, -10)
        .setScale(0.5)
        .setScrollFactor(0) // fixa na câmera
        .setDepth(1000); // Garante que fique acima de tudo

      this.hearts.push(heartIcon);
    }
    // Ajustar visibilidade inicial
    this.updateHearts();

    // === TIMER ao lado dos corações ===
    this.timerText = this.add
      .text(
        keyX + this.maxLives * (heartWidth + spacingBetweenHearts) + 550,
        heartsBaseY + 323,
        "05:00",
        {
          font: "16px Arial",
          fill: "#ffffff",
          padding: { x: 10, y: 3 },
        }
      )
      .setScrollFactor(0)
      .setDepth(1000);

    // Adiciona os três badges no HUD com transparência
    this.badgeIcons.picanha = this.add
      .image(1200, 350, "picanha_badge")
      .setScale(0.1)
      .setScrollFactor(0)
      .setAlpha(0.3)
      .setDepth(1000);
    this.badgeIcons.bike = this.add
      .image(1250, 350, "bike_badge")
      .setScale(0.05)
      .setScrollFactor(0)
      .setAlpha(0.3)
      .setDepth(1000);
    this.badgeIcons.zero = this.add
      .image(1300, 350, "zero_badge")
      .setScale(0.6)
      .setScrollFactor(0)
      .setAlpha(0.3)
      .setDepth(1000);

    // Adiciona os ícones das chaves no HUD com transparência
    this.keyIcons.key1 = this.add
      .image(618, 390, "key")
      .setOrigin(0.5)
      .setScale(0.07)
      .setScrollFactor(0)
      .setAlpha(0.3)
      .setDepth(1000);
    this.keyIcons.key2 = this.add
      .image(658, 390, "key")
      .setOrigin(0.5)
      .setScale(0.07)
      .setScrollFactor(0)
      .setAlpha(0.3)
      .setDepth(1000);
    this.keyIcons.key3 = this.add
      .image(698, 390, "key")
      .setOrigin(0.5)
      .setScale(0.07)
      .setScrollFactor(0)
      .setAlpha(0.3)
      .setDepth(1000);

    // Definindo o zoom (2x)
    this.cameras.main.setZoom(2.5); //ALTERAR PARA 2.0 OU 2.5 DEPOIS (ALTEREI PARA FAZER AS BARREIRAS)

    // (2) Sempre que a câmera mudar de zoom, reduzimos a escala do HUD em 1/zoom:
    this.cameras.main.on("zoom", (camera, zoom) => {
      // cada coração tinha scale-base = 0.5
      this.hearts.forEach((h) => {
        h.setScale(0.5 / zoom);
      });
      // o ícone da chave tinha scale-base = 0.07
      if (this.keyIcon) {
        this.keyIcon.setScale(0.07 / zoom);
      }
    });
    // ── FIM DO TRECHO ADICIONADO ──
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    this.bots = [];
    for (let i = 0; i < 3; i++) {
      //ALTERAR QUANTIDADE DE BOTS (TIREI PRA FAZER AS BARREIRAS)
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const bot = new Bot(this, x, y);
      this.bots.push(bot);
    }

    this.guards = [];
    for (let i = 0; i < 15; i++) {
      // Número de guardas
      let guardX, guardY;
      let validPosition = false;

      // Gera a posição do guarda de forma que fique distante do jogador
      while (!validPosition) {
        guardX = Phaser.Math.Between(300, 1920); // Posição X aleatória (fora do alcance próximo do jogador)
        guardY = Phaser.Math.Between(100, 1080); // Posição Y aleatória

        // Verifica a distância entre o guarda e o jogador
        const dist = Phaser.Math.Distance.Between(
          guardX,
          guardY,
          this.player.x,
          this.player.y
        );

        // Se a distância for maior que 300 pixels, o guarda pode ser colocado lá
        if (dist > 300) {
          validPosition = true; // Encontrei uma posição válida
        }
      }

      const guard = new Guarda(this, guardX, guardY); // Cria o guarda
      this.guards.push(guard);
      this.bots.push(guard); // Adiciona o guarda à lista de bots
    }

    // Exemplo: criar 1 luladrao
    this.luladraos = [];
    for (let i = 0; i < 1; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const luladrao = new Luladrao(this, x, y);
      this.luladraos.push(luladrao);
      this.bots.push(luladrao); // Importante para incluir no update e colisões
    }

    this.morenos = [];
    for (let i = 0; i < 1; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const moreno = new Moreno(this, x, y);
      this.morenos.push(moreno);
      this.bots.push(moreno); // Importante para incluir no update e colisões
    }

    this.hugos = [];
    for (let i = 0; i < 1; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const hugo = new Hugo(this, x, y);
      this.hugos.push(hugo);
      this.bots.push(hugo); // Importante para incluir no update e colisões
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

    // === Evento que decrementa o timer a cada segundo ===
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
          const minutes = Math.floor(this.remainingTime / 60);
          const seconds = this.remainingTime % 60;
          const formatted = `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
          this.timerText.setText(formatted);
        } else {
          this.timerText.setText("00:00");
          window.location.reload(); // Reinicia a página
        }
      },
      callbackScope: this,
    });

    //BARREIRAS ==========================================================

    // Array para guardar as barreiras
    this.walls = [];

    //PARA FAZER AS BARREIRAAS: (EIXO X, EIXO Y, LARGURA, ALTURA)
    //TAMAMHO PADRÃO DO MAPA: 1920X1080

    const barrier1 = this.add.rectangle(270, 210, 570, 65);
    this.physics.add.existing(barrier1, true);
    barrier1.setVisible(false);
    this.walls.push(barrier1);

    //BORDA SUPERIOR
    const barrier2 = this.add.rectangle(1024, 20, 2048, 55);
    this.physics.add.existing(barrier2, true); // corpo estático
    barrier2.setVisible(false);
    this.walls.push(barrier2);

    //BORDA INFERIOR
    const barrier3 = this.add.rectangle(1024, 1080, 2200, 117);
    this.physics.add.existing(barrier3, true);
    barrier3.setVisible(false);
    this.walls.push(barrier3);

    //BORDA ESQUERDA
    const barrier4 = this.add.rectangle(10, 684, 14, 1370);
    this.physics.add.existing(barrier4, true);
    barrier4.setVisible(false);
    this.walls.push(barrier4);

    //BORDA DIREITA
    const barrier5 = this.add.rectangle(1920, 724, 70, 1367);
    this.physics.add.existing(barrier5, true);
    barrier5.setVisible(false);
    this.walls.push(barrier5);

    const barrier6 = this.add.rectangle(333, 430, 670, 65);
    this.physics.add.existing(barrier6, true);
    barrier5.setVisible(false);
    this.walls.push(barrier6);

    const barrier7 = this.add.rectangle(900, 430, 230, 65);
    this.physics.add.existing(barrier7, true);
    barrier5.setVisible(false);
    this.walls.push(barrier7);

    const barrier8 = this.add.rectangle(1360, 430, 470, 65);
    this.physics.add.existing(barrier8, true);
    barrier5.setVisible(false);
    this.walls.push(barrier8);

    const barrier9 = this.add.rectangle(740, 600, 220, 65);
    this.physics.add.existing(barrier9, true);
    barrier5.setVisible(false);
    this.walls.push(barrier9);

    const barrier10 = this.add.rectangle(850, 819, 14, 500);
    this.physics.add.existing(barrier10, true);
    barrier4.setVisible(false);
    this.walls.push(barrier10);

    const barrier11 = this.add.rectangle(910, 770, 16, 410);
    this.physics.add.existing(barrier11, true);
    barrier4.setVisible(false);
    this.walls.push(barrier11);

    const barrier12 = this.add.rectangle(1255, 770, 28, 410);
    this.physics.add.existing(barrier12, true);
    barrier4.setVisible(false);
    this.walls.push(barrier12);

    const barrier13 = this.add.rectangle(1578, 770, 30, 410);
    this.physics.add.existing(barrier13, true);
    barrier4.setVisible(false);
    this.walls.push(barrier13);

    const barrier14 = this.add.rectangle(1040, 600, 270, 65);
    this.physics.add.existing(barrier14, true);
    barrier5.setVisible(false);
    this.walls.push(barrier14);

    const barrier15 = this.add.rectangle(1420, 600, 300, 65);
    this.physics.add.existing(barrier15, true);
    barrier5.setVisible(false);
    this.walls.push(barrier15);

    const barrier16 = this.add.rectangle(1578, 200, 33, 410);
    this.physics.add.existing(barrier16, true);
    barrier4.setVisible(false);
    this.walls.push(barrier16);

    const barrier17 = this.add.rectangle(878, 200, 40, 410);
    this.physics.add.existing(barrier17, true);
    barrier4.setVisible(false);
    this.walls.push(barrier17);

    const barrier18 = this.add.rectangle(1250, 943, 240, 65);
    this.physics.add.existing(barrier18, true);
    barrier4.setVisible(false);
    this.walls.push(barrier18);

    const barrier19 = this.add.rectangle(970, 943, 135, 65);
    this.physics.add.existing(barrier19, true);
    barrier4.setVisible(false);
    this.walls.push(barrier19);

    const barrier20 = this.add.rectangle(1527, 943, 135, 65);
    this.physics.add.existing(barrier20, true);
    barrier4.setVisible(false);
    this.walls.push(barrier20); //barreura baixo

    const barrier21 = this.add.rectangle(1400, 213, 335, 65);
    this.physics.add.existing(barrier21, true);
    barrier4.setVisible(false);
    this.walls.push(barrier21);

    const barrier22 = this.add.rectangle(700, 205, 110, 90); //MESA
    this.physics.add.existing(barrier22, true);
    barrier4.setVisible(false);
    this.walls.push(barrier22);

    const barrier23 = this.add.rectangle(275, 90, 52, 60);
    this.physics.add.existing(barrier23, true);
    barrier4.setVisible(false);
    this.walls.push(barrier23);

    const barrier24 = this.add.rectangle(420, 90, 42, 60);
    this.physics.add.existing(barrier24, true);
    barrier4.setVisible(false);
    this.walls.push(barrier24);

    const barrier25 = this.add.rectangle(120, 90, 52, 60);
    this.physics.add.existing(barrier25, true);
    barrier4.setVisible(false);
    this.walls.push(barrier25);

    const barrier26 = this.add.rectangle(275, 360, 52, 120);
    this.physics.add.existing(barrier26, true);
    barrier4.setVisible(false);
    this.walls.push(barrier26);

    const barrier27 = this.add.rectangle(420, 360, 42, 120);
    this.physics.add.existing(barrier27, true);
    barrier4.setVisible(false);
    this.walls.push(barrier27);

    const barrier28 = this.add.rectangle(120, 360, 52, 120);
    this.physics.add.existing(barrier28, true);
    barrier4.setVisible(false);
    this.walls.push(barrier28);

    const barrier29 = this.add.rectangle(1400, 280, 180, 90);
    this.physics.add.existing(barrier29, true);
    barrier4.setVisible(false);
    this.walls.push(barrier29);

    const barrier30 = this.add.rectangle(1350, 85, 245, 70);
    this.physics.add.existing(barrier30, true);
    barrier4.setVisible(false);
    this.walls.push(barrier30);

    const barrier31 = this.add.rectangle(1045, 155, 170, 20);
    this.physics.add.existing(barrier31, true);
    barrier4.setVisible(false);
    this.walls.push(barrier31);

    const barrier32 = this.add.rectangle(1045, 250, 150, 20);
    this.physics.add.existing(barrier32, true);
    barrier4.setVisible(false);
    this.walls.push(barrier32);

    const barrier33 = this.add.rectangle(1045, 332, 170, 10);
    this.physics.add.existing(barrier33, true);
    barrier4.setVisible(false);
    this.walls.push(barrier33);

    const barrier35 = this.add.rectangle(973, 850, 102, 20);
    this.physics.add.existing(barrier35, true);
    barrier4.setVisible(false);
    this.walls.push(barrier35);

    const barrier36 = this.add.rectangle(973, 680, 90, 100);
    this.physics.add.existing(barrier36, true);
    barrier4.setVisible(false);
    this.walls.push(barrier36);

    const barrier37 = this.add.rectangle(1055, 660, 230, 50);
    this.physics.add.existing(barrier37, true);
    barrier4.setVisible(false);
    this.walls.push(barrier37);

    const barrier38 = this.add.rectangle(273, 596, 173, 15);
    this.physics.add.existing(barrier38, true);
    barrier4.setVisible(false);
    this.walls.push(barrier38);

    const barrier39 = this.add.rectangle(472, 596, 110, 15);
    this.physics.add.existing(barrier39, true);
    barrier4.setVisible(false);
    this.walls.push(barrier39);

    const barrier40 = this.add.rectangle(400, 685, 70, 10);
    this.physics.add.existing(barrier40, true);
    barrier4.setVisible(false);
    this.walls.push(barrier40);

    const barrier41 = this.add.rectangle(400, 738, 70, 10);
    this.physics.add.existing(barrier41, true);
    barrier4.setVisible(false);
    this.walls.push(barrier41);

    const barrier42 = this.add.rectangle(240, 738, 166, 5);
    this.physics.add.existing(barrier42, true);
    barrier4.setVisible(false);
    this.walls.push(barrier42);

    const barrier43 = this.add.rectangle(240, 690, 166, 5);
    this.physics.add.existing(barrier43, true);
    barrier4.setVisible(false);
    this.walls.push(barrier43);

    const barrier44 = this.add.rectangle(1420, 764, 172, 17);
    this.physics.add.existing(barrier44, true);
    barrier4.setVisible(false);
    this.walls.push(barrier44);

    const barrier45 = this.add.rectangle(1420, 834, 172, 17);
    this.physics.add.existing(barrier45, true);
    barrier4.setVisible(false);
    this.walls.push(barrier45);

    const barrier46 = this.add.rectangle(1420, 690, 172, 17);
    this.physics.add.existing(barrier46, true);
    barrier4.setVisible(false);
    this.walls.push(barrier46);

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
    const pos = this.getRandomKeyPosition();
    this.keyItem = this.physics.add.sprite(pos.x, pos.y, "key").setScale(0.05);
    this.keyItems.add(this.keyItem);

    // Configura o overlap entre jogador e chave para coletar
    this.physics.add.overlap(
      this.player,
      this.keyItem,
      () => {
        try {
          if (!this.hasKey && this.keyItem && this.keyItem.active) {
            this.hasKey = true;
            this.keyItem.destroy();
            this.keyItems.delete(this.keyItem);
            this.keyItem = null;
            this.updateKeyIndicators(); // Atualiza todos os indicadores
            this.keyIcons.key1.setAlpha(1); // Torna o ícone da chave 1 visível
            console.log("Primeira chave coletada");
          }
        } catch (error) {
          console.error("Erro ao coletar primeira chave:", error);
        }
      },
      null,
      this
    );

    // Add hole sprite (initially disabled)
    this.holeSprite = this.physics.add
      .sprite(1820, 160, "buraco1")
      .setScale(0.3);
    this.holeSprite.setImmovable(true);
    this.holeSprite.setVisible(false);
    this.holeSprite.setDepth(0); // Buraco fica na camada base
    this.player.setDepth(2); // Personagem fica acima do buraco
    this.bots.forEach((bot) => {
      if (bot.sprite) bot.sprite.setDepth(2); // Todos os bots ficam acima do buraco
    });

    // Add C key
    this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

    // Add interaction text (initially hidden)
    this.holeInteractionText = this.add
      .text(0, 0, "Pressione C para interagir", {
        font: "16px Arial",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(1000);

    // Add overlap detection for hole interaction
    this.physics.add.overlap(
      this.player,
      this.holeSprite,
      this.handleHoleOverlap,
      null,
      this
    );
  }

  updateKeyIndicators() {
    // Remove ícones antigos
    if (this.keyIcon) {
      this.keyIcon.destroy();
      this.keyIcon = null;
    }
    if (this.keyIcon02) {
      this.keyIcon02.destroy();
      this.keyIcon02 = null;
    }
    if (this.keyIcon03) {
      this.keyIcon03.destroy();
      this.keyIcon03 = null;
    }

    // Adiciona ícones conforme as chaves coletadas
    if (this.hasKey)
      this.keyIcon = this.add
        .image(618, 390, "key")
        .setOrigin(0.5)
        .setScale(0.07)
        .setScrollFactor(0);
    if (this.hasKey02)
      this.keyIcon02 = this.add
        .image(658, 390, "key")
        .setOrigin(0.5)
        .setScale(0.07)
        .setScrollFactor(0);
    if (this.hasKey03)
      this.keyIcon03 = this.add
        .image(698, 390, "key")
        .setOrigin(0.5)
        .setScale(0.07)
        .setScrollFactor(0);

    // Verifica se tem todas as chaves para habilitar a fuga
    if (this.hasKey && this.hasKey02 && this.hasKey03 && !this.escapeEnabled) {
      this.enableEscape();
    }
  }

  enableEscape() {
    this.escapeEnabled = true;

    // Cria o sprite da saída
    this.escapeSprite = this.physics.add
      .sprite(this.escapePosition.x, this.escapePosition.y, "buraco5")
      .setScale(0.3);
    this.escapeSprite.setImmovable(true);
    this.escapeSprite.setVisible(true);
    this.escapeSprite.setDepth(0);

    // Cria o texto de interação
    this.escapeInteractionText = this.add
      .text(0, 0, "Pressione C para fugir", {
        font: "16px Arial",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(1000);

    // Adiciona overlap para detectar quando o jogador está perto da saída
    this.physics.add.overlap(
      this.player,
      this.escapeSprite,
      this.handleEscapeOverlap,
      null,
      this
    );
  }

  handleEscapeOverlap(player, escape) {
    if (!this.escapeEnabled) return;

    const dist = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      escape.x,
      escape.y
    );

    if (dist < 50) {
      this.isNearEscape = true;
      this.escapeInteractionText.setPosition(escape.x, escape.y - 40);
      this.escapeInteractionText.setVisible(true);
    } else {
      this.isNearEscape = false;
      this.escapeInteractionText.setVisible(false);
    }
  }

  startChasingAllGuards(player) {
    this.guards.forEach((guard) => {
      guard.startChasing(player);
    });
  }

  handlePlayerGuardCollision(playerSprite, botSprite) {
    const bot = this.bots.find((b) => b.sprite === botSprite);

    if (
      bot instanceof Bot ||
      bot instanceof Luladrao ||
      bot instanceof Hugo ||
      bot instanceof Moreno ||
      bot instanceof Guarda
    ) {
      if (!this.playerInvincible && bot.alive) {
        // Adicionada verificação de bot.alive
        if (bot instanceof Bot && bot.hitsDealt >= bot.maxHits) {
          // Bot já bateu 3x, para de perseguir e volta a andar aleatoriamente
          bot.angry = false;
          bot.chaseTarget = null;
          bot.setRandomVelocity();
          return; // Não causa mais dano
        }

        // Se o bot for um Guarda ou outro bot, começa a perseguição
        if (bot instanceof Guarda || bot instanceof Bot) {
          bot.startChasing(this.player); // Inicia a perseguição do bot
        }

        this.playerInvincible = true;

        this.lives -= 1; // Linha add: Subtrai a vida
        this.updateHearts(); // Linha add2: Atualiza os corações na tela

        if (bot instanceof Bot) {
          bot.hitsDealt++;
        }

        this.startChasingAllGuards(this.player);

        if (this.lives <= 0) {
          window.location.reload();
        }

        this.time.delayedCall(1500, () => {
          this.playerInvincible = false;
        });
      }
    }
  }

  // Método para atualizar quais corações aparecem
  updateHearts() {
    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].setVisible(i < this.lives);
    }
  }

  handleHoleOverlap(player, hole) {
    // Only show interaction if hole interaction is enabled
    if (!this.holeInteractionEnabled) return;

    const dist = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      hole.x,
      hole.y
    );

    if (dist < 50) {
      this.isNearHole = true;
      this.holeInteractionText.setPosition(hole.x, hole.y - 40);
      this.holeInteractionText.setVisible(true);
    } else {
      this.isNearHole = false;
      this.holeInteractionText.setVisible(false);
    }
  }

  update() {
    // Verifica se o jogo já terminou
    if (!this.player || !this.player.active) {
      return;
    }

    // Acelera a música quando o jogador estiver com 1 coração ou quando o tempo for menor que 1 minuto
    if (this.lives === 1 || this.remainingTime <= 60) {
      if (this.musicaJogo && this.musicaJogo.rate !== 1.5) {
        this.musicaJogo.setRate(1.5); // Acelera a música para 1.5x
      }
    } else {
      if (this.musicaJogo && this.musicaJogo.rate !== 1) {
        this.musicaJogo.setRate(1); // Reseta a música para a velocidade normal
      }
    }

    // Se o jogador estiver com 1 coração, faça a tela piscar
    if (this.lives === 1 && this.redScreen && this.redScreen.active) {
      if (this.redScreen.alpha === 0) {
        // Aumenta a opacidade para 1 (vermelho suave)
        this.tweens.add({
          targets: this.redScreen,
          alpha: 0.5, // Cor vermelha com 50% de opacidade
          duration: 500, // A duração do efeito de transição (em milissegundos)
          yoyo: true, // Faz com que a animação volte para o estado inicial
          repeat: -1, // Repete infinitamente
        });
      }
    }

    const speed = 100; //ALTERAR PARA 100 (MUDEI P FZR AS BARREIRAS)
    this.player.body.setVelocity(0);

    // ── MOVIMENTAÇÃO: setas OU WASD ──
    if (this.cursors.left.isDown || this.aKey.isDown) {
      this.player.body.setVelocityX(-speed);
      if (this.player.anims.currentAnim?.key !== "walk_left") {
        this.player.anims.play("walk_left", true);
      }
    } else if (this.cursors.right.isDown || this.dKey.isDown) {
      this.player.body.setVelocityX(speed);
      if (this.player.anims.currentAnim?.key !== "walk_right") {
        this.player.anims.play("walk_right", true);
      }
    } else if (this.cursors.up.isDown || this.wKey.isDown) {
      this.player.body.setVelocityY(-speed);
      if (this.player.anims.currentAnim?.key !== "walk_up") {
        this.player.anims.play("walk_up", true);
      }
    } else if (this.cursors.down.isDown || this.sKey.isDown) {
      this.player.body.setVelocityY(speed);
      if (this.player.anims.currentAnim?.key !== "walk_down") {
        this.player.anims.play("walk_down", true);
      }
    } else {
      this.player.anims.stop();
    }
    // ── FIM MOVIMENTAÇÃO ──

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

    if (Phaser.Input.Keyboard.JustDown(this.zKey) && !this.attackCooldown) {
      this.attackCooldown = true; // Ativa o cooldown
      this.bots.forEach((bot) => {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          bot.sprite.x,
          bot.sprite.y
        );
        if (dist < 50 && bot.alive) {
          // Adicionada verificação de bot.alive
          bot.takeDamageFrom(this.player);
          this.somSoco.play();
        }
      });

      // Reseta o cooldown após o tempo definido
      this.time.delayedCall(this.attackCooldownTime, () => {
        this.attackCooldown = false;
      });
    }

    // Handle hole interaction (only if enabled)
    if (
      this.holeInteractionEnabled &&
      this.isNearHole &&
      Phaser.Input.Keyboard.JustDown(this.cKey)
    ) {
      if (this.holeAnimationState === 0) {
        // Apenas inicia a animação, sem mostrar a frase novamente
        this.holeAnimationState = 1;
      } else if (this.holeAnimationState >= 1 && this.holeAnimationState < 5) {
        // Play next animation frame
        this.holeAnimationState++;
        this.holeSprite.setTexture(`buraco${this.holeAnimationState}`);

        // When reaching the last animation frame, spawn the third key
        if (this.holeAnimationState === 5 && !this.keyItem03) {
          // Spawn the third key near the hole
          this.keyItem03 = this.physics.add
            .sprite(this.holeSprite.x + 50, this.holeSprite.y, "key")
            .setScale(0.05);

          // Add overlap detection for third key collection
          this.physics.add.overlap(
            this.player,
            this.keyItem03,
            () => {
              if (!this.hasKey03) {
                // Só coleta se ainda não tiver a chave
                this.hasKey03 = true;
                this.keyItem03.destroy();
                //this.scene.keyIcons.key3.setAlpha(1);  // Torna o ícone da chave 3 visível
                this.updateKeyIndicators();

                // Esconde o buraco e desativa a interação
                this.holeInteractionEnabled = false;
                this.holeInteractionText.setVisible(false);
                this.isNearHole = false;
              }
            },
            null,
            this
          );
        }
      }
    }

    // Update hole interaction text position if visible
    if (this.holeInteractionText.visible) {
      this.holeInteractionText.setPosition(
        this.holeSprite.x,
        this.holeSprite.y - 40
      );
    }

    // Handle escape interaction
    if (
      this.escapeEnabled &&
      this.isNearEscape &&
      Phaser.Input.Keyboard.JustDown(this.cKey)
    ) {
      this.gameOver = true; // Marca o jogo como terminado

      // Remove completamente a tela vermelha
      if (this.redScreen) {
        this.redScreen.destroy();
        this.redScreen = null;
      }

      // Esconde o player
      this.player.setVisible(false);

      // Esconde todos os bots e guardas
      this.bots.forEach((bot) => {
        if (bot.sprite) bot.sprite.setVisible(false);
      });

      // Mostra a imagem de vitória
      const victoryImage = this.add
        .image(
          this.cameras.main.centerX,
          this.cameras.main.centerY,
          "portaFuga"
        )
        .setScale(0.5)
        .setScrollFactor(0);

      console.log("Iniciando contagem regressiva para reiniciar...");

      // Reinicia o jogo após 5 segundos
      setTimeout(() => {
        console.log("Reiniciando o jogo...");
        document.location.href = document.location.href;
      }, 5000);
    }

    // Update escape interaction text position if visible
    if (this.escapeInteractionText && this.escapeInteractionText.visible) {
      this.escapeInteractionText.setPosition(
        this.escapeSprite.x,
        this.escapeSprite.y - 40
      );
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
    if (bot) {
      if (bot.messageText) {
        bot.messageText.destroy();
      }

      // Se o bot tiver mensagens personalizadas, use-as
      if (bot.customMessages) {
        message = Phaser.Utils.Array.GetRandom(bot.customMessages);
      }

      bot.messageText = this.add
        .text(bot.sprite.x, bot.sprite.y - 40, message, {
          font: "16px Arial",
          fill: "#fff",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: { x: 5, y: 3 },
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(1000);

      this.time.delayedCall(2000, () => {
        if (bot.messageText) {
          bot.messageText.destroy();
          bot.messageText = null;
        }
      });
    } else {
      // For hole messages
      const text = this.add
        .text(this.holeSprite.x, this.holeSprite.y - 60, message, {
          font: "16px Arial",
          fill: "#fff",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: { x: 5, y: 3 },
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(1000);

      this.time.delayedCall(2000, () => {
        text.destroy();
      });
    }

    // Enable hole interaction if this is the specific message
    if (message === "Tem uma chave enterrada lá fora") {
      this.holeInteractionEnabled = true;
      this.holeSprite.setVisible(true);
    }
  }
}
