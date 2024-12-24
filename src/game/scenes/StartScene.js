import { Scene } from 'phaser';

class StartScene extends Scene {
  constructor() {
    super('StartScene');
    this.titleText = null;
    this.startButton = null;
  }

  create() {
    // Add scrolling background
    this.background = this.add.tileSprite(0, 0, 800, 600, 'background')
      .setOrigin(0)
      .setScrollFactor(0);

    // Add title with animation
    this.titleText = this.add.text(400, -100, 'SPACE SHOOTER', {
      fontSize: '72px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Animate title dropping in
    this.tweens.add({
      targets: this.titleText,
      y: 200,
      duration: 1000,
      ease: 'Bounce.easeOut',
      onComplete: () => this.showStartButton()
    });
  }

  showStartButton() {
    // Create start button with fade in
    this.startButton = this.add.text(400, 400, 'Click to Start', {
      fontSize: '32px',
      fill: '#fff'
    })
      .setOrigin(0.5)
      .setAlpha(0)
      .setInteractive();

    // Add hover effect
    this.startButton.on('pointerover', () => {
      this.startButton.setStyle({ fill: '#ff0' });
      this.startButton.setScale(1.2);
    });

    this.startButton.on('pointerout', () => {
      this.startButton.setStyle({ fill: '#fff' });
      this.startButton.setScale(1);
    });

    // Add click handler
    this.startButton.on('pointerdown', () => {
      this.startGame();
    });

    // Fade in animation
    this.tweens.add({
      targets: this.startButton,
      alpha: 1,
      duration: 500
    });
  }

  update() {
    // Scroll background
    this.background.tilePositionY -= 2;
  }

  startGame() {
    // Fade out everything
    this.tweens.add({
      targets: [this.titleText, this.startButton],
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.scene.start('MenuScene');
      }
    });
  }
}

export default StartScene;
