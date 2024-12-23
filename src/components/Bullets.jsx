
import { AnimatedSprite } from '@pixi/react'

export default function Bullets({ bullets, onRef, textures }) {

  return bullets.map((bullet, index) => (
    <AnimatedSprite key={index} ref={el => onRef(bullet.id, el)}
      scale={0.4} anchor={0.5}
      animationSpeed={0.01} isPlaying={true} textures={textures} />
  ))

}