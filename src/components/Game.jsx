import { Stage } from '@pixi/react'
import GameScene from './GameScene'

const Game = () => {
  // 设置游戏画布大小
  const width = 800
  const height = 600

  return (
    <Stage width={width} height={height} options={{ backgroundColor: 0x1099bb }}>
      <GameScene width={width} height={height} />
    </Stage>
  )
}

export default Game 