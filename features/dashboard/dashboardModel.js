function asList(value) {
  return Array.isArray(value) ? value : [];
}

function toMinutes(value) {
  return Number.isFinite(value) ? value : 0;
}

export function getInboxTasks(tasks, events) {
  const scheduledTaskIds = new Set(
    asList(events)
      .map((event) => event?.taskId)
      .filter(Boolean),
  );

  return asList(tasks).filter(
    (task) => task && !task.completed && !scheduledTaskIds.has(task.id),
  );
}

export function getWeekProgress(tasks, events) {
  const taskList = asList(tasks).filter(Boolean);
  const scheduledTaskIds = new Set(
    asList(events)
      .map((event) => event?.taskId)
      .filter(Boolean),
  );
  const completedTasks = taskList.filter((task) => task.completed);
  const totalTasks = taskList.length;

  return {
    totalTasks,
    completedTasks: completedTasks.length,
    plannedMinutes: taskList
      .filter((task) => scheduledTaskIds.has(task.id))
      .reduce((total, task) => total + toMinutes(task.durationMinutes), 0),
    completedMinutes: completedTasks.reduce(
      (total, task) => total + toMinutes(task.durationMinutes),
      0,
    ),
    completionPercentage: totalTasks
      ? Math.round((completedTasks.length / totalTasks) * 100)
      : 0,
  };
}
