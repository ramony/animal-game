import { Scene } from 'phaser';

class EndScene extends Scene {
  constructor() {
    super('EndScene');
  }

  init(data) {
    this.isVictory = data.victory;
    this.finalScore = data.score;
    this.level = data.level;
  }

  create() {
    // Add background with fade in
    this.background = this.add.tileSprite(0, 0, 800, 600, 'background')
      .setOrigin(0)
      .setScrollFactor(0)
      .setAlpha(0);

    // Fade in background
    this.tweens.add({
      targets: this.background,
      alpha: 1,
      duration: 1000
    });

    // Add main text
    const mainText = this.isVictory ? 'Victory!' : 'Game Over';
    const mainTextColor = this.isVictory ? '#4CAF50' : '#f44336';

    this.add.text(400, 200, mainText, {
      fontSize: '84px',
      fill: mainTextColor,
      fontStyle: 'bold'
    })
      .setOrigin(0.5)
      .setAlpha(0.5)
      .setScale(0.5);

    // Add score text
    this.add.text(400, 300, `Final Score: ${this.finalScore}`, {
      fontSize: '32px',
      fill: '#fff'
    })
      .setOrigin(0.5)
      .setAlpha(0);

    // Add level reached text
    this.add.text(400, 350, `Level Reached: ${this.level}`, {
      fontSize: '32px',
      fill: '#fff'
    })
      .setOrigin(0.5)
      .setAlpha(0);

    // Add all texts to an array for animation
    const texts = this.children.list.filter(child => child.type === 'Text');

    // Animate texts appearing
    texts.forEach((text, index) => {
      this.tweens.add({
        targets: text,
        alpha: 1,
        scale: 1,
        duration: 500,
        delay: 1000 + index * 200,
        ease: 'Back.easeOut'
      });
    });

    // Add restart button
    const restartButton = this.add.text(400, 450, 'Play Again', {
      fontSize: '32px',
      fill: '#fff'
    })
      .setOrigin(0.5)
      .setAlpha(0)
      .setInteractive();

    // Add button effects
    restartButton.on('pointerover', () => {
      restartButton.setStyle({ fill: '#ff0' });
      restartButton.setScale(1.2);
    });

    restartButton.on('pointerout', () => {
      restartButton.setStyle({ fill: '#fff' });
      restartButton.setScale(1);
    });

    restartButton.on('pointerdown', () => {
      this.restartGame();
    });

    // Animate button appearing
    this.tweens.add({
      targets: restartButton,
      alpha: 1,
      duration: 500,
      delay: 2000
    });
  }

  update() {
    // Scroll background
    this.background.tilePositionY -= 2;
  }

  restartGame() {
    // Fade out everything
    const allObjects = this.children.list;
    this.tweens.add({
      targets: allObjects,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.scene.start('GameScene', { level: this.level });
      }
    });
  }
}

export default EndScene;
