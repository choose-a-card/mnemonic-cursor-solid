import Card from '../shared/Card'
import { calculateAccuracy } from '../../utils/statsCalculations'
import type { Stats } from '../../types'
import './OverallAccuracyCard.css'

interface OverallAccuracyCardProps {
  stats: Stats;
}

export default function OverallAccuracyCard(props: OverallAccuracyCardProps) {
  const accuracy = () => calculateAccuracy(props.stats.correct, props.stats.total)

  return (
    <Card class="overall-accuracy-card">
      <div class="card-header">
        <h3 class="card-title">Overall Accuracy</h3>
      </div>
      <div class="card-content">
        <div class="accuracy-display">
          <div class="accuracy-value">{accuracy()}%</div>
          <div class="accuracy-details">
            <div class="detail-item">
              <span class="detail-value">{props.stats.correct}</span>
              <span class="detail-label">Correct</span>
            </div>
            <div class="detail-item">
              <span class="detail-value">{props.stats.total}</span>
              <span class="detail-label">Total</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

