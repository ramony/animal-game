import { useEffect } from 'react'
import { Game } from 'phaser'
import { gameConfig } from './game/config'
import './App.css'

function App() {
  useEffect(() => {
    const game = new Game(gameConfig)

    return () => {
      game.destroy(true)
    }
  }, [])

  return (
    <div className="App">
      <div id="game-content"></div>
    </div>
  )
}

export default App
