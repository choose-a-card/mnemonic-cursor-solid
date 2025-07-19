import { createSignal } from 'solid-js'
import './DualRangeSlider.css'

interface DualRangeSliderProps {
  min: number
  max: number
  start: number
  end: number
  onRangeChange: (start: number, end: number) => void
  step?: number
}

export default function DualRangeSlider(props: DualRangeSliderProps) {
  const [isDragging, setIsDragging] = createSignal<'start' | 'end' | null>(null)
  let sliderRef: HTMLDivElement | undefined

  const step = props.step || 1

  const getPercentage = (value: number) => {
    return ((value - props.min) / (props.max - props.min)) * 100
  }

  const getValueFromPercentage = (percentage: number) => {
    const value = (percentage / 100) * (props.max - props.min) + props.min
    return Math.round(value / step) * step
  }

  const handleMove = (clientX: number) => {
    if (!isDragging() || !sliderRef) return

    const rect = sliderRef.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const value = getValueFromPercentage(percentage)

    if (isDragging() === 'start') {
      const newStart = Math.min(value, props.end - step)
      if (newStart >= props.min) {
        props.onRangeChange(newStart, props.end)
      }
    } else if (isDragging() === 'end') {
      const newEnd = Math.max(value, props.start + step)
      if (newEnd <= props.max) {
        props.onRangeChange(props.start, newEnd)
      }
    }
  }

  const handleEnd = () => {
    setIsDragging(null)
  }

  // Mouse event handlers
  const handleMouseDown = (e: MouseEvent, handle: 'start' | 'end') => {
    e.preventDefault()
    setIsDragging(handle)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return
    e.preventDefault()
    handleMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent, handle: 'start' | 'end') => {
    e.preventDefault()
    if (e.touches.length > 0) {
      setIsDragging(handle)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging() || e.touches.length === 0) return
    e.preventDefault()
    handleMove(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    handleEnd()
  }

  const startPercentage = () => getPercentage(props.start)
  const endPercentage = () => getPercentage(props.end)

  return (
    <div 
      class="dual-range-slider" 
      ref={sliderRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div class="slider-track">
        <div 
          class="slider-fill" 
          style={{
            left: `${startPercentage()}%`,
            width: `${endPercentage() - startPercentage()}%`
          }}
        />
      </div>
      
      <div 
        class="slider-handle start-handle"
        style={{ left: `${startPercentage()}%` }}
        onMouseDown={(e) => handleMouseDown(e, 'start')}
        onTouchStart={(e) => handleTouchStart(e, 'start')}
      >
        <div class="handle-value">{props.start}</div>
      </div>
      
      <div 
        class="slider-handle end-handle"
        style={{ left: `${endPercentage()}%` }}
        onMouseDown={(e) => handleMouseDown(e, 'end')}
        onTouchStart={(e) => handleTouchStart(e, 'end')}
      >
        <div class="handle-value">{props.end}</div>
      </div>
    </div>
  )
} 