import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Graphics, Text, AnimatedSprite, Sprite, useTick, useLoader } from '@pixi/react';
import gsapNew from '../hooks/gsapNew';
import * as PIXI from 'pixi.js'
import useKeys from '../hooks/useKeys';
import { inDistance } from '../lib/mathUtils';

import Bullets from './Bullets';
import Enemies from './Enemies';

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
      speed: 4,
      radius: 10
    },
    enemy: {
      createCount: 2,
      speed: 1.2,
      radius: 10,
      updateInterval: 2000
    }
  }
  const counter = useRef(0);

  const [textures, setTextures] = useState({});

  const [player, setPlayer] = useState({ level: 1, score: 0 });
  const playerRef = useRef(null);

  const bulletRefs = useRef({});
  const [bullets, setBullets] = useState([]); // enimies 

  const enemyRefs = useRef({});
  const [enemies, setEnemies] = useState([]); // enimies 

  const deadRef = useRef({});

  const [keys, registerPress] = useKeys()
  const [loadComplete, setLoadComplete] = useState(false);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    PIXI.Assets.load("/dragon.json").then((resources) => {
      const dragonFrames = resources.animations.flyingdragon;
      setTextures({
        player: dragonFrames,
        bullet: resources.animations.drop,
        enemy: resources.animations.zhaoyun
      });
      setLoadComplete(true);
    });
    setInterval(() => {
      createEnemy(config.enemy.createCount);
    }, config.enemy.updateInterval);
  }, []);

  useEffect(() => {
    registerPress('Space', () => {
      shoot({
        x: playerRef.current.x,
        y: playerRef.current.y
      })
    })
  }, [enemies]);

  const bulletMove = useCallback((bullet) => {
    gsapNew.move({ ...bullet }, {
      compute: function () {
        return {
          x: this.current.x,
          y: this.current.y - config.bullet.speed
        }
      },
      duration: 100,
      onUpdate: function () {
        const { x, y } = this.targets()[0];
        //console.log('onUpdate2', Object.entries(enemyRefs.current)[0][1].x)

        const allEnemies = Object.entries(enemyRefs.current).filter(([id, ref]) => ref).map(([id, ref]) => {
          return {
            id: parseInt(id),
            x: ref.x,
            y: ref.y
          }
        });
        //console.log('onUpdate', allEnemies)

        const hitEnemy = allEnemies.find(e => inDistance(e, { x, y }, config.bullet.radius + config.enemy.radius))
        if (hitEnemy && deadRef.current[hitEnemy.id] !== true) {
          deadRef.current[hitEnemy.id] = true
          console.log('hit', hitEnemy.id)
          setEnemies(prev => {
            const result = prev.filter(e => e.id !== hitEnemy.id)
            return result
          })
          setBullets(prev => {
            return prev.filter(b => b.id !== bullet.id)
          })
          this.kill();
          setPlayer(prev => {
            return {
              ...prev,
              score: prev.score + 1
            }
          })
          return
        } else if (y < config.bullet.radius) {
          this.kill();
          setBullets(prev => {
            return prev.filter(b => b.id !== bullet.id)
          })
          return
        }
        const bulletRef = bulletRefs.current[bullet.id]
        if (bulletRef) {
          bulletRef.x = x
          bulletRef.y = y
        }
      }
    });
  }, [enemies])

  const enemyMove = useCallback((enemy) => {
    gsapNew.move({ ...enemy }, {
      compute: function () {
        return {
          x: this.current.x,
          y: this.current.y + config.enemy.speed
        }
      },
      duration: 100,
      onUpdate: function () {
        const { x, y } = this.targets()[0]
        if (y > height - config.enemy.radius) {
          this.kill();
          setEnemies(prev => {
            return prev.filter(b => b.id !== enemy.id)
          })
          return
        }
        setEnemies(prev => {
          return prev.map(e => {
            if (e.id === enemy.id) {
              return {
                ...e,
                x, y
              }
            }
            return e
          })
        })
        const enemyRef = enemyRefs.current[enemy.id]
        if (enemyRef) {
          enemyRef.x = x
          enemyRef.y = y
        }
      }
    });
  }, [])

  const shoot = useCallback((basePoint) => {
    const newBullets = Array(3).fill(0).map((_, index) => {
      const bullet = {
        id: counter.current++,
        x: basePoint.x + (index - 1) * 15,
        y: basePoint.y - 10
      }
      bulletMove(bullet);
      return bullet
    })
    setBullets(prev => [...prev, ...newBullets])
  }, [enemies])

  const createEnemy = useCallback((count) => {
    const newEnemies = Array(count).fill(0).map((_, index) => {
      const enemy = {
        id: counter.current++,
        x: Math.random() * width,
        y: config.enemy.radius,
        hp: 1
      }
      enemyMove(enemy);
      return enemy
    })
    setEnemies(prev => [...prev, ...newEnemies])
  }, [])

  // 使用 useTick 实现实时更新
  useTick(() => {
    //setFps(PIXI.Ticker.shared.FPS.toFixed(0)); // 保留两位小数

    const { speed, radius } = config.player;
    const curr = playerRef.current;
    if (curr) {
      if (keys.ArrowLeft) {
        curr.x = Math.max(curr.x - speed, radius)
      } else if (keys.ArrowRight) {
        curr.x = Math.min(curr.x + speed, width - radius)
      } else if (keys.ArrowUp) {
        curr.y = Math.max(curr.y - speed, radius)
      } else if (keys.ArrowDown) {
        curr.y = Math.min(curr.y + speed, height - radius)
      }
      playerRef.current.x = curr.x;
      playerRef.current.y = curr.y;
    }

  });

  if (!loadComplete) {
    return (
      <Container></Container>
    )
  }

  return (
    <Container>
      <Text
        text={`Score: ${player.score}`}
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
          textures={textures.player}
        />
      </Container>

      <Bullets bullets={bullets} onRef={(id, el) => { bulletRefs.current[id] = el }}
        textures={textures.bullet} />

      <Enemies enemies={enemies} onRef={(id, el) => { enemyRefs.current[id] = el }}
        textures={textures.enemy} />

    </Container>
  );
};

export default DragonScene;