import { CURRENT_SCHEMA_VERSION } from "./constants";
import createId from "./createId";

// Bad or missing timestamps fall back to "now" instead of crashing the whole load.
function toIsoString(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

// Version 1 task: { id, title, done: boolean, createdAt: number }
// Version 2 task: the full shape (status, priority, assignee, tags, ISO dates, ...)
// The values below are written out as plain strings on purpose. A migration describes
// the v2 shape as it was at this moment, so it must not change if a constant is renamed later.
export function migrateV1toV2(oldTasks) {
  return oldTasks.map(function (oldTask) {
    const createdAt = toIsoString(oldTask.createdAt);

    return {
      id: oldTask.id || createId(),
      title: oldTask.title || "Untitled task",
      description: "",
      status: oldTask.done ? "Done" : "Backlog",
      priority: "Medium",
      assignee: "Unassigned",
      tags: [],
      createdAt,
      updatedAt: createdAt,
    };
  });
}

// Takes whatever JSON.parse gave us and returns { tasks, migrated }.
// Throws for shapes we do not recognize; storage.js turns that into a friendly error.
export function migrateStoredData(storedData) {
  // Version 1 was saved as a bare array.
  if (Array.isArray(storedData)) {
    return { tasks: migrateV1toV2(storedData), migrated: true };
  }

  const isObjectWithTasks = storedData !== null && typeof storedData === "object" && Array.isArray(storedData.tasks);

  if (isObjectWithTasks) {
    const version = storedData.schemaVersion;

    if (version === CURRENT_SCHEMA_VERSION) {
      return { tasks: storedData.tasks, migrated: false };
    }
    if (version === undefined || version === 1) {
      return { tasks: migrateV1toV2(storedData.tasks), migrated: true };
    }
  }

  // This includes data saved by a NEWER version of the app. Refusing is safer than guessing.
  throw new Error("Unrecognized storage format");
}
