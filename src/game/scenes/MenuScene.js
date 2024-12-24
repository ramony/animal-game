import { Scene } from 'phaser';

class MenuScene extends Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    // Add background
    this.add.tileSprite(0, 0, 800, 600, 'background').setOrigin(0);

    // Add title
    this.add.text(400, 200, 'SPACE SHOOTER', {
      fontSize: '64px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add start button
    const startButton = this.add.text(400, 300, 'Start Game', {
      fontSize: '32px',
      fill: '#fff'
    }).setOrigin(0.5).setInteractive();

    // Add level select buttons
    for (let i = 1; i <= 3; i++) {
      const levelButton = this.add.text(400, 350 + i * 40, `Level ${i}`, {
        fontSize: '24px',
        fill: '#fff'
      }).setOrigin(0.5).setInteractive();

      levelButton.on('pointerover', () => levelButton.setStyle({ fill: '#ff0' }));
      levelButton.on('pointerout', () => levelButton.setStyle({ fill: '#fff' }));
      levelButton.on('pointerdown', () => this.startLevel(i));
    }

    // Button interactions
    startButton.on('pointerover', () => startButton.setStyle({ fill: '#ff0' }));
    startButton.on('pointerout', () => startButton.setStyle({ fill: '#fff' }));
    startButton.on('pointerdown', () => this.startLevel(1));
  }

  startLevel(level) {
    const allObjects = this.children.list;
    this.tweens.add({
      targets: allObjects,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.scene.start('GameScene', { level });
      }
    });
  }
}

export default MenuScene;
