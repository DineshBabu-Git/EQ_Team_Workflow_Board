// The reducer must be pure: same input, same output, and no clock or random ids inside.
// React may run it twice in development. So the caller puts `updatedAt` and new tasks
// inside the action, already built.

export const ACTION_TYPES = {
  ADD: "tasks/add",
  UPDATE: "tasks/update",
  MOVE: "tasks/move",
  DELETE: "tasks/delete",
  SET: "tasks/set",
};

export function tasksReducer(tasks, action) {
  switch (action.type) {
    case ACTION_TYPES.ADD:
      return [...tasks, action.task];

    case ACTION_TYPES.UPDATE:
      return tasks.map(function (task) {
        if (task.id !== action.id) {
          return task;
        }
        return { ...task, ...action.changes, updatedAt: action.updatedAt };
      });

    case ACTION_TYPES.MOVE: {
      const taskToMove = tasks.find(function (task) {
        return task.id === action.id;
      });

      // Same column (or unknown id): hand back the same array. React then skips the
      // re-render, and the task's "updated" time is not touched for nothing.
      if (!taskToMove || taskToMove.status === action.status) {
        return tasks;
      }

      return tasks.map(function (task) {
        if (task.id !== action.id) {
          return task;
        }
        return { ...task, status: action.status, updatedAt: action.updatedAt };
      });
    }

    case ACTION_TYPES.DELETE:
      return tasks.filter(function (task) {
        return task.id !== action.id;
      });

    case ACTION_TYPES.SET:
      return action.tasks;

    default:
      // A typo in an action type should fail loudly, not silently do nothing.
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
