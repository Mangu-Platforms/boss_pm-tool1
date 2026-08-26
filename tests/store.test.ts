import { describe, it, expect, beforeEach } from "vitest";
import {
  listProducts,
  getProduct,
  listIssues,
  createIssue,
  validateCreate,
  upsertLinks,
  listLinks,
  mirrorStatusFromGithub,
} from "@/lib/store";
import type { CreateIssueInput } from "@/lib/types";

beforeEach(() => {
  const g = globalThis as typeof globalThis & { __boss?: unknown };
  delete g.__boss;
});

describe("listProducts", () => {
  it("returns seeded products sorted by name", () => {
    const products = listProducts();
    expect(products.length).toBeGreaterThanOrEqual(11);
    for (let i = 1; i < products.length; i++) {
      expect(products[i - 1].name.localeCompare(products[i].name)).toBeLessThanOrEqual(0);
    }
  });
});

describe("getProduct", () => {
  it("finds by slug", () => {
    const p = getProduct("my_publishing");
    expect(p).toBeDefined();
    expect(p!.name).toBe("Mangu Publishing");
  });

  it("finds by id", () => {
    const p = getProduct("p-pub");
    expect(p).toBeDefined();
    expect(p!.slug).toBe("my_publishing");
  });

  it("returns undefined for missing", () => {
    expect(getProduct("nonexistent")).toBeUndefined();
  });
});

describe("listIssues", () => {
  it("lists all issues when no filter", () => {
    const issues = listIssues();
    expect(issues.length).toBeGreaterThanOrEqual(5);
  });

  it("filters by product_id", () => {
    const issues = listIssues("p-pub");
    expect(issues.length).toBeGreaterThanOrEqual(2);
    for (const i of issues) {
      expect(i.product_id).toBe("p-pub");
    }
  });

  it("returns newest first", () => {
    const issues = listIssues();
    for (let i = 1; i < issues.length; i++) {
      expect(issues[i - 1].created_at >= issues[i].created_at).toBe(true);
    }
  });
});

describe("validateCreate", () => {
  it("rejects empty title", () => {
    const input: CreateIssueInput = {
      product_id: "p-pub",
      title: "",
      assignee_kind: "user",
      assignee_user: "operator",
    };
    expect(validateCreate(input)).toBe("title required");
  });

  it("rejects missing product_id", () => {
    const input: CreateIssueInput = {
      product_id: "",
      title: "test",
      assignee_kind: "user",
      assignee_user: "operator",
    };
    expect(validateCreate(input)).toBe("product_id required");
  });

  it("rejects unknown product", () => {
    const input: CreateIssueInput = {
      product_id: "nonexistent",
      title: "test",
      assignee_kind: "user",
      assignee_user: "operator",
    };
    expect(validateCreate(input)).toBe("unknown product");
  });

  it("rejects agent without cost_cap_cents", () => {
    const input: CreateIssueInput = {
      product_id: "p-pub",
      title: "test agent",
      assignee_kind: "agent",
      agent_name: "alice",
      cost_cap_cents: undefined,
    };
    expect(validateCreate(input)).toBe("cost_cap_cents required for agent");
  });

  it("rejects agent without agent_name", () => {
    const input: CreateIssueInput = {
      product_id: "p-pub",
      title: "test agent",
      assignee_kind: "agent",
      agent_name: undefined,
      cost_cap_cents: 200,
    };
    expect(validateCreate(input)).toBe("agent_name required");
  });

  it("rejects negative cost cap", () => {
    const input: CreateIssueInput = {
      product_id: "p-pub",
      title: "test",
      assignee_kind: "agent",
      agent_name: "alice",
      cost_cap_cents: -100,
    };
    expect(validateCreate(input)).toBe("cost cap cannot be negative");
  });

  it("rejects user without assignee_user", () => {
    const input: CreateIssueInput = {
      product_id: "p-pub",
      title: "test",
      assignee_kind: "user",
      assignee_user: "",
    };
    expect(validateCreate(input)).toBe("assignee_user required");
  });

  it("passes valid user assignment", () => {
    const input: CreateIssueInput = {
      product_id: "p-pub",
      title: "valid issue",
      assignee_kind: "user",
      assignee_user: "operator",
    };
    expect(validateCreate(input)).toBeNull();
  });

  it("passes valid agent assignment with cost cap", () => {
    const input: CreateIssueInput = {
      product_id: "p-pub",
      title: "valid agent",
      assignee_kind: "agent",
      agent_name: "alice",
      cost_cap_cents: 500,
    };
    expect(validateCreate(input)).toBeNull();
  });
});

describe("createIssue", () => {
  it("creates a user-assigned issue", () => {
    const issue = createIssue({
      product_id: "p-pub",
      title: "New feature",
      assignee_kind: "user",
      assignee_user: "operator",
    });
    expect(issue.id).toBeDefined();
    expect(issue.title).toBe("New feature");
    expect(issue.assignee_kind).toBe("user");
    expect(issue.assignee_user).toBe("operator");
    expect(issue.agent_name).toBeNull();
    expect(issue.cost_cap_cents).toBeNull();
    expect(issue.status).toBe("open");
  });

  it("creates an agent-assigned issue with cost cap", () => {
    const issue = createIssue({
      product_id: "p-alice",
      title: "Agent task",
      assignee_kind: "agent",
      agent_name: "swarm",
      cost_cap_cents: 350,
    });
    expect(issue.assignee_kind).toBe("agent");
    expect(issue.agent_name).toBe("swarm");
    expect(issue.cost_cap_cents).toBe(350);
  });

  it("throws on invalid input", () => {
    expect(() =>
      createIssue({
        product_id: "p-pub",
        title: "",
        assignee_kind: "user",
        assignee_user: "operator",
      })
    ).toThrow("title required");
  });

  it("created issue appears in listIssues", () => {
    const before = listIssues().length;
    createIssue({
      product_id: "p-pub",
      title: "appears in list",
      assignee_kind: "user",
      assignee_user: "dev",
    });
    expect(listIssues().length).toBe(before + 1);
  });
});

describe("upsertLinks and listLinks", () => {
  it("inserts new links", () => {
    upsertLinks([
      {
        id: "link-1",
        issue_id: null,
        product_id: "p-pub",
        github_owner: "Mangu-Platforms",
        github_repo: "my_publishing",
        github_issue_number: 1,
        github_issue_id: "100",
        github_state: "open",
        github_title: "Test issue",
        github_html_url: "https://github.com/Mangu-Platforms/my_publishing/issues/1",
        synced_at: new Date().toISOString(),
      },
    ]);
    const links = listLinks("p-pub");
    expect(links.length).toBe(1);
    expect(links[0].github_title).toBe("Test issue");
  });

  it("updates existing links", () => {
    upsertLinks([
      {
        id: "link-1",
        issue_id: null,
        product_id: "p-pub",
        github_owner: "Mangu-Platforms",
        github_repo: "my_publishing",
        github_issue_number: 1,
        github_issue_id: "100",
        github_state: "open",
        github_title: "Original",
        github_html_url: "https://github.com/Mangu-Platforms/my_publishing/issues/1",
        synced_at: new Date().toISOString(),
      },
    ]);
    upsertLinks([
      {
        id: "link-1",
        issue_id: null,
        product_id: "p-pub",
        github_owner: "Mangu-Platforms",
        github_repo: "my_publishing",
        github_issue_number: 1,
        github_issue_id: "100",
        github_state: "closed",
        github_title: "Updated",
        github_html_url: "https://github.com/Mangu-Platforms/my_publishing/issues/1",
        synced_at: new Date().toISOString(),
      },
    ]);
    const links = listLinks("p-pub");
    expect(links.length).toBe(1);
    expect(links[0].github_state).toBe("closed");
  });
});

describe("mirrorStatusFromGithub", () => {
  it("mirrors closed state to done", () => {
    const issue = createIssue({
      product_id: "p-pub",
      title: "Mirror test",
      assignee_kind: "user",
      assignee_user: "dev",
    });
    upsertLinks([
      {
        id: "mirror-link",
        issue_id: issue.id,
        product_id: "p-pub",
        github_owner: "Mangu-Platforms",
        github_repo: "my_publishing",
        github_issue_number: 99,
        github_issue_id: "999",
        github_state: "closed",
        github_title: "Mirror test",
        github_html_url: "https://github.com/Mangu-Platforms/my_publishing/issues/99",
        synced_at: new Date().toISOString(),
      },
    ]);
    const count = mirrorStatusFromGithub();
    expect(count).toBeGreaterThanOrEqual(1);
    const issues = listIssues("p-pub");
    const found = issues.find((i) => i.id === issue.id);
    expect(found!.status).toBe("done");
  });
});
