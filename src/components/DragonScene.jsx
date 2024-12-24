import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Graphics, Text, AnimatedSprite, Sprite, useTick, useLoader } from '@pixi/react';
import gsapNew from '../hooks/gsapNew';
import * as PIXI from 'pixi.js'
import useKeys from '../hooks/useKeys';
import { inDistance } from '../lib/mathUtils';

import Bullets from './Bullets';
import Enemies from './Enemies';
import config from '../config/DragonConfig';

const DragonScene = ({ width, height, top, left }) => {

  const counter = useRef(0);

  const [gameState, setGameState] = useState({
    score: 0,
    isGameOver: false,
    remainingEnemies: 10,
    level: 1,
    baseEnemyCount: 10,
    baseEnemySpeed: 2,
    gamePhase: 'playing' // 'start', 'playing', 'levelComplete', 'gameOver'
  })

  const [textures, setTextures] = useState({});

  const [player, setPlayer] = useState(null);
  const playerRef = useRef(null);

  const [bullets, setBullets] = useState([]); // enimies 
  const bulletRefs = useRef({});

  const [enemies, setEnemies] = useState([]); // enimies 
  const enemyRefs = useRef({});

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
    setTimeout(() => {
      createPlayer();
    }, 10);
  }, []);

  useEffect(() => {
    registerPress('Space', () => {
      shoot()
    })
  }, [player]);

  const createPlayer = useCallback(() => {
    const player = {
      id: counter.current++,
      x: width / 2,
      y: height - 20,
      level: 1,
      hp: 100,
      shoots: 0
    }
    playerMove(player);
    setPlayer(player);
  }, [])

  const shoot = useCallback(() => {
    const { x, y } = playerRef.current
    const shootLevel = 1 + Math.floor(player.shoots / 3)
    const newBullets = Array(shootLevel).fill(0).map((_, index) => {
      const bullet = {
        id: counter.current++,
        x: x + (index - Math.floor(shootLevel / 2)) * 15,
        y: y - 10
      }
      bulletMove(bullet);
      return bullet
    })
    setBullets(prev => [...prev, ...newBullets])
  }, [player])

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

  const playerMove = useCallback((player) => {
    gsapNew.move({ ...player }, {
      compute: function () {
        const { speed, radius } = config.player;
        const curr = this.current;
        if (keys.ArrowLeft) {
          curr.x = Math.max(curr.x - speed, radius)
        } else if (keys.ArrowRight) {
          curr.x = Math.min(curr.x + speed, width - radius)
        } else if (keys.ArrowUp) {
          curr.y = Math.max(curr.y - speed, radius)
        } else if (keys.ArrowDown) {
          curr.y = Math.min(curr.y + speed, height - radius)
        }
        return curr;
      },
      duration: -1,
      onUpdate: function () {
        const curr = this.targets()[0];
        const allEnemies = Object.entries(enemyRefs.current).filter(([id, ref]) => ref).map(([id, ref]) => {
          return {
            id: parseInt(id),
            x: ref.x,
            y: ref.y
          }
        });
        const hitEnemy = allEnemies.find(e => inDistance(e, curr, config.bullet.radius + config.enemy.radius))
        if (hitEnemy && deadRef.current[hitEnemy.id] !== true) {
          deadRef.current[hitEnemy.id] = true
          setPlayer(prev => {
            const hp = prev.hp - 10;
            if (hp <= 0) {
              setGameState(prev => {
                return {
                  ...prev,
                  isGameOver: true
                }
              })
            };
            return {
              ...prev,
              hp: hp
            }
          })
        }
        if (playerRef.current) {
          playerRef.current.x = curr.x;
          playerRef.current.y = curr.y;
        }
      }
    });
  }, [enemies])

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
        const curr = this.targets()[0];
        const allEnemies = Object.entries(enemyRefs.current).filter(([id, ref]) => ref).map(([id, ref]) => {
          return {
            id: parseInt(id),
            x: ref.x,
            y: ref.y
          }
        });
        const hitEnemy = allEnemies.find(e => inDistance(e, curr, config.bullet.radius + config.enemy.radius))
        if (hitEnemy && deadRef.current[hitEnemy.id] !== true) {
          deadRef.current[hitEnemy.id] = true
          //console.log('hit', hitEnemy.id)
          setEnemies(prev => {
            const result = prev.filter(e => e.id !== hitEnemy.id)
            return result
          })
          setBullets(prev => {
            return prev.filter(b => b.id !== bullet.id)
          })
          setPlayer(prev => {
            return {
              ...prev,
              shoots: prev.shoots + 1
            }
          })
          this.kill();
          setGameState(prev => {
            const score = prev.score + 1;
            return {
              ...prev,
              score
            }
          })
          return
        } else if (curr.y < config.bullet.radius) {
          this.kill();
          setBullets(prev => {
            return prev.filter(b => b.id !== bullet.id)
          })
          return
        }
        const bulletRef = bulletRefs.current[bullet.id]
        if (bulletRef) {
          bulletRef.x = curr.x
          bulletRef.y = curr.y
        }
      }
    });
  }, [player])

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
        const enemyRef = enemyRefs.current[enemy.id]
        if (enemyRef) {
          enemyRef.x = x
          enemyRef.y = y
        }
      }
    });
  }, [])

  // 使用 useTick 实现实时更新
  useTick(() => {
    //setFps(PIXI.Ticker.shared.FPS.toFixed(0)); // 保留两位小数

  });

  if (!loadComplete) {
    return (
      <Container></Container>
    )
  }

  return (
    <Container>
      <Text
        text={`score: ${gameState.score}`}
        x={0}
        y={0}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: config.fontSize
        })}
      />

      <Text
        text={`hp: ${player.hp}`}
        x={80}
        y={0}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: config.fontSize
        })}
      />

      <Text
        text={`status: ${gameState.isGameOver}`}
        x={160}
        y={0}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: config.fontSize
        })}
      />

      <Bullets bullets={bullets} onRef={(id, el) => { bulletRefs.current[id] = el }}
        textures={textures.bullet} />

      <Enemies enemies={enemies} onRef={(id, el) => { enemyRefs.current[id] = el }}
        textures={textures.enemy} />

      <Container ref={playerRef}>
        <AnimatedSprite
          scale={0.3}
          anchor={0.5}
          animationSpeed={0.05}
          isPlaying={true}
          textures={textures.player}
        />
      </Container>
    </Container>
  );
};

export default DragonScene;