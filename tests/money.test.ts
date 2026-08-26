import { describe, it, expect } from "vitest";
import { formatCap } from "@/lib/money";

describe("formatCap", () => {
  it("formats cents to dollars", () => {
    expect(formatCap(800)).toBe("$8.00");
    expect(formatCap(350)).toBe("$3.50");
    expect(formatCap(1)).toBe("$0.01");
    expect(formatCap(0)).toBe("$0.00");
  });

  it("returns dash for null/undefined", () => {
    expect(formatCap(null)).toBe("—");
    expect(formatCap(undefined)).toBe("—");
  });
});
