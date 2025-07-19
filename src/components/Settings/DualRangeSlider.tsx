import { createSignal, onMount, onCleanup, createEffect } from 'solid-js'
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
  const [sliderRect, setSliderRect] = createSignal<DOMRect | null>(null)
  let sliderRef: HTMLDivElement | undefined

  const step = props.step || 1

  const getPercentage = (value: number) => {
    return ((value - props.min) / (props.max - props.min)) * 100
  }

  const getValueFromPercentage = (percentage: number) => {
    const value = (percentage / 100) * (props.max - props.min) + props.min
    return Math.round(value / step) * step
  }

  const handleMouseDown = (e: MouseEvent, handle: 'start' | 'end') => {
    e.preventDefault()
    setIsDragging(handle)
    if (sliderRef) {
      setSliderRect(sliderRef.getBoundingClientRect())
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging() || !sliderRect()) return

    const rect = sliderRect()!
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
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

  const handleMouseUp = () => {
    setIsDragging(null)
    setSliderRect(null)
  }

  onMount(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  })

  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })

  const startPercentage = () => getPercentage(props.start)
  const endPercentage = () => getPercentage(props.end)

  return (
    <div class="dual-range-slider" ref={sliderRef}>
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
      >
        <div class="handle-value">{props.start}</div>
      </div>
      
      <div 
        class="slider-handle end-handle"
        style={{ left: `${endPercentage()}%` }}
        onMouseDown={(e) => handleMouseDown(e, 'end')}
      >
        <div class="handle-value">{props.end}</div>
      </div>
    </div>
  )
} 