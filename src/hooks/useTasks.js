import { useContext } from "react";
import { TasksContext } from "../context/tasksContext";

// Gives components access to the tasks and the functions that change them.
// Throws a clear error when used outside <TasksProvider>.
function useTasks() {
  const context = useContext(TasksContext);

  if (context === null) {
    throw new Error("useTasks must be used inside a <TasksProvider>");
  }

  return context;
}

export default useTasks;
