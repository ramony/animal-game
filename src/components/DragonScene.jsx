import { useState, useEffect, useRef, memo } from 'react';
import { Container, Graphics, Text, AnimatedSprite, Sprite, useTick, useLoader } from '@pixi/react';
import gsapNew from '../hooks/gsapNew';
import * as PIXI from 'pixi.js'
import useKeys from '../hooks/useKeys';

const counter = { value: 0 }

const DragonScene = ({ width, height, top, left }) => {

  const config = {
    fontSize: 10,
    player: {
      initX: width / 2,
      initY: height - 20,
      speed: 5,
      radius: 20
    },
    bullet: {
      speed: 6
    }
  }

  const [player, setPlayer] = useState({ x: config.player.initX, y: config.player.initY });
  const playerRef = useRef(null);
  const [playerTextures, setPlayerTextures] = useState([]);

  const [bulletTextures, setBulletTextures] = useState([]);
  const bulletRefs = useRef({});
  const [bullets, setBullets] = useState([]); // enimies 

  const [enemyTextures, setEnemyTextures] = useState([]);
  const enemyRefs = useRef({});
  const [enemies, setEnemies] = useState([]); // enimies 

  const [keys, registerPress] = useKeys()
  const [loadComplete, setLoadComplete] = useState(false);
  const [fps, setFps] = useState(0);

  const shoot = () => {
    const bullet = {
      id: counter.value++,
      x: player.x,
      y: player.y - 10
    }
    gsapNew.move({ ...bullet }, {
      compute: function () {
        return {
          x: this.current.x,
          y: this.current.y - config.bullet.speed
        }
      },
      duration: 10,
      onUpdate: function () {
        const { x, y } = this.targets()[0]
        if (y < 0) {
          this.kill();
          setBullets(prev => {
            //console.log('kill', bullet.id)
            delete bulletRefs.current[bullet.id];
            return prev.filter(b => b.id !== bullet.id)
          })
          return
        }
        bulletRefs.current[bullet.id].x = x
        bulletRefs.current[bullet.id].y = y
      }
    });

    setBullets(prev => [...prev, bullet])
  }

  useEffect(() => {

    PIXI.Assets.load("/dragon.json").then((resources) => {
      const dragonFrames = resources.animations.flyingdragon;

      setPlayerTextures([dragonFrames[0], dragonFrames[2], dragonFrames[1], dragonFrames[2]]);
      setBulletTextures(resources.animations.drop);

      setLoadComplete(true);
    });
  }, []);

  useEffect(() => {
    registerPress('Space', () => {
      shoot()
    })
  }, [player]);

  // 使用 useTick 实现实时更新
  useTick(() => {
    //setFps(PIXI.Ticker.shared.FPS.toFixed(0)); // 保留两位小数

    const speed = config.player.speed
    const radius = config.player.radius

    setPlayer(prev => {
      const curr = { ...prev };
      if (keys.ArrowLeft) {
        curr.x = Math.max(curr.x - speed, radius)
      } else if (keys.ArrowRight) {
        curr.x = Math.min(curr.x + speed, width - radius)
      } else if (keys.ArrowUp) {
        curr.y = Math.max(curr.y - speed, radius)
      } else if (keys.ArrowDown) {
        curr.y = Math.min(curr.y + speed, height - radius)
      }
      if (playerRef.current) {
        playerRef.current.x = curr.x;
        playerRef.current.y = curr.y;
      }
      return curr;
    })
  });

  if (!loadComplete) {
    return (
      <Container></Container>
    )
  }

  return (
    <Container>
      <Text
        text={`FPS: ${fps}`}
        x={0}
        y={0}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: config.fontSize
        })}
      />

      <Container ref={playerRef} x={config.player.initX} y={config.player.initY}>
        <AnimatedSprite
          scale={0.3}
          anchor={0.5}
          animationSpeed={0.05}
          isPlaying={true}
          textures={playerTextures}
        />
      </Container>

      {
        bullets.map((bullet, index) => (
          <AnimatedSprite key={index} ref={el => bulletRefs.current[bullet.id] = el}
            scale={0.4} anchor={0.5}
            animationSpeed={0.07} isPlaying={true} textures={bulletTextures} />
        ))
      }

    </Container>
  );
};

export default DragonScene;