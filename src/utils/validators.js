import { DESCRIPTION_MAX_LENGTH, PRIORITIES, STATUSES, TITLE_MAX_LENGTH } from "./constants";

export function validateTaskForm(values) {
  const errors = {};
  const title = values.title.trim();
  const description = values.description.trim();

  if (title === "") {
    errors.title = "Title is required.";
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  }

  // The selects only offer valid values, but this protects against edited HTML.
  if (!STATUSES.includes(values.status)) {
    errors.status = "Choose a valid status.";
  }

  if (!PRIORITIES.includes(values.priority)) {
    errors.priority = "Choose a valid priority.";
  }

  if (values.assignee.trim() === "") {
    errors.assignee = "Assignee is required.";
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

// "bug, UI,, bug " -> ["bug", "UI"]. Blank pieces are dropped, and duplicates are
// removed ignoring case (the first spelling wins).
export function parseTags(text) {
  const seenKeys = [];
  const tags = [];

  text.split(",").forEach(function (piece) {
    const tag = piece.trim();
    if (tag === "") {
      return;
    }
    const key = tag.toLowerCase();
    if (!seenKeys.includes(key)) {
      seenKeys.push(key);
      tags.push(tag);
    }
  });

  return tags;
}

// The opposite direction, used to fill the tags input when editing a task.
export function tagsToText(tags) {
  return tags.join(", ");
}
