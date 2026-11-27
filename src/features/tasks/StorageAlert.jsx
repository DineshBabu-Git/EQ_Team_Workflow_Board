// Props: problem (one of STORAGE_ERRORS, or null), onDismiss.
// Shows a warning banner explaining what went wrong with storage. Renders nothing when
// there is no problem, so the board can always include it.
import { Alert } from '../../components/ui'
import { BACKUP_STORAGE_KEY, STORAGE_ERRORS } from '../../utils/storage'

const problemDetails = {
  [STORAGE_ERRORS.UNAVAILABLE]: {
    variant: 'error',
    title: 'Storage is unavailable',
    message:
      'Your browser is blocking local storage. You can keep working, but your tasks will be lost when you refresh or close this page.',
  },
  [STORAGE_ERRORS.UNREADABLE]: {
    variant: 'warning',
    title: 'Saved tasks could not be read',
    message: `The saved data is damaged or comes from a newer version of the app. A copy is kept in local storage under "${BACKUP_STORAGE_KEY}". Your next change will replace the unreadable data.`,
  },
  [STORAGE_ERRORS.SAVE_FAILED]: {
    variant: 'error',
    title: 'Your last change was not saved',
    message: 'Local storage may be full. The change is still on screen, but it will be lost on refresh.',
  },
}

function StorageAlert({ problem, onDismiss }) {
  const details = problemDetails[problem]

  if (!details) {
    return null
  }

  return (
    <Alert variant={details.variant} title={details.title} onDismiss={onDismiss}>
      {details.message}
    </Alert>
  )
}

export default StorageAlert