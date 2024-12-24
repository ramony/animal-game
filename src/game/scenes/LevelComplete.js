import { Scene } from 'phaser';

class LevelComplete extends Scene {
  constructor() {
    super('LevelComplete');
  }

  init(data) {
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
      duration: 500
    });

    // Add level complete text
    const levelText = this.add.text(400, 200, `Level ${this.level} Complete!`, {
      fontSize: '64px',
      fill: '#4CAF50',
      fontStyle: 'bold'
    })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.5);

    // Add "Get Ready" text
    const readyText = this.add.text(400, 300, 'Get Ready for Next Level', {
      fontSize: '32px',
      fill: '#fff'
    })
      .setOrigin(0.5)
      .setAlpha(0);

    // Animate texts
    this.tweens.add({
      targets: [levelText, readyText],
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Add countdown
    let countdown = 3;
    const countdownText = this.add.text(400, 400, countdown.toString(), {
      fontSize: '72px',
      fill: '#fff'
    })
      .setOrigin(0.5)
      .setAlpha(0);

    // Fade in countdown
    this.tweens.add({
      targets: countdownText,
      alpha: 1,
      duration: 500
    });

    // Countdown timer
    const timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        countdown--;
        countdownText.setText(countdown.toString());
        
        if (countdown === 0) {
          this.startNextLevel();
        }
      },
      repeat: 2
    });
  }

  update() {
    // Scroll background
    this.background.tilePositionY -= 2;
  }

  startNextLevel() {
    // Fade out everything
    const allObjects = this.children.list;
    this.tweens.add({
      targets: allObjects,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.scene.start('GameScene', { level: this.level + 1 });
      }
    });
  }
}

export default LevelComplete;
