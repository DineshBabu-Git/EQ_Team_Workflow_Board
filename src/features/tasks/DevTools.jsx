// No props. A small panel for demonstrating the storage features. App.jsx only renders it
// when import.meta.env.DEV is true, so it is not meant to appear in the production build.
// Each button replaces what is in localStorage and reloads the page, because the app reads
// storage once at startup (that is also the moment the migration runs).
import { Button } from '../../components/ui'
import { STORAGE_KEY } from '../../utils/constants'
import { createV1SampleData, createV2SampleData } from '../../utils/devSeed'
import { BACKUP_STORAGE_KEY } from '../../utils/storage'

function DevTools() {
  function replaceStoredDataAndReload(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // If storage is blocked there is nothing to seed. The reload will show the storage alert.
    }
    window.location.reload()
  }

  function handleSeedOldClick() {
    replaceStoredDataAndReload(createV1SampleData())
  }

  function handleSeedCurrentClick() {
    replaceStoredDataAndReload(createV2SampleData())
  }

  function handleClearClick() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(BACKUP_STORAGE_KEY)
    } catch {
      // Same as above.
    }
    window.location.reload()
  }

  return (
    <details className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
      <summary className="cursor-pointer font-medium text-slate-800">Developer tools (development only)</summary>
      <p className="mt-3">
        Each button replaces the saved tasks and reloads the page. The old-format button shows the migration:
        you should see one toast, and the original data is kept under &quot;{BACKUP_STORAGE_KEY}&quot;.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={handleSeedOldClick}>
          Load old-format (v1) tasks
        </Button>
        <Button variant="secondary" size="sm" onClick={handleSeedCurrentClick}>
          Load sample tasks
        </Button>
        <Button variant="destructive" size="sm" onClick={handleClearClick}>
          Clear all saved data
        </Button>
      </div>
    </details>
  )
}

export default DevTools