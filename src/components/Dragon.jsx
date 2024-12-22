import { Stage } from '@pixi/react'
import DragonScene from './DragonScene'
import { useEffect, useState } from 'react'

const Dragon = () => {
  // 设置游戏画布大小
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)

  const gameWidth = 480
  const gameHeight = 640

  useEffect(() => {
    const resize = window.addEventListener('resize', () => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    })
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <Stage width={width} height={height} options={{ backgroundColor: 0xFFFFFF }}>
      <DragonScene width={gameWidth} height={gameHeight} top={(height - gameHeight) / 2} left={(width - gameWidth) / 2} />
    </Stage>
  )
}

export default Dragon 