import { useState, useEffect, useRef, memo } from 'react';
import { Container, Graphics, Text, AnimatedSprite, Sprite, useTick, useLoader } from '@pixi/react';
import gsapNew from '../hooks/gsapNew';
import * as PIXI from 'pixi.js'
import useKeys from '../hooks/useKeys';

const DragonScene = ({ width, height, top, left }) => {

  const [player, setPlayer] = useState({ x: width / 2, y: height / 2, radius: 20 });
  const playerSpeed = 5
  const playerRadius = 32
  const [playerFrames, setPlayerFrames] = useState([]);
  const [keys, registerPress] = useKeys()
  const [fps, setFps] = useState(0);

  useEffect(() => {

    PIXI.Assets.load("/dragon.json").then((resources) => {
      const dragonFrames = resources.animations.flyingdragon;
      setPlayerFrames(dragonFrames.slice(0, 1));
    });

    registerPress('Space', () => {
      setPlayer(prev => {
        const curr = { ...prev }
        curr.y = Math.max(curr.y - playerSpeed * 20, playerRadius)
        return curr
      });
    })

  }, []);

  // 使用 useTick 实现实时更新
  useTick(() => {
    //setFps(PIXI.Ticker.shared.FPS.toFixed(0)); // 保留两位小数

    setPlayer(prev => {
      const curr = { ...prev }
      if (keys.ArrowLeft) {
        curr.x = Math.max(curr.x - playerSpeed, playerRadius)
      } else if (keys.ArrowRight) {
        curr.x = Math.min(curr.x + playerSpeed, width - playerRadius)
      } else if (keys.ArrowUp) {
        curr.y = Math.max(curr.y - playerSpeed, playerRadius)
      } else if (keys.ArrowDown) {
        curr.y = Math.min(curr.y + playerSpeed, height - playerRadius)
      } else {
        // curr.x = Math.max(curr.x + (Math.random() - 0.5) * playerSpeed, playerRadius)
        // curr.x = Math.min(curr.x, width - playerRadius)

        // curr.y = Math.max(curr.y + (Math.random() - 0.5) * playerSpeed, playerRadius)
        // curr.y = Math.min(curr.y, height - playerRadius)

      }
      return curr
    });
  });

  if (playerFrames.length === 0) {
    return null;
  }

  return (
    <Container width={width} height={height} x={left} y={top}>
      <Graphics x={0} y={0}>
        <Graphics draw={
          g => {
            g.beginFill(0xC0C0AF)
            g.drawRect(0, 0, width, height)
            g.endFill()
          }
        }
        />
      </Graphics>

      <Text
        text={`FPS: ${fps}`}
        x={0}
        y={0}
        style={new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: 18
        })}
      />

      {playerFrames.length > 0 && <Container x={player.x}
        y={player.y}>
        <AnimatedSprite
          scale={0.5}
          anchor={0.5}
          animationSpeed={0.05}
          isPlaying={true}
          textures={playerFrames}
        />
      </Container>}
    </Container>
  );
};

export default DragonScene;