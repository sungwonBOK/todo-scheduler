# Todo Scheduler MVP Design

## 1. 목적과 범위

사용자는 해야 할 일의 이름, 예상 소요 시간, 우선순위와 마감일을 입력한다. 사용자가 요일별로 사용할 수 없는 시간도 입력하면, 서비스는 남은 시간 구간에 작업을 자동으로 배정한 주간 일정표를 만든다. 사용자는 만들어진 일정 블록을 직접 끌어 이동하거나 길이를 조정할 수 있다.

이 문서는 4인 팀이 공유하는 MVP 기술 기준이다. 초기 릴리스는 데스크톱 웹을 우선하며, 로그인과 서버 데이터 저장은 다음 단계로 미룬다. 데이터는 우선 브라우저의 `localStorage`에 저장한다.

### MVP 성공 기준

- 작업과 불가능 시간을 입력하고 주간 일정을 생성할 수 있다.
- 각 작업의 총 배정 시간이 예상 소요 시간과 일치한다.
- 불가능 시간에는 어떤 작업도 배정되지 않는다.
- 새로고침 뒤에도 입력 데이터와 생성된 일정이 유지된다.
- 사용자가 일정 블록을 수동으로 옮기거나 리사이즈할 수 있다.

### MVP에서 제외하는 것

- 로그인, 여러 기기 동기화, 공유 일정
- 반복 작업, 외부 캘린더 연동, 알림
- AI 기반 생산성 조언 및 고급 최적화

## 2. 선택한 기술 스택

| 영역 | 선택 | 역할 | MVP 선택 이유 |
| --- | --- | --- | --- |
| 프레임워크 | Next.js App Router | React 기반 화면·라우팅·향후 서버 기능 | 프런트부터 만들고 API와 인증을 같은 프로젝트로 확장할 수 있다. |
| 언어 | JavaScript | 앱 코드 | 팀의 초기 진입 장벽을 낮춘다. 데이터 모델에는 JSDoc을 사용한다. |
| UI | React | 폼, 목록, 캘린더 컴포넌트 | 상태가 많은 상호작용 UI를 컴포넌트 단위로 관리한다. |
| 스타일 | Tailwind CSS + shadcn/ui | 레이아웃과 공통 UI | 빠른 구현과 일관된 화면을 함께 확보한다. |
| 캘린더 | `@fullcalendar/react` + timeGrid + interaction | 주간 시간표, 드래그, 리사이즈 | 주간 시간 기반 일정 UI와 수동 편집 기능을 빠르게 제공한다. |
| 전역 상태 | Zustand | 작업, 불가능 시간, 일정 데이터 | 작은 API로 클라이언트 상태를 관리한다. |
| 저장 | Zustand persist + `localStorage` | 브라우저 영속 저장 | 로그인·DB 없이 MVP를 사용할 수 있다. |
| 폼/검증 | React Hook Form + Zod | 입력과 유효성 검증 | 폼 상태와 오류 메시지를 분리하고 검증 규칙을 재사용한다. |
| 날짜/시간 | date-fns + date-fns-tz | 주 시작일, 시간 구간, 시간대 | 날짜 계산을 표준화하고 시간대 문제를 줄인다. |
| 테스트 | Vitest + React Testing Library + Playwright | 로직·컴포넌트·사용 흐름 검증 | 자동 배정의 정확성과 주요 UI 흐름을 검증한다. |

Next.js는 React를 포함하는 프레임워크다. 즉 프로젝트는 Next.js를 사용하면서 모든 화면을 React 컴포넌트로 만든다. 브라우저 API, FullCalendar, Zustand `localStorage` 저장은 클라이언트에서만 동작하므로 해당 컴포넌트와 저장소에는 `"use client"`를 선언한다.

## 3. 아키텍처

```text
Next.js App Router
  ├─ Server Component: 페이지 껍데기와 초기 레이아웃
  └─ Client Component: 작업 입력, 가능 시간 편집, 주간 캘린더
          │
          ├─ Zustand store ── localStorage
          │
          └─ scheduleEngine (순수 JavaScript)
                    │
                    └─ 생성된 일정 이벤트 ── FullCalendar
```

자동 배정 엔진은 React 또는 Zustand에 의존하지 않는 순수 함수로 만든다. 입력은 작업 목록과 불가능 시간 목록, 설정값이고 출력은 배정된 일정 목록과 배정되지 못한 작업 목록이다. 이 경계를 유지하면 엔진을 독립적으로 테스트할 수 있고, 추후 Next.js 서버나 API에서 실행하도록 옮길 수 있다.

## 4. 화면과 파일 경계

```text
app/
  page.js                         # 대시보드: 작업 목록과 일정 생성 진입점
  schedule/page.js                # 주간 일정표 전체 화면
  settings/page.js                # 사용 가능/불가능 시간 설정

components/
  task/TaskForm.js                # 작업 추가·수정 폼
  task/TaskList.js                # 미완료·미배정 작업 목록
  availability/AvailabilityEditor.js # 요일별 불가능 시간 편집
  schedule/WeeklyCalendar.js      # FullCalendar를 감싼 일정표
  schedule/ScheduleSummary.js     # 배정 결과와 미배정 사유

lib/
  scheduleEngine.js               # 시간 구간 산출과 작업 배정
  timeUtils.js                    # 날짜·시간 구간 계산
  validation.js                   # 공유 Zod 스키마

store/
  scheduleStore.js                # Zustand 상태·localStorage 영속화
```

## 5. 핵심 데이터 모델

```js
// Task
{
  id: "task_123",
  title: "프로젝트 보고서 작성",
  durationMinutes: 120,
  priority: "high", // high | medium | low
  dueDate: "2026-09-25", // 선택값
  completed: false
}

// UnavailableSlot
{
  id: "slot_123",
  dayOfWeek: 1, // 0=일요일, 1=월요일 ... 6=토요일
  startTime: "09:00",
  endTime: "18:00"
}

// ScheduledEvent
{
  id: "event_123",
  taskId: "task_123",
  start: "2026-09-22T19:00:00+09:00",
  end: "2026-09-22T20:00:00+09:00",
  manuallyEdited: false
}
```

모든 시간은 사용자 설정 시간대(초기값 `Asia/Seoul`)로 계산하고 저장한다. 작업은 MVP에서 분할 배정을 허용한다. 예를 들어 120분 작업은 가능한 60분 구간 두 곳에 배정될 수 있다.

## 6. 자동 배정 규칙

1. 주간 기본 작업 가능 시간(예: 09:00~22:00)에서 불가능 시간을 뺀다.
2. 이미 수동 편집된 일정도 점유 시간으로 제외한다.
3. 남은 작업을 마감일이 빠른 순서, 우선순위가 높은 순서, 긴 작업 순서로 정렬한다.
4. 각 작업을 가장 이른 가능한 빈 시간에 최소 30분 단위로 분할 배정한다.
5. 한 주에 모두 배정하지 못한 작업은 미배정 목록과 남은 시간으로 표시한다.

처음에는 설명 가능한 규칙 기반 알고리즘을 사용한다. 사용자의 실제 피드백이 쌓이기 전에는 복잡한 최적화나 AI 모델을 추가하지 않는다.

## 7. 오류 처리와 테스트 기준

- 작업 제목은 비어 있을 수 없고, 소요 시간은 30~960분 범위의 30분 단위여야 한다.
- 불가능 시간의 시작은 종료보다 빨라야 하며, 겹치는 구간은 병합한다.
- 저장 데이터가 손상되었으면 안전한 빈 상태로 시작하고 사용자에게 초기화 안내를 표시한다.
- 배정 엔진은 불가능 시간 침범, 시간 중복, 총 배정 시간, 미배정 작업을 단위 테스트한다.
- Playwright는 작업 추가 → 불가능 시간 설정 → 일정 생성 → 블록 드래그 → 새로고침 후 유지 흐름을 검증한다.

## 8. 이후 확장

로그인과 동기화가 필요해지면 Supabase를 추가한다. Supabase Auth는 사용자 인증에, PostgreSQL은 작업·가능 시간·일정 저장에 사용한다. Next.js Route Handler 또는 Server Action은 권한 확인, 외부 연동, 무거운 일정 생성처럼 서버 실행이 필요한 경우에만 도입한다.

## 9. 팀 역할 제안

| 역할 | 담당 경계 |
| --- | --- |
| 화면/디자인 | Tailwind·shadcn/ui, 작업 입력과 설정 화면 |
| 캘린더 UX | FullCalendar 통합, 드래그/리사이즈, 일정 결과 표시 |
| 일정 엔진 | `scheduleEngine`, 시간 계산, 단위 테스트 |
| 품질/통합 | 데이터 저장, 검증, E2E 테스트, 배포 준비 |

역할은 코드 소유권을 나누기 위한 기준일 뿐, 모든 PR은 데이터 모델과 자동 배정 규칙 변경 여부를 함께 검토한다.
