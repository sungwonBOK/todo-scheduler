import { validateTodoDraft } from "../todos/todoModel.js";

const DURATION_STEP_MINUTES = 30;
const FOLLOW_UP_MESSAGE = "언제, 얼마나 할지 조금만 더 알려주세요.";

function toLocalDate(isoDateTime) {
  const match = /^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}/.exec(String(isoDateTime ?? ""));

  return match ? match[1] : null;
}

function toDurationMinutes(schedule) {
  const startAt = Date.parse(schedule.startAt);
  const endAt = Date.parse(schedule.endAt);
  const minutes = Number.isNaN(startAt) || Number.isNaN(endAt)
    ? Number(schedule.durationMinutes)
    : (endAt - startAt) / 60000;

  return Math.ceil(minutes / DURATION_STEP_MINUTES) * DURATION_STEP_MINUTES;
}

export function scheduleToTodoResponse(schedule) {
  if (!schedule?.ready) {
    return {
      success: false,
      needsMoreInfo: true,
      message: FOLLOW_UP_MESSAGE,
    };
  }

  const todo = {
    title: String(schedule.title ?? "").trim(),
    startDate: toLocalDate(schedule.startAt),
    dueDate: toLocalDate(schedule.endAt),
    durationMinutes: toDurationMinutes(schedule),
    startAt: schedule.startAt,
    endAt: schedule.endAt,
  };
  const { isValid, fieldErrors } = validateTodoDraft(todo);

  if (!isValid) {
    return {
      success: false,
      needsMoreInfo: true,
      message: Object.values(fieldErrors)[0],
    };
  }

  return { success: true, todo };
}
