import { useParams } from '@solidjs/router'
import PracticeView from '../components/Practice/PracticeView'

export default function PracticePage() {
  const params = useParams()
  return <PracticeView modeId={params.modeId} />
}

