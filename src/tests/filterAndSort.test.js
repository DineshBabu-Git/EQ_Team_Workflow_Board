import { describe, expect, it } from "vitest";
import { filterAndSortTasks } from "../utils/filterAndSort";

function makeTask(overrides) {
  return {
    id: "x",
    title: "Task",
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

const sampleTasks = [
  makeTask({ id: "a", title: "Fix login bug", description: "Users cannot sign in", status: "In Progress", priority: "High", createdAt: "2026-01-03T10:00:00.000Z", updatedAt: "2026-01-10T10:00:00.000Z" }),
  makeTask({ id: "b", title: "Write docs", description: "Explain the LOGIN flow", status: "Backlog", priority: "Low", createdAt: "2026-01-01T10:00:00.000Z", updatedAt: "2026-01-05T10:00:00.000Z" }),
  makeTask({ id: "c", title: "Design board", description: "Colors and spacing", status: "Done", priority: "Medium", createdAt: "2026-01-02T10:00:00.000Z", updatedAt: "2026-01-08T10:00:00.000Z" }),
  makeTask({ id: "d", title: "Release", description: "", status: "Backlog", priority: "High", createdAt: "2026-01-04T10:00:00.000Z", updatedAt: "2026-01-02T10:00:00.000Z" }),
];

function idsOf(tasks) {
  return tasks.map(function (task) {
    return task.id;
  });
}

describe("filtering", function () {
  it("returns every task when no filters are set (default sort: updated, newest first)", function () {
    expect(idsOf(filterAndSortTasks(sampleTasks))).toEqual(["a", "c", "b", "d"]);
  });

  it("filters by several statuses at once", function () {
    const result = filterAndSortTasks(sampleTasks, { statuses: ["Backlog", "Done"] });
    expect(idsOf(result)).toEqual(["c", "b", "d"]);
  });

  it("filters by priority", function () {
    expect(idsOf(filterAndSortTasks(sampleTasks, { priority: "High" }))).toEqual(["a", "d"]);
  });

  it("searches title and description, ignoring case and outer spaces", function () {
    expect(idsOf(filterAndSortTasks(sampleTasks, { searchText: "  login " }))).toEqual(["a", "b"]);
  });

  it("returns an empty array when nothing matches", function () {
    expect(filterAndSortTasks(sampleTasks, { searchText: "zzz" })).toEqual([]);
  });

  it("combines filters", function () {
    const result = filterAndSortTasks(sampleTasks, { statuses: ["Backlog"], priority: "High" });
    expect(idsOf(result)).toEqual(["d"]);
  });
});

describe("sorting", function () {
  it("sorts by priority, High first when descending", function () {
    const result = filterAndSortTasks(sampleTasks, { sortField: "priority", sortDirection: "desc" });
    expect(idsOf(result)).toEqual(["a", "d", "c", "b"]);
  });

  it("sorts by priority, Low first when ascending", function () {
    const result = filterAndSortTasks(sampleTasks, { sortField: "priority", sortDirection: "asc" });
    expect(idsOf(result)).toEqual(["b", "c", "a", "d"]);
  });

  it("sorts by created date in both directions", function () {
    expect(idsOf(filterAndSortTasks(sampleTasks, { sortField: "created", sortDirection: "asc" }))).toEqual(["b", "c", "a", "d"]);
    expect(idsOf(filterAndSortTasks(sampleTasks, { sortField: "created", sortDirection: "desc" }))).toEqual(["d", "a", "c", "b"]);
  });

  it("sorts by updated date ascending", function () {
    const result = filterAndSortTasks(sampleTasks, { sortField: "updated", sortDirection: "asc" });
    expect(idsOf(result)).toEqual(["d", "b", "c", "a"]);
  });

  it("does not change the original array", function () {
    filterAndSortTasks(sampleTasks, { sortField: "created", sortDirection: "asc" });
    expect(idsOf(sampleTasks)).toEqual(["a", "b", "c", "d"]);
  });
});
