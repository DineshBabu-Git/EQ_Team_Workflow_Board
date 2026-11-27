import { describe, expect, it } from "vitest";
import { buildSearchParams, parseFilters } from "../utils/filterParams";

const defaults = { statuses: [], priority: "", searchText: "", sortField: "updated", sortDirection: "desc" };

describe("parseFilters", function () {
  it("returns the defaults for an empty URL", function () {
    expect(parseFilters(new URLSearchParams(""))).toEqual(defaults);
  });

  it("reads every filter from the URL", function () {
    const params = new URLSearchParams("status=Backlog&status=In+Progress&priority=High&q=login+bug&sort=priority&dir=asc");
    expect(parseFilters(params)).toEqual({
      statuses: ["Backlog", "In Progress"],
      priority: "High",
      searchText: "login bug",
      sortField: "priority",
      sortDirection: "asc",
    });
  });

  it("falls back to defaults for invalid values", function () {
    const params = new URLSearchParams("status=Nope&priority=Urgent&sort=banana&dir=sideways");
    expect(parseFilters(params)).toEqual(defaults);
  });

  it("keeps the valid parts of a partly valid URL", function () {
    const params = new URLSearchParams("status=Nope&status=Done&priority=Urgent");
    expect(parseFilters(params).statuses).toEqual(["Done"]);
    expect(parseFilters(params).priority).toBe("");
  });

  it("removes duplicate statuses and uses the standard order", function () {
    const params = new URLSearchParams("status=Done&status=Backlog&status=Done");
    expect(parseFilters(params).statuses).toEqual(["Backlog", "Done"]);
  });
});

describe("buildSearchParams", function () {
  it("writes nothing for default filters", function () {
    expect(buildSearchParams(defaults).toString()).toBe("");
  });

  it("writes only the values that differ from the defaults", function () {
    const filters = { ...defaults, priority: "High", sortDirection: "asc" };
    expect(buildSearchParams(filters).toString()).toBe("priority=High&dir=asc");
  });

  it("does not write a search that is only spaces", function () {
    expect(buildSearchParams({ ...defaults, searchText: "   " }).toString()).toBe("");
  });

  it("keeps the search text exactly as typed, including a trailing space", function () {
    const params = buildSearchParams({ ...defaults, searchText: "login " });
    expect(params.get("q")).toBe("login ");
  });

  it("round-trips: parsing what was built gives the same filters back", function () {
    const filters = {
      statuses: ["Backlog", "In Progress"],
      priority: "High",
      searchText: "login bug",
      sortField: "priority",
      sortDirection: "asc",
    };
    expect(parseFilters(buildSearchParams(filters))).toEqual(filters);
  });
});
