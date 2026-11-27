import { describe, expect, it } from "vitest";
import { ACTION_TYPES, tasksReducer } from "../context/tasksReducer";

function makeTask(overrides) {
  return {
    id: "a",
    title: "First",
    description: "",
    status: "Backlog",
    priority: "Medium",
    assignee: "Sam",
    tags: [],
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    ...overrides,
  };
}

// Frozen data throws if the reducer tries to change it, which proves it never mutates.
function frozenTasks() {
  return Object.freeze([Object.freeze(makeTask({ id: "a" })), Object.freeze(makeTask({ id: "b", title: "Second" }))]);
}

describe("tasksReducer", function () {
  it("ADD appends the task", function () {
    const newTask = makeTask({ id: "c" });
    const result = tasksReducer(frozenTasks(), { type: ACTION_TYPES.ADD, task: newTask });
    expect(result.map((task) => task.id)).toEqual(["a", "b", "c"]);
  });

  it("UPDATE changes only the target task and sets updatedAt", function () {
    const result = tasksReducer(frozenTasks(), {
      type: ACTION_TYPES.UPDATE,
      id: "b",
      changes: { title: "Renamed", priority: "High" },
      updatedAt: "2026-02-01T00:00:00.000Z",
    });
    expect(result[0].title).toBe("First");
    expect(result[1].title).toBe("Renamed");
    expect(result[1].priority).toBe("High");
    expect(result[1].updatedAt).toBe("2026-02-01T00:00:00.000Z");
    expect(result[1].createdAt).toBe("2026-01-01T10:00:00.000Z");
  });

  it("MOVE changes the status and updatedAt", function () {
    const result = tasksReducer(frozenTasks(), {
      type: ACTION_TYPES.MOVE,
      id: "a",
      status: "Done",
      updatedAt: "2026-02-01T00:00:00.000Z",
    });
    expect(result[0].status).toBe("Done");
    expect(result[0].updatedAt).toBe("2026-02-01T00:00:00.000Z");
  });

  it("MOVE to the same status returns the same array", function () {
    const tasks = frozenTasks();
    const result = tasksReducer(tasks, {
      type: ACTION_TYPES.MOVE,
      id: "a",
      status: "Backlog",
      updatedAt: "2026-02-01T00:00:00.000Z",
    });
    expect(result).toBe(tasks);
  });

  it("MOVE with an unknown id returns the same array", function () {
    const tasks = frozenTasks();
    const result = tasksReducer(tasks, { type: ACTION_TYPES.MOVE, id: "nope", status: "Done", updatedAt: "x" });
    expect(result).toBe(tasks);
  });

  it("DELETE removes the task", function () {
    const result = tasksReducer(frozenTasks(), { type: ACTION_TYPES.DELETE, id: "a" });
    expect(result.map((task) => task.id)).toEqual(["b"]);
  });

  it("SET replaces everything", function () {
    const replacement = [makeTask({ id: "z" })];
    expect(tasksReducer(frozenTasks(), { type: ACTION_TYPES.SET, tasks: replacement })).toBe(replacement);
  });

  it("throws for an unknown action", function () {
    expect(function () {
      tasksReducer([], { type: "tasks/oops" });
    }).toThrow();
  });
});
