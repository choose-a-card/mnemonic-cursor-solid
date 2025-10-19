import Card from '../shared/Card'
import Button from '../shared/Button'
import FormGroup from '../shared/FormGroup'

interface DataManagementCardProps {
  onResetStats: () => void;
}

export default function DataManagementCard(props: DataManagementCardProps) {
  return (
    <Card icon="📊" title="Data Management">
      <FormGroup 
        label="Reset Statistics" 
        description="Permanently delete all progress data"
      >
        <Button 
          variant="danger" 
          onClick={props.onResetStats}
        >
          🗑️ Reset All Data
        </Button>
      </FormGroup>
    </Card>
  )
}

