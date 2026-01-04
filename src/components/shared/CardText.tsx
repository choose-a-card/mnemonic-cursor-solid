import { type Component } from 'solid-js'
import './CardText.css'

interface CardTextProps {
  card: string
  class?: string
}

/**
 * Renders a card string with proper suit colors (red for hearts/diamonds)
 * Usage: <CardText card="5♥" /> or <CardText card={question().card} />
 */
const CardText: Component<CardTextProps> = (props) => {
  const isRed = () => props.card?.includes('♥') || props.card?.includes('♦')
  
  return (
    <span class={`card-text ${isRed() ? 'card-text-red' : 'card-text-black'} ${props.class || ''}`}>
      {props.card}
    </span>
  )
}

export default CardText


