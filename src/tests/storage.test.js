import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY } from "../utils/constants";
import { BACKUP_STORAGE_KEY, STORAGE_ERRORS, loadTasks, saveTasks } from "../utils/storage";

beforeEach(function () {
  localStorage.clear();
});

afterEach(function () {
  vi.restoreAllMocks();
});

describe("loadTasks and saveTasks", function () {
  it("returns an empty list when nothing is stored yet", function () {
    expect(loadTasks()).toEqual({ tasks: [], migrated: false, error: null });
  });

  it("saves and loads tasks without migrating", function () {
    const tasks = [{ id: "1", title: "Saved task" }];
    expect(saveTasks(tasks)).toEqual({ ok: true });

    const result = loadTasks();
    expect(result.tasks).toEqual(tasks);
    expect(result.migrated).toBe(false);
    expect(result.error).toBeNull();
  });

  it("migrates old data, backs up the original, and only migrates once", function () {
    const original = JSON.stringify([{ id: "a", title: "Old", done: true, createdAt: 1700000000000 }]);
    localStorage.setItem(STORAGE_KEY, original);

    const firstLoad = loadTasks();
    expect(firstLoad.migrated).toBe(true);
    expect(firstLoad.tasks[0].status).toBe("Done");
    expect(localStorage.getItem(BACKUP_STORAGE_KEY)).toBe(original);

    // The provider saves the migrated tasks; after that the next load is already v2.
    saveTasks(firstLoad.tasks);
    expect(loadTasks().migrated).toBe(false);
  });

  it("reports corrupt JSON and keeps a backup of the broken text", function () {
    localStorage.setItem(STORAGE_KEY, "{not valid json");

    const result = loadTasks();
    expect(result.error).toBe(STORAGE_ERRORS.UNREADABLE);
    expect(result.tasks).toEqual([]);
    expect(localStorage.getItem(BACKUP_STORAGE_KEY)).toBe("{not valid json");
  });

  it("reports data from a newer schema as unreadable", function () {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99, tasks: [] }));
    expect(loadTasks().error).toBe(STORAGE_ERRORS.UNREADABLE);
  });

  it("reports unavailable storage when reading throws", function () {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function () {
      throw new Error("blocked");
    });
    expect(loadTasks().error).toBe(STORAGE_ERRORS.UNAVAILABLE);
  });

  it("returns ok: false when saving throws", function () {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function () {
      throw new Error("quota exceeded");
    });
    expect(saveTasks([])).toEqual({ ok: false });
  });
});
