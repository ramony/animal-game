
import { AnimatedSprite } from '@pixi/react'

export default function Enemies({ enemies, onRef, textures }) {
  if (!enemies) {
    return null;
  }
  return enemies.map((enemy, index) => (
    <AnimatedSprite key={index} ref={el => onRef?.(enemy.id, el)}
      scale={0.4} anchor={0.5}
      animationSpeed={0.01} isPlaying={true} textures={textures} />
  ))

}