import { describe, it, expect } from "vitest";
import { swimlanedBoard, boardStats } from "../lib/kanban-swimlanes";

describe("kanban-swimlanes", () => {
  it("returns board with no swimlanes", () => {
    const board = swimlanedBoard("none");
    expect(board.criteria).toBe("none");
    expect(board.swimlanes).toHaveLength(1);
    expect(board.swimlanes[0].key).toBe("all");
  });

  it("groups by assignee", () => {
    const board = swimlanedBoard("assignee");
    expect(board.swimlanes.length).toBeGreaterThan(0);
    board.swimlanes.forEach((lane) => {
      expect(lane.columns.length).toBe(5);
    });
  });

  it("groups by priority", () => {
    const board = swimlanedBoard("priority");
    expect(board.swimlanes.length).toBeGreaterThan(0);
  });

  it("groups by product", () => {
    const board = swimlanedBoard("product");
    expect(board.swimlanes.length).toBeGreaterThan(0);
  });

  it("each swimlane has correct status columns", () => {
    const board = swimlanedBoard("assignee");
    const statuses = board.swimlanes[0].columns.map((c) => c.status);
    expect(statuses).toEqual(["backlog", "open", "doing", "done", "cancelled"]);
  });

  it("returns board stats", () => {
    const stats = boardStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.by_status).toBeDefined();
    expect(stats.by_assignee).toBeDefined();
  });
});
