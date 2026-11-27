import { DEFAULT_STATUS, STATUSES } from "./constants";

// Turns a flat list into { Backlog: [...], "In Progress": [...], Done: [...] }.
// Order inside each column is the same as the order of the original list.
// A task with an unknown status goes into the default column instead of disappearing,
// because a visible task in the wrong place is easier to notice than a missing one.
export function groupTasksByStatus(tasks) {
  const groups = {};

  STATUSES.forEach(function (status) {
    groups[status] = [];
  });

  tasks.forEach(function (task) {
    const status = groups[task.status] ? task.status : DEFAULT_STATUS;
    groups[status].push(task);
  });

  return groups;
}
