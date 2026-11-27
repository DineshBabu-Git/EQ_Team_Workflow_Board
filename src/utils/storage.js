import { CURRENT_SCHEMA_VERSION, STORAGE_KEY } from "./constants";
import { migrateStoredData } from "./migrations";

export const BACKUP_STORAGE_KEY = `${STORAGE_KEY}-backup`;

export const STORAGE_ERRORS = {
  UNAVAILABLE: "unavailable", // localStorage blocked (private mode, browser setting, ...)
  UNREADABLE: "unreadable", // data exists but is corrupt or in an unknown format
  SAVE_FAILED: "save-failed", // reading worked, but a later save failed (e.g. quota full)
};

// Keeps a copy of the original text so a migration or a failed read can never destroy it.
function backUpRawText(rawText) {
  try {
    localStorage.setItem(BACKUP_STORAGE_KEY, rawText);
  } catch {
    // Storage is already misbehaving, so there is nothing more we can do here.
  }
}

export function loadTasks() {
  let rawText;

  try {
    rawText = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { tasks: [], migrated: false, error: STORAGE_ERRORS.UNAVAILABLE };
  }

  if (rawText === null) {
    return { tasks: [], migrated: false, error: null };
  }

  try {
    const parsedData = JSON.parse(rawText);
    const { tasks, migrated } = migrateStoredData(parsedData);
    if (migrated) {
      backUpRawText(rawText);
    }
    return { tasks, migrated, error: null };
  } catch {
    backUpRawText(rawText);
    return { tasks: [], migrated: false, error: STORAGE_ERRORS.UNREADABLE };
  }
}

// Returns { ok: true } or { ok: false } (for example when the storage quota is full).
export function saveTasks(tasks) {
  try {
    const dataToStore = { schemaVersion: CURRENT_SCHEMA_VERSION, tasks };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// Decides which storage problem (if any) to show after a save attempt.
//   - a successful save clears an old "save failed" message, but never hides
//     "unreadable" or "unavailable", because saving does not fix those
//   - a failed save never replaces "unavailable", which is the more serious message
export function getNextStorageProblem(currentProblem, saveWasOk) {
  if (saveWasOk) {
    return currentProblem === STORAGE_ERRORS.SAVE_FAILED ? null : currentProblem
  }
  return currentProblem === STORAGE_ERRORS.UNAVAILABLE ? currentProblem : STORAGE_ERRORS.SAVE_FAILED
}
