import { Container, Graphics, Text, useTick, AnimatedSprite } from '@pixi/react'
import { useCallback, useEffect, useState } from 'react'
import * as PIXI from 'pixi.js'
import '@pixi/events';
import { useLinearMove, useRotateMove } from '../hooks/move'
import { useAnimations } from '../hooks/useAnimations';
import gsap from 'gsap'
import useKeys from '../hooks/useKeys';

const GameScene = ({ width, height }) => {
  // 修改游戏状态，添加新的状态
  const [gameState, setGameState] = useState({
    score: 0,
    isGameOver: false,
    remainingEnemies: 10,
    level: 1,
    baseEnemyCount: 10,
    baseEnemySpeed: 2,
    gamePhase: 'playing' // 'start', 'playing', 'levelComplete', 'gameOver'
  })

  const [addAll, getTargetMap, stopAnimation] = useAnimations();

  // 主角位置状态
  const [player, setPlayer] = useState({ x: width / 2, y: height / 2, radius: 20 })
  // 敌人状态数组
  const [enemies, setEnemies] = useState([])
  // 按键状态
  // const [keys, setKeys] = useState({
  //   ArrowUp: false,
  //   ArrowDown: false,
  //   ArrowLeft: false,
  //   ArrowRight: false,
  // })
  const [keys, registerPress] = useKeys()


  const move = useRotateMove({});

  // 添加动画状态
  const [animations, setAnimations] = useState({
    playerRotation: 0,
    enemyScales: Array(10).fill(1),
    enemyScaleDirections: Array(10).fill(1),
    disappearingEnemies: []
  })

  // 修改初始化敌人的代码，根据关卡调整数量和速度
  const createEnemies = useCallback(() => {
    const enemyCount = gameState.baseEnemyCount + (gameState.level - 1) * 2
    const speedMultiplier = 1 + (gameState.level - 1) * 0.2
    const newEnemies = []

    for (let i = 0; i < enemyCount; i++) {
      newEnemies.push({
        x: Math.random() * (width - 40) + 20,
        y: Math.random() * (height - 40) + 20,
        radius: 15,
        id: i,
        // 速度随关卡提升
        speedX: (Math.random() - 0.5) * 3 * speedMultiplier,
        speedY: (Math.random() - 0.5) * 3 * speedMultiplier
      })
    }
    return newEnemies
  }, [width, height, gameState.level, gameState.baseEnemyCount])

  // 修改开始游戏函数
  const startLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing'
    }))
  }, [])

  // 修改重置游戏函数
  const resetGame = useCallback(() => {
    setPlayer({ x: width / 2, y: height / 2, radius: 20 })
    setGameState(prev => ({
      score: 0,
      isGameOver: false,
      level: 1,
      baseEnemyCount: 10,
      baseEnemySpeed: 2,
      remainingEnemies: 10,
      gamePhase: 'start'
    }))
    setEnemies(createEnemies())
  }, [width, height, createEnemies])

  // 修改进入下一关函数
  const nextLevel = useCallback(() => {
    setPlayer({ x: width / 2, y: height / 2, radius: 20 })
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
      isGameOver: false,
      remainingEnemies: prev.baseEnemyCount + (prev.level) * 2,
      gamePhase: 'start'
    }))
    setEnemies(createEnemies())
  }, [width, height, createEnemies])

  // 初始化敌人
  useEffect(() => {
    setEnemies(createEnemies())
  }, [createEnemies])

  const playerRandomMove = useCallback(() => {
    const x = { v: player.x, dV: 200 * (0.5 - Math.random()), easeFn: 'easeInQuad' }
    const y = { v: player.y, dV: 250 * (0.5 - Math.random()), easeFn: null }
    move.start(1, { x, y }, 5)
  }, [player])

  const playerCircleMove = useCallback(() => {
    return gsap.to(player, {
      //y: player.y - 200, // 最终半径
      y: () => {
        return player.y + 500;
      },
      duration: 0.5,
      ease: "power1.inOut",
      repeat: 1,
      yoyo: true,
      onUpdate: function () {
        //console.log('progress', this.progress)
        //setPlayer(prev => ({ ...prev, y: this.targets()[0].y })); // 更新半径
      },
    });
  }, [player])

  const playerCircleMove2 = useCallback(() => {
    const circle = { v: { x: player.x, y: player.y }, radius: 150, easeFn: 'arc' }
    move.start(1, { circle }, 0.3)
  }, [player])

  const [playerCircleMove2Tween, setPlayerCircleMove2Tween] = useState(null)

  const handleKeyDown = useCallback((e) => {
    console.log('code', e.code)
    if (e.code === 'Space') {
      if (gameState.gamePhase === 'start') {
        startLevel()
      } else if (gameState.gamePhase === 'levelComplete') {
        nextLevel()
      } else if (gameState.gamePhase === 'gameOver') {
        resetGame()
      } else {
        setPlayerCircleMove2Tween(playerCircleMove())
      }
    }
    if (keys.hasOwnProperty(e.key)) {
      setKeys((prev) => ({ ...prev, [e.key]: true }))
    }
  }, [gameState.gamePhase, startLevel, nextLevel, resetGame, player])

  const [loadComplete, setLoadComplete] = useState(false);

  const [bulletTexture, setBulletTexture] = useState([]);
  const [playerTexture, setPlayerTexture] = useState([]);

  useEffect(() => {
    PIXI.Assets.load("/dragon.json").then((resources) => {
      const dragonFrames = resources.animations.flyingdragon;
      const zhaoyun = resources.animations.zhaoyun;
      setBulletTexture(zhaoyun);
      setPlayerTexture([dragonFrames[0], dragonFrames[2], dragonFrames[1], dragonFrames[2]]);
      setLoadComplete(true);
    });
  }, []);
  // 键盘事件监听
  useEffect(() => {
    const handleKeyUp = (e) => {
      if (keys.hasOwnProperty(e.key)) {
        setKeys((prev) => ({ ...prev, [e.key]: false }))
      }
    }

    registerPress('Space', () => {
      if (gameState.gamePhase === 'start') {
        startLevel()
      } else if (gameState.gamePhase === 'levelComplete') {
        nextLevel()
      } else if (gameState.gamePhase === 'gameOver') {
        resetGame()
      }
    })


    // window.addEventListener('keydown', handleKeyDown)
    //window.addEventListener('keyup', handleKeyUp)

    return () => {
      //window.removeEventListener('keydown', handleKeyDown)
      //window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState.gamePhase, startLevel, nextLevel, resetGame, player])

  // 更新动画状态
  const updateAnimations = useCallback(() => {
    setAnimations(prev => {
      // 更新主角旋转
      const newRotation = prev.playerRotation + (keys.ArrowLeft ? 0.1 : keys.ArrowRight ? -0.1 : 0)

      // 更新敌人呼吸效果
      const newScales = prev.enemyScales.map((scale, i) => {
        const direction = prev.enemyScaleDirections[i]
        const newScale = scale + (0.01 * direction)
        return newScale
      })

      const newDirections = prev.enemyScaleDirections.map((dir, i) => {
        const scale = newScales[i]
        return (scale > 1.2) ? -1 : (scale < 0.8) ? 1 : dir
      })

      // 更新消失动画
      const updatedDisappearing = prev.disappearingEnemies
        .map(enemy => ({
          ...enemy,
          scale: enemy.scale * 0.9,
          alpha: enemy.alpha * 0.9
        }))
        .filter(enemy => enemy.alpha > 0.01)

      return {
        playerRotation: newRotation,
        enemyScales: newScales,
        enemyScaleDirections: newDirections,
        disappearingEnemies: updatedDisappearing
      }
    })
  }, [keys.ArrowLeft, keys.ArrowRight])

  // 添加敌人移动逻辑
  const updateEnemies = useCallback(() => {
    setEnemies(prevEnemies => prevEnemies.map(enemy => {
      let newX = enemy.x + enemy.speedX
      let newY = enemy.y + enemy.speedY
      let newSpeedX = enemy.speedX
      let newSpeedY = enemy.speedY

      // 碰到边界时反弹
      if (newX <= enemy.radius || newX >= width - enemy.radius) {
        newSpeedX = -enemy.speedX
        newX = newX <= enemy.radius ? enemy.radius : width - enemy.radius
      }
      if (newY <= enemy.radius || newY >= height - enemy.radius) {
        newSpeedY = -enemy.speedY
        newY = newY <= enemy.radius ? enemy.radius : height - enemy.radius
      }

      return {
        ...enemy,
        x: newX,
        y: newY,
        speedX: newSpeedX,
        speedY: newSpeedY
      }
    }))
  }, [width, height])

  // 游戏主循环
  useTick((delta) => {
    if (gameState.gamePhase !== 'playing') return

    // 更新主角位置
    const speed = 5
    const newPos = { ...player }

    if (keys.ArrowUp) newPos.y -= speed
    if (keys.ArrowDown) newPos.y += speed
    if (keys.ArrowLeft) newPos.x -= speed
    if (keys.ArrowRight) newPos.x += speed

    const xy = move.get(1, delta)
    if (xy) {
      //newPos.x = xy.circle.x
      //newPos.y = xy.circle.y
    } else {
      //move.start(player, 200 * (0.5 - Math.random()), 250 * (0.5 - Math.random()), 3)
    }
    if (playerCircleMove2Tween && playerCircleMove2Tween.isActive()) {
      let target = playerCircleMove2Tween.targets()[0]
      console.log('playerCircleMove2Tween', { ...{ x: target.x, y: target.y } })
      //newPos.y = playerCircleMove2Tween.targets()[0].y
    }

    // 边界检查
    newPos.x = Math.max(player.radius, Math.min(width - player.radius, newPos.x))
    newPos.y = Math.max(player.radius, Math.min(height - player.radius, newPos.y))

    setPlayer(newPos)

    // 更新敌人位置
    updateEnemies()

    // 碰撞检测
    const remainingEnemies = enemies.filter((enemy) => {
      const dx = enemy.x - player.x
      const dy = enemy.y - player.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance > player.radius + enemy.radius
    })

    if (remainingEnemies.length !== enemies.length) {
      const eatenEnemies = enemies.filter(enemy =>
        !remainingEnemies.find(rem => rem.id === enemy.id)
      )

      // 添加消失动画
      setAnimations(prev => ({
        ...prev,
        disappearingEnemies: [
          ...prev.disappearingEnemies,
          ...eatenEnemies.map(enemy => ({
            ...enemy,
            scale: 1,
            alpha: 1
          }))
        ]
      }))

      setGameState(prev => ({
        ...prev,
        score: prev.score + (eatenEnemies.length * 100),
        remainingEnemies: remainingEnemies.length
      }))
      setEnemies(remainingEnemies)
    }

    // 更新动画
    updateAnimations()

    // 游戏结束检查
    if (remainingEnemies.length === 0) {
      setGameState(prev => ({
        ...prev,
        gamePhase: 'levelComplete'
      }))
    }
  })

  // 绘制主角
  const drawPlayer = useCallback((g) => {
    g.clear()
    g.beginFill(0x0000ff)
    g.lineStyle(2, 0x000099)
    // 绘制一个带方向的圆形
    g.drawCircle(0, 0, player.radius)
    g.moveTo(0, 0)
    g.lineTo(player.radius, 0)
    g.endFill()
    // 设置位置和旋转
    //g.position.set(player.x, player.y)
    g.rotation = animations.playerRotation
  }, [player, animations.playerRotation])

  // 绘制敌人
  const drawEnemy = useCallback((g) => {
    g.clear()

    // 绘制正常敌人
    enemies.forEach((enemy, index) => {
      g.beginFill(0xff0000)
      g.lineStyle(2, 0x990000)
      const scale = animations.enemyScales[index] || 1
      g.drawCircle(enemy.x, enemy.y, enemy.radius * scale)
      g.endFill()
    })

    // 绘制消失动画
    animations.disappearingEnemies.forEach(enemy => {
      g.beginFill(0xff0000, enemy.alpha)
      g.lineStyle(2, 0x990000, enemy.alpha)
      g.drawCircle(enemy.x, enemy.y, enemy.radius * enemy.scale)
      g.endFill()
    })
  }, [enemies, animations.enemyScales, animations.disappearingEnemies])

  // 渲染开场画面
  const renderStartScreen = useCallback(() => (
    <Container>
      <Graphics
        draw={(g) => {
          g.clear()
          g.beginFill(0x000000, 0.7)
          g.drawRect(0, 0, width, height)
          g.endFill()
        }}
      />
      <Text
        text={`第 ${gameState.level} 关`}
        x={width / 2}
        y={height / 2 - 60}
        anchor={0.5}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: 48,
          fontWeight: 'bold'
        })}
      />
      <Text
        text={`目标：吃掉 ${gameState.remainingEnemies} 个敌人`}
        x={width / 2}
        y={height / 2}
        anchor={0.5}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: 24
        })}
      />
      <Text
        text="按空格键开始"
        x={width / 2}
        y={height / 2 + 60}
        anchor={0.5}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: 24
        })}
      />
    </Container>
  ), [width, height, gameState.level, gameState.remainingEnemies])

  // 渲染结束画面
  const renderEndScreen = useCallback(() => (
    <Container>
      <Graphics
        draw={(g) => {
          g.clear()
          g.beginFill(0x000000, 0.7)
          g.drawRect(0, 0, width, height)
          g.endFill()
        }}
      />
      <Text
        text={gameState.gamePhase === 'levelComplete' ?
          `第 ${gameState.level} 关通过！` :
          "游戏结束！"}
        x={width / 2}
        y={height / 2 - 60}
        anchor={0.5}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: 48,
          fontWeight: 'bold'
        })}
      />
      <Text
        text={`得分: ${gameState.score}`}
        x={width / 2}
        y={height / 2}
        anchor={0.5}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: 32
        })}
      />
      <Text
        text={gameState.gamePhase === 'levelComplete' ?
          "按空格键进入下一关" :
          "按空格键重新开始"}
        x={width / 2}
        y={height / 2 + 60}
        anchor={0.5}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: 24
        })}
      />
    </Container>
  ), [width, height, gameState.level, gameState.score, gameState.gamePhase])

  if (!loadComplete) {
    return (
      <Container></Container>
    )
  }
  return (
    <Container >
      <AnimatedSprite x={player.x} y={player.y}
        scale={0.5} anchor={0.5}
        animationSpeed={0.1} isPlaying={true} textures={playerTexture} />
      {/* <Graphics draw={drawPlayer} x={player.x} y={player.y} interactive={true} buttonMode={true} pointerup={() => console.log('pointerdownContainer')} /> */}
      {/* <Graphics draw={drawEnemy} /> */}
      {bulletTexture.length > 0 &&
        enemies.map((enemy, index) => (
          <AnimatedSprite key={index} x={enemy.x} y={enemy.y}
            scale={0.5} anchor={0.5}
            animationSpeed={0.1} isPlaying={true} textures={bulletTexture} />
        ))
      }
      {/* 游戏状态显示 */}
      <Text
        text={`关卡: ${gameState.level}`}
        x={10}
        y={10}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: 24
        })}
      />
      <Text
        text={`得分: ${gameState.score}`}
        x={10}
        y={40}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: 24
        })}
      />
      <Text
        text={`剩余敌人: ${gameState.remainingEnemies}`}
        x={10}
        y={70}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: 24
        })}
      />

      {/* 根据游戏阶段显示不同画面 */}
      {gameState.gamePhase === 'start' && renderStartScreen()}
      {(gameState.gamePhase === 'levelComplete' || gameState.gamePhase === 'gameOver') && renderEndScreen()}
    </Container>
  )
}

export default GameScene 