import { DEFAULT_SORT_DIRECTION, DEFAULT_SORT_FIELD, PRIORITY_RANK } from "./constants";

function toTime(isoString) {
  const time = Date.parse(isoString);
  // A bad date becomes 0 so the sort comparison never returns NaN.
  return Number.isNaN(time) ? 0 : time;
}

function compareTasks(firstTask, secondTask, sortField) {
  if (sortField === "created") {
    return toTime(firstTask.createdAt) - toTime(secondTask.createdAt);
  }
  if (sortField === "priority") {
    return (PRIORITY_RANK[firstTask.priority] || 0) - (PRIORITY_RANK[secondTask.priority] || 0);
  }
  return toTime(firstTask.updatedAt) - toTime(secondTask.updatedAt);
}

export function filterAndSortTasks(tasks, options = {}) {
  const { statuses = [], priority = "", searchText = "", sortField = DEFAULT_SORT_FIELD, sortDirection = DEFAULT_SORT_DIRECTION } = options;

  const searchLower = searchText.trim().toLowerCase();

  const filteredTasks = tasks.filter(function (task) {
    if (statuses.length > 0 && !statuses.includes(task.status)) {
      return false;
    }
    if (priority !== "" && task.priority !== priority) {
      return false;
    }
    if (searchLower !== "") {
      const text = `${task.title} ${task.description}`.toLowerCase();
      if (!text.includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  // filter() already made a new array, so sorting it does not touch the original.
  // sort() is stable, so tasks that tie keep their current relative order.
  return filteredTasks.sort(function (firstTask, secondTask) {
    const result = compareTasks(firstTask, secondTask, sortField);
    return sortDirection === "asc" ? result : -result;
  });
}
