# Todo Scheduler Frontend Shell Design

## 1. Goal

Build the first usable frontend surface for Todo Scheduler:

- a login page and a sign-up page,
- a diary-inspired home dashboard at `/`, and
- a clear, expandable code structure for future scheduling features.

This phase is frontend-only. The authentication forms are a demo entry
flow: they validate their visible fields, do not store credentials, and send
the visitor to the home dashboard after submission. The dashboard uses
frontend seed data and local UI interactions only.

## 2. Product Decisions

| Decision | Choice |
| --- | --- |
| Authentication | Demo-only UI. No server, API, password storage, or account claims. |
| Primary home route | `/` remains the dashboard, consistent with the existing MVP design. |
| Intended viewport | Desktop-first, with responsive fallbacks for narrower screens. |
| Visual tone | Calm paper-diary feel: warm cream background, ink-like navy text, and restrained lavender, mint, and peach accents. |
| Scope | Login, sign-up, shared shell, dashboard presentation, and lightweight client-side interactions. Scheduling engine and real persistence are out of scope. |

## 3. User Flows

```text
/login
  -> validate visible fields
  -> submit demo form
  -> /

/signup
  -> validate visible fields and confirmation
  -> submit demo form
  -> /

/
  -> review today's schedule and Inbox
  -> mark a displayed task complete
  -> add a lightweight task to Inbox
  -> use navigation placeholders for future Schedule and Settings pages
```

The login and sign-up pages link to one another. Successful demo submissions
display no claim that an account was created; they simply enter the dashboard.

## 4. Information Architecture and File Boundaries

```text
app/
  (auth)/
    login/page.js                 # Login route composition
    signup/page.js                # Sign-up route composition
  (dashboard)/
    page.js                       # Diary dashboard route composition
  layout.js                       # Fonts, metadata, global application frame
  globals.css                     # Tokens, base rules, Tailwind layers

components/
  auth/
    AuthCard.js                   # Shared visual card for auth routes
    AuthForm.js                   # Configurable login/sign-up form
  dashboard/
    DashboardHeader.js            # Greeting, current date, profile affordance
    TodayTimeline.js              # Today's ordered scheduled-task blocks
    InboxPanel.js                 # Unscheduled-task list and quick add surface
    WeekProgressCard.js           # Weekly completion / planned-time summary
  layout/
    AppShell.js                   # Dashboard navigation and content frame
    AuthShell.js                  # Centered, distraction-free auth frame
    SidebarNav.js                 # Shared app navigation for future routes
  ui/
    Button.js
    Card.js
    Checkbox.js
    Input.js
    Logo.js

features/
  auth/
    authDemo.js                   # Form rules and demo submit contract
  dashboard/
    dashboardModel.js             # View-model selectors and summary calculation
  tasks/
    taskActions.js                # Client-only task mutation helpers

data/
  dashboardSeed.js                # Explicit demo tasks, events, and user data

lib/
  cn.js                           # Conditional class name helper
  dateFormatters.js               # Korean locale date labels
```

Each route composes feature-facing components only. Visual primitives remain
in `components/ui`; dashboard modules receive explicit data and callbacks
instead of reaching into global state. When real persistence arrives,
`data/dashboardSeed.js` can be replaced by a repository/store adapter while
the presentational components retain their interfaces.

## 5. Layout and Visual System

### Authentication

Auth routes use a centered `AuthShell` with a small wordmark, welcoming copy,
a readable form card, and a reciprocal route link. The card is white or
near-white against a warm paper background. A tiny illustrated accent or
softly colored shape may be used, but controls stay conventional and highly
legible.

### Dashboard

The desktop dashboard uses a navigation rail plus a two-column main area:

```text
+------------------+---------------------------------------+----------------------+
| SidebarNav       | Today: greeting, date, timeline       | Inbox                |
| logo / nav       | planned blocks and completion toggles | quick add            |
| future sections  |                                       | week progress card   |
+------------------+---------------------------------------+----------------------+
```

At tablet widths, the right column moves below the timeline. At small widths,
the navigation condenses and all content becomes a single vertical sequence.
The result should feel like a practical daily planner rather than a marketing
landing page.

### Design Tokens

- Background: warm cream, with very subtle tonal separation between areas.
- Text: deep navy / charcoal rather than pure black.
- Accents: restrained pastel lavender, mint, and peach, chosen for task cards
  rather than large decorative surfaces.
- Shape: medium corner radii, gentle shadows, and a small number of organic
  details such as a date chip or soft dot pattern.
- Accessibility: text and interactive states must retain strong contrast;
  color never conveys task status alone.

## 6. Client-Side Data and Interaction Contract

The dashboard route owns temporary client state initialized from
`dashboardSeed.js`:

- `tasks`: Inbox and scheduled task records with `completed` status.
- `events`: today's visual time blocks, related to tasks by `taskId`.
- `user`: display name only.

`TodayTimeline` receives events plus task lookups and emits an explicit
`onToggleComplete(taskId)` callback. `InboxPanel` receives unscheduled tasks
and emits `onAddTask({ title, priority })`. `WeekProgressCard` receives
derived counts and planned minutes from `dashboardModel.js`.

No credentials, password values, or authentication token are written to
localStorage. The demo auth contract returns a successful navigation result
only after client-visible validation succeeds. A later real-auth adapter can
replace that contract without changing route or form composition.

## 7. Validation and Error Handling

- Login requires a valid-looking email and a non-empty password.
- Sign-up requires name, valid-looking email, password, and a matching password
  confirmation.
- Validation messages appear adjacent to the relevant field and are announced
  through accessible form semantics.
- Empty Inbox and timeline states render intentional empty-state copy rather
  than blank panels.
- Quick add ignores blank titles and keeps keyboard focus on the input with a
  clear inline message.
- Seed-data shape is handled defensively so a missing task relationship does
  not crash the timeline; it renders a safe fallback label.

## 8. Testing Strategy

Set up tests alongside the frontend scaffold:

- unit tests for auth validation and dashboard view-model calculations;
- component tests for validation messages, reciprocal auth links, quick-add,
  completion toggling, and empty states;
- a browser flow for login → dashboard → add task → complete task;
- a responsive visual check at desktop and narrow viewport sizes.

The initial browser test verifies UI behavior only and makes no assertion
about real accounts or persistent credentials.

## 9. Explicitly Deferred

- real user registration, sign-in, sign-out, password reset, or access control;
- backend APIs, database, Supabase, and synchronization;
- FullCalendar integration and automatic scheduling;
- task persistence across refreshes;
- profile editing, notification delivery, and calendar integrations.

## 10. Acceptance Criteria

1. `/login`, `/signup`, and `/` render as polished, linked routes.
2. Demo auth forms validate inputs and navigate to the home dashboard after a
   valid submission.
3. The home dashboard clearly presents today’s schedule, Inbox, quick add,
   and weekly progress in a diary-like desktop layout.
4. A user can add an Inbox item and toggle a displayed task’s completion state
   without a page reload.
5. UI modules follow the documented folder boundaries and can later accept a
   real auth or data adapter without wholesale route rewrites.
6. Automated checks cover the critical frontend interaction paths.
