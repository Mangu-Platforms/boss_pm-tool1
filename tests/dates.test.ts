import { describe, it, expect, vi, afterEach } from "vitest";
import { dueLabel } from "@/lib/dates";

afterEach(() => {
  vi.useRealTimers();
});

describe("dueLabel", () => {
  it("returns none for null", () => {
    const result = dueLabel(null);
    expect(result.urgency).toBe("none");
    expect(result.text).toBe("—");
  });

  it("marks overdue dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-25T12:00:00Z"));
    const result = dueLabel("2026-08-20");
    expect(result.urgency).toBe("overdue");
    expect(result.text).toContain("overdue");
    vi.useRealTimers();
  });

  it("marks today as soon", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-25T12:00:00Z"));
    const result = dueLabel("2026-08-25");
    expect(result.urgency).toBe("soon");
    expect(result.text).toBe("due today");
    vi.useRealTimers();
  });

  it("marks 2 days out as soon", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-25T12:00:00Z"));
    const result = dueLabel("2026-08-27");
    expect(result.urgency).toBe("soon");
    expect(result.text).toContain("left");
    vi.useRealTimers();
  });

  it("marks far future as normal", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-25T12:00:00Z"));
    const result = dueLabel("2026-09-15");
    expect(result.urgency).toBe("normal");
    vi.useRealTimers();
  });
});
