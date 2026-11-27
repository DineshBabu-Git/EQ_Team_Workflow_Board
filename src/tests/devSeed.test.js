import { describe, expect, it } from "vitest";
import { PRIORITIES, STATUSES } from "../utils/constants";
import { createV1SampleData, createV2SampleData } from "../utils/devSeed";
import { migrateStoredData } from "../utils/migrations";

// If these seed functions drift away from the real schema, the demo buttons would
// quietly show the wrong thing, so the tests check them against the real migration code.
describe("createV1SampleData", function () {
  it("is old-format data that the migration upgrades", function () {
    const result = migrateStoredData(createV1SampleData());
    expect(result.migrated).toBe(true);
    expect(result.tasks).toHaveLength(4);
  });

  it("migrates done and not-done tasks to different statuses", function () {
    const statuses = migrateStoredData(createV1SampleData()).tasks.map((task) => task.status);
    expect(statuses).toContain("Done");
    expect(statuses).toContain("Backlog");
  });
});

describe("createV2SampleData", function () {
  const stored = createV2SampleData(new Date("2026-01-10T12:00:00.000Z"));

  it("is current-format data that needs no migration", function () {
    expect(migrateStoredData(stored).migrated).toBe(false);
  });

  it("has unique ids, valid statuses and priorities, and real dates", function () {
    const ids = stored.tasks.map((task) => task.id);
    expect(new Set(ids).size).toBe(ids.length);

    stored.tasks.forEach(function (task) {
      expect(STATUSES).toContain(task.status);
      expect(PRIORITIES).toContain(task.priority);
      expect(Number.isNaN(Date.parse(task.createdAt))).toBe(false);
      expect(Number.isNaN(Date.parse(task.updatedAt))).toBe(false);
    });
  });

  it("uses every status so every column has something to show", function () {
    const statuses = stored.tasks.map((task) => task.status);
    STATUSES.forEach(function (status) {
      expect(statuses).toContain(status);
    });
  });
});
