import { describe, expect, it } from "vitest";
import { groupTasksByStatus } from "../utils/groupTasks";

function idsOf(tasks) {
  return tasks.map(function (task) {
    return task.id;
  });
}

describe("groupTasksByStatus", function () {
  it("returns an empty list for every column when there are no tasks", function () {
    expect(groupTasksByStatus([])).toEqual({ Backlog: [], "In Progress": [], Done: [] });
  });

  it("puts each task in the column of its status", function () {
    const tasks = [
      { id: "a", status: "Done" },
      { id: "b", status: "Backlog" },
      { id: "c", status: "In Progress" },
    ];
    const groups = groupTasksByStatus(tasks);
    expect(idsOf(groups.Backlog)).toEqual(["b"]);
    expect(idsOf(groups["In Progress"])).toEqual(["c"]);
    expect(idsOf(groups.Done)).toEqual(["a"]);
  });

  it("keeps the original order inside a column", function () {
    const tasks = [
      { id: "a", status: "Backlog" },
      { id: "b", status: "Done" },
      { id: "c", status: "Backlog" },
    ];
    expect(idsOf(groupTasksByStatus(tasks).Backlog)).toEqual(["a", "c"]);
  });

  it("puts a task with an unknown status into Backlog instead of losing it", function () {
    const groups = groupTasksByStatus([{ id: "x", status: "Archived" }]);
    expect(idsOf(groups.Backlog)).toEqual(["x"]);
  });
});
