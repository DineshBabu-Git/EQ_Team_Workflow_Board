import { describe, expect, it } from "vitest";
import { hasErrors, parseTags, tagsToText, validateTaskForm } from "../utils/validators";

const validValues = {
  title: "Fix login bug",
  description: "",
  status: "Backlog",
  priority: "Medium",
  assignee: "Sam",
};

describe("validateTaskForm", function () {
  it("accepts valid values", function () {
    expect(validateTaskForm(validValues)).toEqual({});
  });

  it("requires a title, even if it is only spaces", function () {
    const errors = validateTaskForm({ ...validValues, title: "   " });
    expect(errors.title).toBe("Title is required.");
  });

  it("limits the title to 80 characters", function () {
    expect(validateTaskForm({ ...validValues, title: "a".repeat(80) }).title).toBeUndefined();
    expect(validateTaskForm({ ...validValues, title: "a".repeat(81) }).title).toBeDefined();
  });

  it("limits the description to 500 characters", function () {
    expect(validateTaskForm({ ...validValues, description: "a".repeat(501) }).description).toBeDefined();
  });

  it("requires an assignee", function () {
    expect(validateTaskForm({ ...validValues, assignee: "" }).assignee).toBe("Assignee is required.");
  });

  it("rejects an unknown status", function () {
    expect(validateTaskForm({ ...validValues, status: "Archived" }).status).toBeDefined();
  });

  it("lists errors in on-screen field order so the first key is the first bad field", function () {
    const errors = validateTaskForm({ ...validValues, title: "", assignee: "" });
    expect(Object.keys(errors)).toEqual(["title", "assignee"]);
  });
});

describe("hasErrors", function () {
  it("is true only when there is at least one error", function () {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ title: "Title is required." })).toBe(true);
  });
});

describe("parseTags and tagsToText", function () {
  it("trims, drops blanks, and removes duplicates ignoring case", function () {
    expect(parseTags("bug, ui ,, Bug,  ")).toEqual(["bug", "ui"]);
  });

  it("returns an empty array for an empty string", function () {
    expect(parseTags("")).toEqual([]);
  });

  it("joins tags back into comma separated text", function () {
    expect(tagsToText(["bug", "ui"])).toBe("bug, ui");
  });
});
