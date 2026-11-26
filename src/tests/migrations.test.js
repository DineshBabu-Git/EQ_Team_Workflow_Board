import { describe, expect, it } from "vitest";
import { migrateStoredData, migrateV1toV2 } from "../utils/migrations";

const oldTasks = [
  { id: "a", title: "Buy milk", done: false, createdAt: 1700000000000 },
  { id: "b", title: "Pay rent", done: true, createdAt: 1700000500000 },
];

describe("migrateV1toV2", function () {
  it("turns done into a status", function () {
    const result = migrateV1toV2(oldTasks);
    expect(result[0].status).toBe("Backlog");
    expect(result[1].status).toBe("Done");
  });

  it("adds the new fields with default values", function () {
    const task = migrateV1toV2(oldTasks)[0];
    expect(task.priority).toBe("Medium");
    expect(task.assignee).toBe("Unassigned");
    expect(task.tags).toEqual([]);
    expect(task.description).toBe("");
  });

  it("converts the timestamp to an ISO string and copies it to updatedAt", function () {
    const task = migrateV1toV2(oldTasks)[0];
    expect(task.createdAt).toBe("2023-11-14T22:13:20.000Z");
    expect(task.updatedAt).toBe(task.createdAt);
  });

  it("keeps id and title", function () {
    const task = migrateV1toV2(oldTasks)[1];
    expect(task.id).toBe("b");
    expect(task.title).toBe("Pay rent");
  });

  it("does not crash on a broken timestamp", function () {
    const result = migrateV1toV2([{ id: "x", title: "Odd", done: false, createdAt: "not a date" }]);
    expect(Number.isNaN(Date.parse(result[0].createdAt))).toBe(false);
  });
});

describe("migrateStoredData", function () {
  it("migrates a bare array (version 1)", function () {
    const result = migrateStoredData(oldTasks);
    expect(result.migrated).toBe(true);
    expect(result.tasks).toHaveLength(2);
  });

  it("migrates an object with no schemaVersion", function () {
    const result = migrateStoredData({ tasks: oldTasks });
    expect(result.migrated).toBe(true);
  });

  it("leaves current data alone", function () {
    const stored = { schemaVersion: 2, tasks: [{ id: "z" }] };
    const result = migrateStoredData(stored);
    expect(result.migrated).toBe(false);
    expect(result.tasks).toEqual([{ id: "z" }]);
  });

  it("throws for a newer version it does not understand", function () {
    expect(function () {
      migrateStoredData({ schemaVersion: 99, tasks: [] });
    }).toThrow();
  });

  it("throws for something that is not task data", function () {
    expect(function () {
      migrateStoredData("hello");
    }).toThrow();
  });
});
