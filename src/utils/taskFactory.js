import createId from "./createId";

// Trims the text fields and tags must be an array.

export function cleanTaskFields(fields) {
  return {
    title: fields.title.trim(),
    description: (fields.description || "").trim(),
    status: fields.status,
    priority: fields.priority,
    assignee: fields.assignee.trim(),
    tags: fields.tags || [],
  };
}

// Builds a complete new task. `now` is a parameter so tests can use a fixed time.
export function createTask(fields, now = new Date()) {
  const timestamp = now.toISOString();

  return {
    id: createId(),
    ...cleanTaskFields(fields),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
