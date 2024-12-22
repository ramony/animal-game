import { useState, useEffect, useRef } from 'react'

/***
 * code:
 * KeyA - keyZ
 * Digit0 - Digit9
 * ArrowLeft
 * ArrowRight
 * ArrowUp
 * ArrowDown
 */
function useKeys() {

  const [arrowKeys, setArrowKeys] = useState({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  })

  const pressCallback = useRef({})

  const registerPress = (key, callback) => {
    pressCallback.current[key] = callback
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (arrowKeys.hasOwnProperty(e.key)) {
        setArrowKeys((prev) => ({ ...prev, [e.key]: true }))
      } else {
        pressCallback.current[e.code]?.()
      }
    }

    const handleKeyUp = (e) => {
      if (arrowKeys.hasOwnProperty(e.key)) {
        setArrowKeys((prev) => ({ ...prev, [e.key]: false }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])


  return [arrowKeys, registerPress]
}


function useKeys2() {

  const arrowKeys = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  })

  const pressCallback = useRef({})

  const registerPress = (key, callback) => {
    pressCallback.current[key] = callback
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (arrowKeys.current.hasOwnProperty(e.key)) {
        arrowKeys.current[e.key] = true
      } else {
        pressCallback.current[e.code]?.()
      }
    }

    const handleKeyUp = (e) => {
      if (arrowKeys.current.hasOwnProperty(e.key)) {
        arrowKeys.current[e.key] = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])


  return [arrowKeys.current, registerPress]
}
export default useKeys2