import { describe, expect, it } from "vitest";
import { getRelativeTime } from "../utils/relativeTime";

// A fixed "now" keeps these tests from depending on the real clock.
const now = new Date("2026-01-01T12:00:00.000Z");

describe("getRelativeTime", function () {
  it('says "just now" for under a minute, including slightly future dates', function () {
    expect(getRelativeTime("2026-01-01T11:59:50.000Z", now)).toBe("just now");
    expect(getRelativeTime("2026-01-01T12:00:30.000Z", now)).toBe("just now");
  });

  it("uses minutes, with correct singular and plural", function () {
    expect(getRelativeTime("2026-01-01T11:59:00.000Z", now)).toBe("1 minute ago");
    expect(getRelativeTime("2026-01-01T11:55:00.000Z", now)).toBe("5 minutes ago");
  });

  it("uses hours", function () {
    expect(getRelativeTime("2026-01-01T09:00:00.000Z", now)).toBe("3 hours ago");
  });

  it("uses days", function () {
    expect(getRelativeTime("2025-12-31T12:00:00.000Z", now)).toBe("1 day ago");
    expect(getRelativeTime("2025-12-30T12:00:00.000Z", now)).toBe("2 days ago");
  });

  it("uses months and years", function () {
    expect(getRelativeTime("2025-11-17T12:00:00.000Z", now)).toBe("1 month ago");
    expect(getRelativeTime("2024-01-01T12:00:00.000Z", now)).toBe("2 years ago");
  });

  it("handles an invalid date", function () {
    expect(getRelativeTime("garbage", now)).toBe("at an unknown time");
  });
});
