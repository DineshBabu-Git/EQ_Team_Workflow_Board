// Single source of truth for values used in many places.
// If a status or priority name changes, we only edit it here.

export const STATUSES = ["Backlog", "In Progress", "Done"];
export const PRIORITIES = ["Low", "Medium", "High"];

// Used when sorting by priority (higher number = more important)
export const PRIORITY_RANK = {
  Low: 1,
  Medium: 2,
  High: 3,
};

export const DEFAULT_STATUS = "Backlog";
export const DEFAULT_PRIORITY = "Medium";
export const DEFAULT_ASSIGNEE = "Unassigned";

// Form validation limits
export const TITLE_MAX_LENGTH = 80;
export const DESCRIPTION_MAX_LENGTH = 500;

// Storage
export const STORAGE_KEY = "team-workflow-board";
export const CURRENT_SCHEMA_VERSION = 2;

// Sorting and filtering options (these also appear in the URL)
export const SORT_FIELDS = ["created", "updated", "priority"];
export const SORT_DIRECTIONS = ["asc", "desc"];
export const DEFAULT_SORT_FIELD = "updated";
export const DEFAULT_SORT_DIRECTION = "desc";
