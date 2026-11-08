export function getTodoEvents(tasks) {
  return (Array.isArray(tasks) ? tasks : [])
    .filter((task) => task?.startAt && task?.endAt)
    .map((task) => ({
      id: `event-${task.id}`,
      taskId: task.id,
      start: task.startAt,
      end: task.endAt,
    }));
}
