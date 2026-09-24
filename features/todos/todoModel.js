const DURATION_ERROR = "예상 소요 시간은 30~960분 사이의 30분 단위로 입력해주세요.";

function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === value;
}

function createTaskId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `task-${globalThis.crypto.randomUUID()}`;
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function validateTodoDraft(draft) {
  const title = String(draft?.title ?? "").trim();
  const startDate = draft?.startDate;
  const dueDate = draft?.dueDate;
  const durationMinutes = Number(draft?.durationMinutes);
  const fieldErrors = {};

  if (!title) {
    fieldErrors.title = "할 일을 입력해주세요.";
  }

  if (!isIsoDate(startDate)) {
    fieldErrors.startDate = "시작 날짜를 선택해주세요.";
  }

  if (!isIsoDate(dueDate)) {
    fieldErrors.dueDate = "마감 날짜를 선택해주세요.";
  } else if (isIsoDate(startDate) && dueDate < startDate) {
    fieldErrors.dueDate = "마감 날짜는 시작 날짜보다 빠를 수 없어요.";
  }

  if (
    !Number.isInteger(durationMinutes)
    || durationMinutes < 30
    || durationMinutes > 960
    || durationMinutes % 30 !== 0
  ) {
    fieldErrors.durationMinutes = DURATION_ERROR;
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

export function createTodo(draft, createId = createTaskId) {
  return {
    id: createId(),
    title: String(draft?.title ?? "").trim(),
    startDate: draft?.startDate,
    dueDate: draft?.dueDate,
    durationMinutes: Number(draft?.durationMinutes),
    priority: "medium",
    category: "Inbox",
    completed: false,
    syncStatus: "pending",
  };
}
