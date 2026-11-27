# Architecture

## Component hierarchy

```
main.jsx
└─ StrictMode
   └─ BrowserRouter
      └─ App
         └─ ToastProvider                 toast list and a role="status" live region
            └─ TasksProvider              tasks, storage and actions (uses useToast)
               ├─ <header>
               ├─ <main>
               │  └─ TaskBoard            container: filters, dialogs, focus handling
               │     ├─ StorageAlert      storage problems
               │     ├─ TaskFilters       search, priority, sort, Clear filters
               │     │  └─ StatusFilter   status checkboxes
               │     ├─ BoardBody         decides what to show
               │     │  ├─ EmptyState     "No tasks yet" / "No tasks match your filters"
               │     │  └─ TaskColumn (x3)
               │     │     └─ TaskCard (memo)
               │     │        └─ Card parts, Badge, Select, Button
               │     ├─ TaskModal         only mounted while open
               │     │  ├─ Modal
               │     │  │  └─ TaskForm    TextInput, TextArea, Select, Button
               │     │  └─ ConfirmModal   "Discard changes?"
               │     └─ ConfirmModal      "Delete task?"
               └─ <footer> DevTools        development only
```

**Container components** (`TaskBoard`, `TaskModal`, `TasksProvider`) own state and side effects.
**Presentational components** (`BoardBody`, `TaskColumn`, `TaskCard`, `TaskForm` and everything in
`components/ui`) receive props and call callbacks.

## Data flow

```
user action
  → handler in TaskBoard / TaskModal
  → function from useTasks() (addTask, updateTask, moveTask, deleteTask)
  → TasksProvider.applyAction: tasksReducer(current, action) gives the new list
  → setTasks(new list), saveTasks(new list), update the storage problem
  → context changes, the board re-renders
  → filterAndSortTasks(tasks, filters) → groupTasksByStatus → columns
```

Filters take a separate path: the controls call `useTaskFilters` functions, which write the URL.
`parseFilters` reads the URL on the next render, so the URL is the only copy of the filters.

Ids and timestamps are created before an action is dispatched, so the reducer stays pure and gives the
same result when React StrictMode runs it twice in development.

## State management

- **Tasks:** `TasksProvider` holds the list in `useState` and changes it only through the pure
  `tasksReducer` (add, update, move, delete, set). A ref holds the latest list so two changes in a row
  stay correct. The context value and the action functions are memoized, so memoized children keep
  stable props.
- **Filters and sort:** in the URL query string (`useTaskFilters`).
- **Form values:** `useDirtyForm` keeps the values and works out `isDirty` by comparing them with the
  starting values. Validation errors are computed from the values on each render, so they clear as soon
  as a field is fixed.
- **UI state** (open dialogs, the task to delete) is local `useState` in `TaskBoard` and `TaskModal`.

## Storage versioning and migration

Stored shape: `{ schemaVersion: 2, tasks: [...] }` under the key `team-workflow-board`.

| Version | Shape |
| --- | --- |
| 1 (legacy) | a bare array of `{ id, title, done: boolean, createdAt: number }` |
| 2 (current) | `{ schemaVersion: 2, tasks }` with the full task model and ISO date strings |

`loadTasks()` never throws. It returns `{ tasks, migrated, error }`:

1. If reading localStorage throws, `error` is `unavailable` and the app runs in memory.
2. If nothing is stored, the list is empty.
3. Otherwise the text is parsed and passed to `migrateStoredData`:
   - a bare array, or an object with no `schemaVersion` or version 1, goes through `migrateV1toV2`
     (`done` becomes a status, and priority, assignee, tags and description get defaults. The
     timestamp becomes an ISO string and is copied to `updatedAt`). The original text is first copied to
     `team-workflow-board-backup`.
   - version 2 is used as it is.
   - anything else, including a newer version, is treated as unreadable. The text is backed up, the
     app starts empty and an alert is shown.
4. `TasksProvider` saves the migrated data in the new format when it starts, and shows one toast (a
   ref prevents a second toast under StrictMode).
5. Unreadable data is not overwritten on startup. It is replaced only when the user makes their first
   change.

`migrateV1toV2` writes the v2 values as plain strings (`'Done'`, `'Medium'`) on purpose. A migration
describes the shape as it was at that moment, so it must not change if a constant is renamed later.

To add a version 3: write `migrateV2toV3`, add a branch in `migrateStoredData`, raise
`CURRENT_SCHEMA_VERSION` and add tests. Old migrations stay untouched.

## Refactor example: saving in the change handler instead of an effect

**Before.** The provider used `useReducer` and an effect that saved whenever `tasks` changed, then
reported the result:

```jsx
const [tasks, dispatch] = useReducer(tasksReducer, initialLoad.tasks)

useEffect(function saveWhenTasksChange() {
  const result = saveTasks(tasks)
  setStorageProblem(...)   // setState inside an effect
}, [tasks, initialLoad])
```

**Problem.** ESLint's `react-hooks/set-state-in-effect` rule flagged this. The chain was
"tasks change → effect → setState → extra render". The handler already knows what changed, so the effect
only added a second render and indirection.

**After.** Every change goes through one function that computes the next list with the pure reducer,
updates state, saves, and updates the storage problem together:

```jsx
const applyAction = useCallback(function (action) {
  const currentTasks = tasksRef.current
  const nextTasks = tasksReducer(currentTasks, action)
  if (nextTasks === currentTasks) return

  tasksRef.current = nextTasks
  setTasks(nextTasks)

  const result = saveTasks(nextTasks)
  setStorageProblem((currentProblem) => getNextStorageProblem(currentProblem, result.ok))
}, [])
```

The reducer is unchanged and still unit-tested on its own. The decision about which storage problem to
show moved into the pure, tested function `getNextStorageProblem`.

**Trade-off.** The ref and the state could drift apart if something updated one without the other.
That is safe because `applyAction` is the only place that writes either.

## Other notable design details

- **Nested modals and scroll lock:** `Modal` counts open modals and unlocks page scrolling only when the
  last one closes, so the order in which the form and the discard confirm close does not matter.
- **Search box and the URL:** the search box keeps its own text so typing is never delayed or reverted,
  and updates the URL after a short pause with `replace` so history is not flooded. Clear filters
  cancels any pending update through a `clearSignal` prop.
- **Focus after moving a task:** a moved card unmounts in one column and mounts in another, which drops
  keyboard focus. `TaskBoard` remembers the task and refocuses its status select after the render.
- **Invalid URL values:** each filter value is checked against the known lists, so an edited or broken
  link falls back to defaults instead of crashing.
- **Empty states:** `BoardBody` chooses between "no tasks yet", "filters hide everything" and the
  columns from two numbers, the total and visible task counts, so no extra state is needed.