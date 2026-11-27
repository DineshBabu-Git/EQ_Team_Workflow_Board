import { CURRENT_SCHEMA_VERSION } from "./constants";

// Sample data for demos and manual testing. Only the dev tools panel uses it.
// `now` is a parameter so tests do not depend on the clock.

const ONE_HOUR_MS = 60 * 60 * 1000;

// The OLD (version 1) shape: a bare array, a done flag and a numeric timestamp.
// Loading this runs the v1 to v2 migration.
export function createV1SampleData(now = Date.now()) {
  return [
    { id: "old-1", title: "Buy coffee for the office", done: false, createdAt: now - 5 * ONE_HOUR_MS },
    { id: "old-2", title: "Pay the hosting invoice", done: true, createdAt: now - 48 * ONE_HOUR_MS },
    { id: "old-3", title: "Book team lunch", done: false, createdAt: now - 26 * ONE_HOUR_MS },
    { id: "old-4", title: "Renew the domain", done: true, createdAt: now - 100 * ONE_HOUR_MS },
  ];
}

// The CURRENT shape, with tasks in every column, priority and age. No migration happens.
export function createV2SampleData(now = new Date()) {
  function hoursAgo(hours) {
    return new Date(now.getTime() - hours * ONE_HOUR_MS).toISOString();
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    tasks: [
      { id: "demo-1", title: "Fix login bug", description: "Users cannot sign in with a saved password.", status: "In Progress", priority: "High", assignee: "Sam", tags: ["bug", "auth"], createdAt: hoursAgo(50), updatedAt: hoursAgo(3) },
      { id: "demo-2", title: "Write onboarding docs", description: "Cover the first week for new hires.", status: "Backlog", priority: "Low", assignee: "Alex", tags: [], createdAt: hoursAgo(30), updatedAt: hoursAgo(30) },
      { id: "demo-3", title: "Design the board layout", description: "", status: "Done", priority: "Medium", assignee: "Priya", tags: ["design"], createdAt: hoursAgo(100), updatedAt: hoursAgo(2) },
      { id: "demo-4", title: "Set up CI", description: "Run lint and tests on every pull request.", status: "Backlog", priority: "Medium", assignee: "Sam", tags: ["devops"], createdAt: hoursAgo(10), updatedAt: hoursAgo(10) },
    ],
  };
}
