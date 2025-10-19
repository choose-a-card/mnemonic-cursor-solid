import Card from '../shared/Card'
import FormGroup from '../shared/FormGroup'
import Toggle from '../shared/Toggle'

interface PreferencesCardProps {
  darkMode: boolean;
  soundEnabled: boolean;
  onDarkModeChange: (enabled: boolean) => void;
  onSoundEnabledChange: (enabled: boolean) => void;
}

export default function PreferencesCard(props: PreferencesCardProps) {
  return (
    <Card icon="⚙️" title="Preferences">
      <FormGroup 
        label="Dark Mode" 
        description="Switch between light and dark themes"
        horizontal
      >
        <Toggle
          checked={props.darkMode}
          onChange={props.onDarkModeChange}
          ariaLabel={`${props.darkMode ? 'Disable' : 'Enable'} dark mode`}
        />
      </FormGroup>

      <FormGroup 
        label="Sound Effects" 
        description="Audio feedback for answers"
        horizontal
      >
        <Toggle
          checked={props.soundEnabled}
          onChange={props.onSoundEnabledChange}
          ariaLabel={`${props.soundEnabled ? 'Disable' : 'Enable'} sound effects`}
        />
      </FormGroup>
    </Card>
  )
}

