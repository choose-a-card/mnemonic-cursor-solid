import { createSignal, onMount } from 'solid-js'

export const useDebugMode = () => {
  const [debugMode, setDebugMode] = createSignal<boolean>(false)

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const debugFlag = urlParams.get('debug')
    if (debugFlag === 'true') {
      setDebugMode(true)
      console.log('Debug mode enabled via URL parameter')
    }
  })

  return { debugMode, setDebugMode }
}

