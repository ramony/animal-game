const calcNewPos = (pos, r, theta) => {
  const newPos = { x: pos.x + r * Math.sin(theta * Math.PI / 180), y: pos.y - r * Math.cos(theta * Math.PI / 180) }
  //console.log('newPos', newPos)
  return newPos
}

const inDistance = (pos1, pos2, distance) => {
  const dis = Math.sqrt((pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y))
  //console.log('dis', dis, distance)
  return dis < distance
}

export { calcNewPos, inDistance }