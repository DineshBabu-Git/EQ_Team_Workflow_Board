import { describe, expect, it } from "vitest";
import { cleanTaskFields, createTask } from "../utils/taskFactory";

const fields = {
  title: "  Fix bug  ",
  description: "  Details  ",
  status: "Backlog",
  priority: "High",
  assignee: " Sam ",
  tags: ["bug"],
};

describe("cleanTaskFields", function () {
  it("trims text fields and keeps the rest", function () {
    expect(cleanTaskFields(fields)).toEqual({
      title: "Fix bug",
      description: "Details",
      status: "Backlog",
      priority: "High",
      assignee: "Sam",
      tags: ["bug"],
    });
  });

  it("falls back to an empty description and no tags", function () {
    const result = cleanTaskFields({ ...fields, description: undefined, tags: undefined });
    expect(result.description).toBe("");
    expect(result.tags).toEqual([]);
  });
});

describe("createTask", function () {
  it("adds an id and equal createdAt/updatedAt from the given time", function () {
    const task = createTask(fields, new Date("2026-03-01T08:00:00.000Z"));
    expect(task.id).toEqual(expect.any(String));
    expect(task.id).not.toBe("");
    expect(task.createdAt).toBe("2026-03-01T08:00:00.000Z");
    expect(task.updatedAt).toBe("2026-03-01T08:00:00.000Z");
    expect(task.title).toBe("Fix bug");
  });

  it("gives each task a different id", function () {
    expect(createTask(fields).id).not.toBe(createTask(fields).id);
  });
});
