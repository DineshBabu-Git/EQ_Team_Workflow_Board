// The card's status select and the board's "put focus back" code must agree on this id,
// so it is built in one place.
export function getStatusSelectId(taskId) {
  return `status-${taskId}`;
}
