# Shared Todo Add Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared, locally persisted todo-creation flow for Today and Weekly that keeps new todos out of diary time blocks until a later sync feature exists.

**Architecture:** A client `TodoProvider` mounted in the `(dashboard)` layout owns the task list and persistence. Focused feature modules validate and persist data, while a reusable `TodoAddControl` composes a header button and dialog. Today and Weekly consume provider state; neither creates an event when a todo is added.

**Tech Stack:** Next.js 16 App Router, React Context, browser `localStorage`, Tailwind CSS, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-23-shared-todo-add-design.md`

## Global Constraints

- Do not add dependencies; use the existing React, Lucide, Vitest, and Testing Library packages.
- Use JavaScript, `const` for values that are not reassigned, and no `var`.
- Store reusable state and domain behavior under `features/todos/`; reusable UI belongs in `components/todos/`.
- Persist browser-local todos under `todo-scheduler.todos.v1`.
- Require a nonblank title, valid start/due dates, a due date on or after the start date, and an integer duration from 30 to 960 in 30-minute increments.
- New todos must set `syncStatus: "pending"` and must not create or modify `events`.
- Replace only Weekly's visible `시간 배정 전` heading with `배정 안됨`.

## Review Focus

- Malformed saved JSON preserves seed tasks instead of crashing.
- A cancelled dialog loses its draft and old validation errors.
- Durations `31`, `0`, `961`, and blank are rejected.
- A single provider updates Today and Weekly in the same render tree.
- Adding a task creates no calendar `article` and leaves existing event count unchanged.

---

### Task 1: Todo validation and local storage

**Files:**
- Create: `features/todos/todoModel.js`
- Create: `features/todos/todoStorage.js`
- Test: `tests/features/todos/todoModel.test.js`
- Test: `tests/features/todos/todoStorage.test.js`

**Interfaces:**
- Produces `validateTodoDraft(draft) -> { isValid, fieldErrors }`.
- Produces `createTodo(draft, createId?) -> Todo`.
- Produces `TODO_STORAGE_KEY`, `readStoredTodos(storage)`, and `writeStoredTodos(tasks, storage)`.

- [x] **Step 1: Write failing validation and creation tests**

```js
const invalid = { title: "", startDate: "", dueDate: "", durationMinutes: "" };
expect(validateTodoDraft(invalid)).toEqual({
  isValid: false,
  fieldErrors: expect.objectContaining({
    title: expect.any(String),
    startDate: expect.any(String),
    dueDate: expect.any(String),
    durationMinutes: expect.any(String),
  }),
});
expect(validateTodoDraft({ title: "정리", startDate: "2026-09-24", dueDate: "2026-09-23", durationMinutes: "60" }).isValid).toBe(false);
expect(validateTodoDraft({ title: "정리", startDate: "2026-09-23", dueDate: "2026-09-23", durationMinutes: "31" }).isValid).toBe(false);
expect(createTodo(validDraft, () => "task-new")).toMatchObject({
  id: "task-new",
  title: "정리",
  durationMinutes: 60,
  syncStatus: "pending",
  completed: false,
});
```

- [x] **Step 2: Run the focused test to verify it fails**

Run: `node_modules/.bin/vitest.cmd run tests/features/todos/todoModel.test.js`

Expected: FAIL because `todoModel.js` does not exist.

- [x] **Step 3: Implement normalized validation and creation**

```js
export function validateTodoDraft(draft) {
  const title = draft.title.trim();
  const durationMinutes = Number(draft.durationMinutes);
  const fieldErrors = {};
  if (!title) fieldErrors.title = "할 일을 입력해주세요.";
  if (!isIsoDate(draft.startDate)) fieldErrors.startDate = "시작 날짜를 선택해주세요.";
  if (!isIsoDate(draft.dueDate)) fieldErrors.dueDate = "마감 날짜를 선택해주세요.";
  if (isIsoDate(draft.startDate) && isIsoDate(draft.dueDate) && draft.dueDate < draft.startDate) fieldErrors.dueDate = "마감 날짜는 시작 날짜보다 빠를 수 없어요.";
  if (!Number.isInteger(durationMinutes) || durationMinutes < 30 || durationMinutes > 960 || durationMinutes % 30 !== 0) fieldErrors.durationMinutes = "예상 소요 시간은 30~960분 사이의 30분 단위로 입력해주세요.";
  return { isValid: Object.keys(fieldErrors).length === 0, fieldErrors };
}
```

Use `globalThis.crypto?.randomUUID?.()` with a fallback only when no `createId` function is supplied. `createTodo` trims the title, converts duration to a number, and sets the default task fields from the approved design.

- [x] **Step 4: Write failing storage tests**

```js
storage.setItem(TODO_STORAGE_KEY, JSON.stringify([{ id: "task-saved", title: "저장된 일", durationMinutes: 60 }]));
expect(readStoredTodos(storage)).toEqual([{ id: "task-saved", title: "저장된 일", durationMinutes: 60 }]);
storage.setItem(TODO_STORAGE_KEY, "not-json");
expect(readStoredTodos(storage)).toBeNull();
expect(writeStoredTodos([{ id: "task-new" }], storage)).toBe(true);
```

- [x] **Step 5: Implement safe storage access**

```js
export const TODO_STORAGE_KEY = "todo-scheduler.todos.v1";

export function readStoredTodos(storage) {
  try {
    const value = storage?.getItem(TODO_STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStoredTodos(tasks, storage) {
  try {
    storage?.setItem(TODO_STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}
```

- [x] **Step 6: Run focused feature tests**

Run: `node_modules/.bin/vitest.cmd run tests/features/todos/todoModel.test.js tests/features/todos/todoStorage.test.js`

Expected: PASS.

- [ ] **Step 7: Commit the completed task (not available: project folder is not a Git root)**

```bash
git add features/todos/todoModel.js features/todos/todoStorage.js tests/features/todos/todoModel.test.js tests/features/todos/todoStorage.test.js
git commit -m "feat: add todo validation and storage"
```

### Task 2: Shared todo provider

**Files:**
- Create: `features/todos/TodoProvider.jsx`
- Test: `tests/features/todos/TodoProvider.test.jsx`

**Interfaces:**
- Consumes Task 1's model and storage functions.
- Produces `<TodoProvider initialTasks>{children}</TodoProvider>` and `useTodos() -> { tasks, addTodo, toggleTodoComplete }`.

- [x] **Step 1: Write failing hydration and persistence tests**

```jsx
function TodoProbe() {
  const { addTodo, tasks } = useTodos();
  return <>
    <button type="button" onClick={() => addTodo(validDraft)}>새 할 일 저장</button>
    {tasks.map((task) => <span key={task.id}>{task.title}</span>)}
  </>;
}

render(<TodoProvider initialTasks={seedTasks}><TodoProbe /></TodoProvider>);
await user.click(screen.getByRole("button", { name: "새 할 일 저장" }));
expect(screen.getByText("추가한 일")).toBeInTheDocument();
expect(JSON.parse(window.localStorage.getItem(TODO_STORAGE_KEY))).toEqual(
  expect.arrayContaining([expect.objectContaining({ title: "추가한 일", syncStatus: "pending" })]),
);

window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(savedTasks));
render(<TodoProvider initialTasks={seedTasks}><TodoProbe /></TodoProvider>);
expect(await screen.findByText("저장된 일")).toBeInTheDocument();
```

- [x] **Step 2: Run the provider test to verify it fails**

Run: `node_modules/.bin/vitest.cmd run tests/features/todos/TodoProvider.test.jsx`

Expected: FAIL because `TodoProvider.jsx` does not exist.

- [x] **Step 3: Implement hydration, mutation, and persistence**

```jsx
const TodoContext = createContext(null);

export function TodoProvider({ initialTasks = [], children }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedTasks = readStoredTodos(window.localStorage);
    if (storedTasks) setTasks(storedTasks);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) writeStoredTodos(tasks, window.localStorage);
  }, [isHydrated, tasks]);

  const addTodo = (draft) => {
    const result = validateTodoDraft(draft);
    if (!result.isValid) return result;
    setTasks((currentTasks) => [...currentTasks, createTodo(draft)]);
    return result;
  };

  const toggleTodoComplete = (taskId) => {
    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )));
  };

  return <TodoContext.Provider value={{ tasks, addTodo, toggleTodoComplete }}>{children}</TodoContext.Provider>;
}
```

Define `useTodos` with `useContext(TodoContext)`; if the context value is absent, throw `"useTodos must be used within a TodoProvider"`.

- [x] **Step 4: Run the provider test to verify it passes**

Run: `node_modules/.bin/vitest.cmd run tests/features/todos/TodoProvider.test.jsx`

Expected: PASS.

- [ ] **Step 5: Commit the completed task (not available: project folder is not a Git root)**

```bash
git add features/todos/TodoProvider.jsx tests/features/todos/TodoProvider.test.jsx
git commit -m "feat: share persisted todo state"
```

### Task 3: Reusable add-todo dialog

**Files:**
- Create: `components/todos/TodoAddControl.jsx`
- Create: `components/todos/TodoAddDialog.jsx`
- Test: `tests/components/todos/TodoAddControl.test.jsx`

**Interfaces:**
- Consumes `useTodos().addTodo` and the existing `Button` component.
- Produces `<TodoAddControl />`, with a button named `할일 추가` and a dialog only while open.

- [x] **Step 1: Write failing modal-flow tests**

```jsx
render(<TodoProvider initialTasks={[]}><TodoAddControl /><TodoProbe /></TodoProvider>);
await user.click(screen.getByRole("button", { name: "할일 추가" }));
expect(screen.getByRole("dialog", { name: "할일 추가" })).toBeInTheDocument();
await user.click(screen.getByRole("button", { name: "확인" }));
expect(screen.getByRole("alert")).toHaveTextContent("할 일을 입력해주세요.");

await user.type(screen.getByLabelText("할 일"), "회의록 공유");
await user.type(screen.getByLabelText("시작 날짜"), "2026-09-23");
await user.type(screen.getByLabelText("마감 날짜"), "2026-09-24");
await user.type(screen.getByLabelText("예상 소요 시간(분)"), "60");
await user.click(screen.getByRole("button", { name: "확인" }));
expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
expect(screen.getByText("회의록 공유")).toBeInTheDocument();

await user.click(screen.getByRole("button", { name: "할일 추가" }));
await user.type(screen.getByLabelText("할 일"), "취소할 일");
await user.click(screen.getByRole("button", { name: "취소" }));
await user.click(screen.getByRole("button", { name: "할일 추가" }));
expect(screen.getByLabelText("할 일")).toHaveValue("");
```

- [x] **Step 2: Run the control test to verify it fails**

Run: `node_modules/.bin/vitest.cmd run tests/components/todos/TodoAddControl.test.jsx`

Expected: FAIL because the control and dialog do not exist.

- [x] **Step 3: Implement the control and focused dialog**

```jsx
export default function TodoAddControl() {
  const [isOpen, setIsOpen] = useState(false);
  const { addTodo } = useTodos();

  return <>
    <Button type="button" onClick={() => setIsOpen(true)}>할일 추가</Button>
    <TodoAddDialog open={isOpen} onClose={() => setIsOpen(false)} onSubmit={addTodo} />
  </>;
}
```

Keep draft values and field errors in `TodoAddDialog`. Use a form, visible labels, `role="dialog"`, `aria-modal="true"`, a labelled dialog title, and existing button variants. Reset draft and errors only on cancel or valid confirm; leave the dialog open after invalid confirmation.

- [x] **Step 4: Run the control test to verify it passes**

Run: `node_modules/.bin/vitest.cmd run tests/components/todos/TodoAddControl.test.jsx`

Expected: PASS.

- [ ] **Step 5: Commit the completed task (not available: project folder is not a Git root)**

```bash
git add components/todos/TodoAddControl.jsx components/todos/TodoAddDialog.jsx tests/components/todos/TodoAddControl.test.jsx
git commit -m "feat: add reusable todo dialog"
```

### Task 4: Mount shared state and migrate Today and Weekly

**Files:**
- Create: `app/(dashboard)/layout.js`
- Modify: `components/dashboard/Dashboard.js`
- Modify: `components/dashboard/DashboardHeader.jsx`
- Modify: `components/dashboard/InboxPanel.jsx`
- Modify: `components/weekly/WeeklyDiary.jsx`
- Modify: `tests/components/dashboard/Dashboard.test.jsx`
- Modify: `tests/components/weekly/WeeklyDiary.test.jsx`

**Interfaces:**
- Consumes `TodoProvider`, `useTodos`, and `TodoAddControl`.
- Produces one shared route-layout state boundary and two consumer screens that render pending tasks without changing events.

- [x] **Step 1: Write failing shared-consumer tests**

```jsx
render(
  <TodoProvider initialTasks={initialData.tasks}>
    <Dashboard initialData={initialData} />
    <WeeklyDiary initialData={initialData} />
  </TodoProvider>,
);
await user.click(screen.getAllByRole("button", { name: "할일 추가" })[0]);
await user.type(screen.getByLabelText("할 일"), "동기화 전 할 일");
await user.type(screen.getByLabelText("시작 날짜"), "2026-09-23");
await user.type(screen.getByLabelText("마감 날짜"), "2026-09-24");
await user.type(screen.getByLabelText("예상 소요 시간(분)"), "60");
await user.click(screen.getByRole("button", { name: "확인" }));
expect(screen.getByRole("list", { name: "Inbox" })).toHaveTextContent("동기화 전 할 일");
expect(screen.getByText("동기화 전 할 일 · 60분")).toBeInTheDocument();
expect(screen.queryByRole("article", { name: /동기화 전 할 일/ })).not.toBeInTheDocument();
expect(screen.getByText("배정 안됨")).toBeInTheDocument();
```

Replace obsolete quick-add tests. Preserve the existing completion and orphan-event coverage, wrapping consumers with `TodoProvider`.

- [x] **Step 2: Run consumer tests to verify they fail**

Run: `node_modules/.bin/vitest.cmd run tests/components/dashboard/Dashboard.test.jsx tests/components/weekly/WeeklyDiary.test.jsx`

Expected: FAIL because current screens own independent task state and have no shared dialog.

- [x] **Step 3: Implement route state boundary and consumer migration**

```jsx
// app/(dashboard)/layout.js
import { dashboardSeed } from "../../data/dashboardSeed";
import { TodoProvider } from "../../features/todos/TodoProvider";

export default function DashboardLayout({ children }) {
  return <TodoProvider initialTasks={dashboardSeed.tasks}>{children}</TodoProvider>;
}
```

Replace Dashboard and Weekly task-local state with `useTodos()`, but keep `events` from `initialData`. Mount `TodoAddControl` in the Today and Weekly headers. Remove the legacy quick-add form and props from `InboxPanel`; retain the Inbox display. Change Weekly's heading exactly from `시간 배정 전` to `배정 안됨`.

- [x] **Step 4: Run consumer tests to verify they pass**

Run: `node_modules/.bin/vitest.cmd run tests/components/dashboard/Dashboard.test.jsx tests/components/weekly/WeeklyDiary.test.jsx`

Expected: PASS.

- [ ] **Step 5: Commit the completed task (not available: project folder is not a Git root)**

```bash
git add "app/(dashboard)/layout.js" components/dashboard/Dashboard.js components/dashboard/DashboardHeader.jsx components/dashboard/InboxPanel.jsx components/weekly/WeeklyDiary.jsx tests/components/dashboard/Dashboard.test.jsx tests/components/weekly/WeeklyDiary.test.jsx
git commit -m "feat: show shared pending todos in dashboards"
```

### Task 5: Full regression and production build

**Files:**
- Modify only if a verified failure requires a Task 1-4 owned file.

**Interfaces:**
- Consumes all feature and UI modules from Tasks 1-4.
- Produces full test and build evidence.

- [x] **Step 1: Run every test file after the runner-process ruling**

Run: `node_modules/.bin/vitest.cmd run`

Expected: all existing and new tests pass.

- [x] **Step 2: Run a production build through the local Next CLI**

Run: `node node_modules/next/dist/bin/next build`

Expected: build completes without server/client-boundary or compilation errors.

- [ ] **Step 3: Inspect task-owned changes only (not available: project folder is not a Git root)**

Run: `git diff -- app/(dashboard)/layout.js features/todos components/todos components/dashboard components/weekly tests docs/superpowers`

Expected: only this feature, its tests, and its design/plan documents are changed.

- [ ] **Step 4: Commit design and plan documents (not available: project folder is not a Git root)**

```bash
git add docs/superpowers/specs/2026-09-23-shared-todo-add-design.md docs/superpowers/plans/2026-09-23-shared-todo-add.md
git commit -m "docs: plan shared todo addition"
```
