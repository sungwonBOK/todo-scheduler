# Shared Todo Add Design

## Goal

Today, Weekly, and a future Monthly page share one persisted list of todos. A user can add a todo through a reusable modal. The todo is immediately visible in the unscheduled list, but it does not create or change a diary time block until a future synchronization feature runs.

## Scope

- Add a reusable `TodoAddControl` that renders an `할일 추가` button and opens a compact modal.
- Require a title, start date, due date, and estimated duration.
- Store newly created todos in browser `localStorage` and restore them after a reload.
- Make the same todo state available to Today and Weekly through a client-side provider in the `(dashboard)` route layout.
- Rename Weekly's `시간 배정 전` label to `배정 안됨`.
- Keep existing calendar events unchanged. Synchronization and event creation are explicitly out of scope.

## Data Model

Each created todo extends the existing task shape:

```js
{
  id: "task-unique-id",
  title: "프로젝트 보고서 작성",
  startDate: "2026-09-23",
  dueDate: "2026-09-25",
  durationMinutes: 120,
  priority: "medium",
  category: "Inbox",
  completed: false,
  syncStatus: "pending",
}
```

`syncStatus: "pending"` records that the todo has been saved but has not been synchronized into the diary. The existing `events` collection remains the source for time blocks, so a pending todo appears in an unscheduled list only.

## Architecture

```text
app/(dashboard)/layout.js
  └─ TodoProvider(initialTasks: dashboardSeed.tasks)
       ├─ Dashboard → useTodos() → Today Inbox
       ├─ WeeklyDiary → useTodos() → 배정 안됨
       └─ future Monthly → useTodos()

TodoAddControl
  ├─ TodoAddButton
  └─ TodoAddDialog → validateTodoDraft() → addTodo()

TodoProvider ↔ todoStorage.js (localStorage)
```

`TodoProvider` owns in-memory task state and persistence orchestration. `todoStorage.js` owns the storage key and safe parsing. `todoModel.js` owns normalization, validation, and task creation. The modal owns only open/close and draft-form state. This keeps UI, state, domain logic, and storage separate.

## Interaction and Validation

The modal presents title, start date, due date, and estimated duration in minutes. All fields are required. The title is trimmed; both dates must be valid; the due date cannot be earlier than the start date; and duration must be an integer from 30 through 960 in 30-minute increments. Confirm displays field-level errors until the draft is valid. A valid confirm adds one pending todo, writes the full todo list to storage, resets the draft, and closes the dialog. Cancel closes and resets the draft without changing state or storage.

The control is mounted in the Today and Weekly headers. It uses accessible labels, `role="dialog"`, `aria-modal="true"`, and labeled inputs. Keyboard focus remains usable while the dialog is open.

## Persistence Rules

The provider starts from the current seed tasks for the first visit. After hydration it restores a valid saved list from `localStorage` when present. Every add or completion-toggle writes the new list. If storage is absent, malformed, or cannot be read, the provider keeps the seed tasks and continues without throwing.

## Testing

- Unit-test draft validation and task creation, including date ordering and duration boundaries.
- Unit-test safe storage restore and persistence behavior with jsdom `localStorage`.
- Test the reusable control's open, invalid confirm, valid confirm, and cancel paths.
- Test Today and Weekly with the provider: a new task is visible in an unscheduled list and remains absent from calendar event blocks.
- Test the renamed Weekly label and reload persistence behavior.

## Out of Scope

- A sync button, automatic scheduling, or creation of `events`.
- Server persistence, authentication, and multi-device synchronization.
- Editing or deleting existing tasks.
