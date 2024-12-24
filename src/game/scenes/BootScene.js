import { Scene } from 'phaser';

class BootScene extends Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Load all game assets
    this.load.atlas('player', '/assets/dragon.png', '/assets/dragon.json')
    //this.load.image('player', '/assets/images/player.svg');
    this.load.image('enemy1', '/assets/images/enemy1.svg');
    this.load.image('enemy2', '/assets/images/enemy2.svg');
    this.load.image('enemy3', '/assets/images/enemy3.svg');
    this.load.image('bullet1', '/assets/images/bullet1.svg');
    this.load.image('bullet2', '/assets/images/bullet2.svg');
    this.load.image('powerup1', '/assets/images/powerup1.svg');
    this.load.image('powerup2', '/assets/images/powerup2.svg');
    this.load.image('background', '/assets/images/background.svg');

    // Add loading text
    const loadingText = this.add.text(400, 300, 'Loading...', {
      fontSize: '32px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Add loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 350, 320, 30);

    // Loading progress events
    this.load.on('progress', function (value) {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 360, 300 * value, 10);
    });

    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

  }

  create() {
    this.scene.start('StartScene');
  }
}

export default BootScene;
