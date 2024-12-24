import { Scene } from 'phaser';

class GameScene extends Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.bullets = null;
    this.powerups = null;
    this.score = 0;
    this.scoreText = null;
    this.level = 1;
    this.weaponType = 1;
    this.gameOver = false;
  }

  init(data) {
    this.level = data.level || 1;
    this.score = 0;
    this.weaponType = 1;
    this.gameOver = false;
  }

  create() {

    if (!this.anims.exists('playerAnimation')) {
      var frames = this.anims.generateFrameNames('player', { start: 0, end: 3, prefix: 'flyingdragon-', suffix: '.png' });
      this.anims.create({ key: 'playerAnimation', frames: frames, frameRate: 5, repeat: -1 });
    }

    // Add scrolling background
    this.background = this.add.tileSprite(0, 0, 800, 600, 'background')
      .setOrigin(0)
      .setScrollFactor(0);

    // Create player
    this.player = this.physics.add.sprite(400, 500, 'player');

    this.player.play('playerAnimation');

    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.5);

    // Create groups
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.powerups = this.physics.add.group();

    // Add collisions
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.collider(this.player, this.enemies, this.gameOverHandler, null, this);
    this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);

    // Add score and level text
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    this.levelText = this.add.text(16, 56, `Level: ${this.level}`, { fontSize: '32px', fill: '#fff' });

    // Add controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', this.shoot, this);

    // Start spawning enemies
    this.spawnEnemies();

    // Start spawning powerups
    this.time.addEvent({
      delay: 10000,
      callback: this.spawnPowerup,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (this.gameOver) return;

    // Scroll background
    this.background.tilePositionY -= 2;

    // Player movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // Clean up bullets
    this.bullets.getChildren().forEach(bullet => {
      if (bullet.y < 0) bullet.destroy();
    });

    this.enemies.getChildren().forEach(enemy => {
      if (enemy.y > 800) enemy.destroy();
    });

    // Check if all enemies are destroyed
    if (this.enemies.getChildren().length === 0) {
      this.levelComplete();
    }
  }

  shoot() {
    if (this.gameOver) return;

    const bulletConfig = {
      1: { count: 1, spread: 5, speed: -400, texture: 'bullet1' },
      2: { count: 2, spread: 20, speed: -400, texture: 'bullet1' },
      3: { count: 3, spread: 15, speed: -500, texture: 'bullet2' }
    };

    const config = bulletConfig[this.weaponType];

    for (let i = 0; i < config.count; i++) {
      const offsetX = (i - (config.count - 1) / 2) * config.spread;
      const bullet = this.bullets.create(this.player.x + offsetX, this.player.y - 20, config.texture);
      bullet.setVelocityY(config.speed);
    }
  }

  spawnEnemies() {
    const enemyConfigs = {
      1: { count: 2, speed: 100, health: 2, texture: 'enemy1', points: 10 },
      2: { count: 7, speed: 150, health: 2, texture: 'enemy2', points: 20 },
      3: { count: 10, speed: 200, health: 3, texture: 'enemy3', points: 30 }
    };

    const config = enemyConfigs[this.level];

    for (let i = 0; i < config.count; i++) {
      const x = Phaser.Math.Between(100, 700);
      const enemy = this.enemies.create(x, -50 - i * 250, config.texture);
      enemy.setScale(0.6);
      enemy.health = config.health;
      enemy.points = config.points;
      enemy.setVelocityY(config.speed);
    }
  }

  spawnPowerup() {
    if (this.gameOver) return;

    const x = Phaser.Math.Between(100, 700);
    const powerupType = Phaser.Math.Between(1, 2);
    const powerup = this.powerups.create(x, -50, `powerup${powerupType}`);
    powerup.type = powerupType;
    powerup.setVelocityY(150);
  }

  collectPowerup(player, powerup) {
    powerup.destroy();

    if (powerup.type === 1) {
      this.weaponType = Math.min(this.weaponType + 1, 3);
    } else {
      // Temporary invincibility
      player.alpha = 0.5;
      this.time.delayedCall(5000, () => {
        player.alpha = 1;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.health--;

    if (enemy.health <= 0) {
      enemy.destroy();
      this.score += enemy.points;
      this.scoreText.setText('Score: ' + this.score);
    }
  }

  levelComplete() {
    if (this.level < 3) {
      this.scene.start('LevelComplete', { level: this.level });
    } else {
      this.gameOver = true;
      this.scene.start('EndScene', {
        victory: true,
        score: this.score,
        level: this.level
      });
    }
  }

  gameOverHandler() {
    if (this.player.alpha < 1) return; // Invincible

    this.gameOver = true;
    this.physics.pause();

    this.scene.start('EndScene', {
      victory: false,
      score: this.score,
      level: this.level
    });
  }
}

export default GameScene;
