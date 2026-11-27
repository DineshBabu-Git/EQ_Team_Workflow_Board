import { DEFAULT_SORT_DIRECTION, DEFAULT_SORT_FIELD, PRIORITIES, SORT_DIRECTIONS, SORT_FIELDS, STATUSES } from "./constants";

// Two pure functions that convert between the URL and a "filters" object:
//   ?status=Backlog&status=Done&priority=High&q=login&sort=priority&dir=asc
//   { statuses, priority, searchText, sortField, sortDirection }
// The filters object has exactly the shape filterAndSortTasks expects.

// Reads the URL. Anything invalid is ignored and replaced by the default, so a broken
// or hand-edited link can never crash the board.
export function parseFilters(searchParams) {
  const statusesInUrl = searchParams.getAll("status");
  // Filtering STATUSES (instead of the URL values) drops unknown names, removes
  // duplicates and gives a stable order in one step.
  const statuses = STATUSES.filter(function (status) {
    return statusesInUrl.includes(status);
  });

  const priorityInUrl = searchParams.get("priority");
  const priority = PRIORITIES.includes(priorityInUrl) ? priorityInUrl : "";

  const sortInUrl = searchParams.get("sort");
  const sortField = SORT_FIELDS.includes(sortInUrl) ? sortInUrl : DEFAULT_SORT_FIELD;

  const directionInUrl = searchParams.get("dir");
  const sortDirection = SORT_DIRECTIONS.includes(directionInUrl) ? directionInUrl : DEFAULT_SORT_DIRECTION;

  return { statuses, priority, searchText: searchParams.get("q") || "", sortField, sortDirection };
}

// Writes the URL. Values that are the default are left out, so a clean board has a clean URL.
// The search text is stored exactly as typed (not trimmed), because the search box is
// refilled from the URL and trimming would eat the space in "login bug" while typing.
export function buildSearchParams(filters) {
  const params = new URLSearchParams();

  filters.statuses.forEach(function (status) {
    params.append("status", status);
  });
  if (filters.priority !== "") {
    params.set("priority", filters.priority);
  }
  if (filters.searchText.trim() !== "") {
    params.set("q", filters.searchText);
  }
  if (filters.sortField !== DEFAULT_SORT_FIELD) {
    params.set("sort", filters.sortField);
  }
  if (filters.sortDirection !== DEFAULT_SORT_DIRECTION) {
    params.set("dir", filters.sortDirection);
  }

  return params;
}
