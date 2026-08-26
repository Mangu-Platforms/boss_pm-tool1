import { describe, it, expect } from "vitest";
import { listReleases, getRelease, createRelease, updateRelease, upcomingReleases, deleteRelease } from "../lib/release-calendar";

describe("release-calendar", () => {
  it("lists all releases sorted by date", () => {
    const releases = listReleases();
    expect(releases.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < releases.length; i++) {
      expect(releases[i - 1].planned_date <= releases[i].planned_date).toBe(true);
    }
  });

  it("filters by status", () => {
    const released = listReleases("released");
    expect(released.every((r) => r.status === "released")).toBe(true);
  });

  it("gets release by id", () => {
    const r = getRelease("calrel-1");
    expect(r).not.toBeNull();
    expect(r!.version).toBe("2.0.0");
  });

  it("creates a release", () => {
    const r = createRelease("4.0.0", "Next Gen", "major", "2025-12-01", "max");
    expect(r.status).toBe("planned");
    expect(r.features).toHaveLength(0);
  });

  it("updates release", () => {
    const r = updateRelease("calrel-2", { status: "released", actual_date: "2025-04-14" });
    expect(r).not.toBeNull();
    expect(r!.status).toBe("released");
    expect(r!.actual_date).toBe("2025-04-14");
  });

  it("gets upcoming releases", () => {
    const upcoming = upcomingReleases(365);
    expect(Array.isArray(upcoming)).toBe(true);
  });

  it("deletes release", () => {
    const r = createRelease("9.0.0", "Del", "patch", "2025-12-31", "max");
    expect(deleteRelease(r.id)).toBe(true);
    expect(getRelease(r.id)).toBeNull();
  });
});
