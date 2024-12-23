import { Stage } from '@pixi/react'
import DragonScene from './DragonScene'
import { useEffect, useState } from 'react'

const Dragon = () => {
  // 设置游戏画布大小
  const width = 450
  const height = 600

  return (
    <Stage width={width} height={height} options={{ backgroundColor: 0x1099bb }}>
      <DragonScene width={width} height={height} top={0} left={0} />
    </Stage>
  )
}

export default Dragon 