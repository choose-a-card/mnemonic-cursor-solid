import { logger } from '../utils/logger'

// Type for cross-browser AudioContext support
interface WindowWithWebkitAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext
}

export function playSound(soundEnabled: boolean, type: string): void {
    if (!soundEnabled) return
    try {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext
      if (!AudioContextClass) return
      
      const audioContext = new AudioContextClass()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      if (type === 'correct') {
        oscillator.frequency.value = 800
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      } else {
        oscillator.frequency.value = 300
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      }
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      logger.warn('Audio playback failed:', error)
    }
  }
