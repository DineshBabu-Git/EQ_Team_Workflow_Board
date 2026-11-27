// Ids that two different files must agree on, built in one place.

// The card's status select and the board's "put focus back" code.
export function getStatusSelectId(taskId) {
  return `status-${taskId}`;
}

// The form element, so TaskModal can find the first invalid field inside it after a failed submit.
export const TASK_FORM_ID = "task-form";
