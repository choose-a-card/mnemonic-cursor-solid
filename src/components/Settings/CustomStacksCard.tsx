import { For, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import Card from '../shared/Card'
import Button from '../shared/Button'
import { useCustomStacks } from '../../contexts/CustomStacksContext'
import { useAppSettings } from '../../contexts/AppSettingsContext'
import { isCustomStackType, getCustomStackId } from '../../constants/stacks'
import './CustomStacksCard.css'

export default function CustomStacksCard() {
  const navigate = useNavigate()
  const { customStacks, deleteStack } = useCustomStacks()
  const { stackType, setStackType } = useAppSettings()

  const handleCreateNew = () => {
    navigate('/stack-builder')
  }

  const handleEdit = (stackId: string) => {
    navigate(`/stack-builder/${stackId}`)
  }

  const handleDelete = (stackId: string) => {
    // If the deleted stack is currently selected, switch to tamariz
    if (isCustomStackType(stackType()) && getCustomStackId(stackType()) === stackId) {
      setStackType('tamariz')
    }
    deleteStack(stackId)
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card icon="🃏" title="Custom Stacks" class="custom-stacks-card">
      <div class="custom-stacks-content">
        <Show 
          when={customStacks().length > 0}
          fallback={
            <div class="empty-state">
              <p class="empty-text">No custom stacks yet</p>
              <p class="empty-hint">Create your own memorized deck order</p>
            </div>
          }
        >
          <div class="stacks-list">
            <For each={customStacks()}>
              {(stack) => (
                <div class="stack-item">
                  <div class="stack-info">
                    <span class="stack-name">{stack.name}</span>
                    <span class="stack-date">Created {formatDate(stack.createdAt)}</span>
                  </div>
                  <div class="stack-actions">
                    <button
                      class="action-btn edit-btn"
                      onClick={() => handleEdit(stack.id)}
                      aria-label={`Edit ${stack.name}`}
                      tabindex="0"
                    >
                      Edit
                    </button>
                    <button
                      class="action-btn delete-btn"
                      onClick={() => handleDelete(stack.id)}
                      aria-label={`Delete ${stack.name}`}
                      tabindex="0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Button
          variant="primary"
          size="medium"
          onClick={handleCreateNew}
          class="create-stack-btn"
        >
          + Create New Stack
        </Button>
      </div>
    </Card>
  )
}

