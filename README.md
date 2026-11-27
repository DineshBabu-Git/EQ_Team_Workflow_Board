# Team Workflow Board

A small Trello/Jira-style task board built with React, JavaScript (ES6) and Tailwind CSS v4.
Tasks are stored in the browser (localStorage). There is no backend.

## How to run

Requires Node.js and npm.

```bash
npm install
npm run dev            # start the dev server
npm test -- --run      # run all tests once
npm run lint           # run ESLint
npm run build          # production build into dist/
npm run preview        # serve the production build
```

## Features

- **Board:** Backlog, In Progress and Done columns. Each card shows title, priority, assignee,
  tags and relative time ("updated 3 hours ago"). Tasks are moved with a status dropdown.
- **Create and edit:** a modal form with client-side validation and accessible error messages.
  If the form has unsaved changes, Cancel, Esc or a backdrop click asks for confirmation, and the
  browser warns before the tab is closed or reloaded.
- **Delete:** with a confirmation dialog.
- **Filter and sort:** filter by status (multi-select), priority and text search (title and
  description). Sort by created date, updated date or priority. The filters and sort are stored
  in the URL, so they survive a refresh and can be shared.
- **Persistence and migration:** tasks are saved with a `schemaVersion`. Old (v1) data is
  upgraded to the current (v2) format automatically and a toast tells the user.
- **Empty and error states:** no tasks yet, filters hide all tasks, storage unavailable or
  unreadable, failed saves, and validation errors.

### Trying the migration

In development mode a **Developer tools** panel appears at the bottom of the page. Use
**Load old-format (v1) tasks** to write legacy data and reload. You will see an
"upgraded to the new format" toast. The original data is kept in localStorage under
`team-workflow-board-backup`. **Load sample tasks** adds demo tasks, and **Clear all saved data**
empties storage. The panel is rendered only when `import.meta.env.DEV` is true.

## Tech stack

| Tool | Purpose |
| --- | --- |
| Vite + React (JavaScript) | App and dev server |
| Tailwind CSS v4 (`@tailwindcss/vite`) | Styling; brand colors are defined once in `src/index.css` |
| react-router-dom | Only `useSearchParams`, to keep filters in the URL |
| Vitest + React Testing Library | Tests; Vitest shares Vite's config and has a Jest-compatible API |

No UI kit, state library or drag-and-drop library is used.

## Project structure

```
src/
  components/ui/      reusable components: Button, TextInput, TextArea, Select, Badge,
                      Card, Modal, ConfirmModal, Alert, Toast, EmptyState
  features/tasks/     task-specific components: board, columns, cards, form, filters
  context/            TasksProvider and the tasks reducer
  hooks/              useTasks, useTaskFilters, useDirtyForm
  utils/              pure logic: storage, migrations, validation, filtering, URL params, time
  tests/              unit and integration tests
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the component tree, data flow, migration approach
and a refactor example.

## Key decisions

- **Context + `useReducer`-style reducer instead of Redux/Zustand.** The state is one list of
  tasks with a few actions, so a library would add a dependency without solving a problem.
- **Logic in pure functions.** Filtering, sorting, validation, migration and URL parsing take plain
  data and return plain data, so they are easy to test without rendering anything.
- **Filters live in the URL only.** There is no separate filter state, so refresh, sharing and the
  Back button work without extra code. `status` uses repeated params
  (`?status=Backlog&status=Done`) because commas are percent-encoded and "In Progress" has a space.
  The search box updates the URL 300 ms after the last keystroke.
- **Status dropdown instead of drag and drop.** Simpler, works with the keyboard, no extra dependency.
- **localStorage instead of IndexedDB.** The data is small and synchronous access keeps the code simple.
- **Hand-built Modal.** It implements `role="dialog"`, `aria-modal`, a Tab focus trap, Esc to close and
  focus restore itself, since the assignment focuses on ARIA and keyboard behavior.
- **Composition over props.** `Card` is built from `CardHeader`, `CardBody` and `CardFooter`;
  `Modal` takes `children`.

## Accessibility

- Every input has a label connected with `htmlFor`.
- Errors use `aria-invalid` and `aria-describedby`, and the first invalid field is focused after a
  failed submit.
- The Modal is a labelled dialog that traps Tab, closes on Esc and returns focus to the opener.
- Columns are labelled regions. The status select has a screen-reader label.
- Toasts use a `role="status"` region, alerts use `role="alert"`, and the "Showing X of Y tasks"
  line is a polite live region.
- Interactive elements have visible focus rings.

## Testing

Vitest and React Testing Library (jsdom).

- **Unit tests:** migrations, storage, validators, relative time, filtering and sorting, URL
  parameter conversion, grouping, the reducer, the task factory, sample data and hooks.
- **Integration tests** (the real board inside the real providers and a memory router):
  - `createTaskWorkflow.test.jsx`: validation, creating a task and seeing it in the right column,
    saved storage format, and the unsaved-changes prompt.
  - `boardFiltersAndMoves.test.jsx`: moving a task, URL-synced filters, sorting, search, the
    "no matches" state and Clear filters.
  - `taskCardMemo.test.jsx`: guards the `React.memo` optimization.

## Performance

`TaskCard` is wrapped in `React.memo`. Opening the New/Edit dialog or the delete confirm changes the
board's state but not the tasks or filters, so without memoization every card would re-render. The
memo works because the props are stable: task objects keep their identity until they change (the
reducer returns untouched tasks as they are), and the `onMove`, `onEdit` and `onDelete` callbacks
come from `useCallback`. A test counts card renders to catch regressions. With only a few tasks the
difference is not visible, and relative times ("updated 3 minutes ago") now stay unchanged slightly
longer because cards re-render less often.

## Known limitations

- Stored v2 tasks are trusted without field-by-field validation. A task with an unknown status is
  shown in the Backlog column.
- Only one backup of unreadable or migrated data is kept.
- Multiple tabs overwrite each other (last write wins). The `storage` event is not handled.
- Every change rewrites the whole task list. Fine for a small board; a larger app would debounce
  saves or use IndexedDB.
- Relative times only refresh when the card re-renders.
- The browser Back button is not intercepted while the form has unsaved changes. Tab close,
  reload, Cancel, Esc and backdrop clicks are covered.
- Focus is not restored in a few cases, for example after deleting a task.
- A saved task that does not match the active filters disappears from view. The toast says so.
- Sorting by updated date moves a card to the top of its column after it is edited or moved.
- Screen readers are not told when a task has moved to another column.
- Toasts disappear after 4 seconds and do not pause on hover.
- Search is a plain substring match on title and description. Tags are not searched.
- The hand-built Modal and focus trap are less battle-tested than the native `<dialog>` element.
- Tests do not cover the edit flow, delete confirmation, storage failures in the UI or the Back button.

## AI assistance

I used an AI assistant (Claude) to update/improve this project in stages: project setup, the component library, utilities and their tests, the reducer and provider, the board, form, filters, empty/error states, integration tests and this documentation. After each stage I ran the linter and the tests. Problems found that way were fixed with the assistant's help:

- ESLint's `react-hooks/set-state-in-effect` rule rejected saving to storage inside an effect, so
  saving moved into the change handler (see the refactor in ARCHITECTURE.md).
- ESLint's `react-refresh/only-export-components` rule rejected a test helper file that mixed a
  component with plain functions, so the component was moved to its own file.
- A test suite failed to import a file that had not been created, which was fixed by creating it.