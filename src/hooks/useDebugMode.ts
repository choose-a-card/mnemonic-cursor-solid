import { createSignal, onMount } from 'solid-js'
import { logger } from '../utils/logger'

export const useDebugMode = () => {
  const [debugMode, setDebugMode] = createSignal<boolean>(false)

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const debugFlag = urlParams.get('debug')
    if (debugFlag === 'true') {
      setDebugMode(true)
      logger.log('Debug mode enabled via URL parameter')
    }
  })

  return { debugMode, setDebugMode }
}
