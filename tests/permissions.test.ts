import { describe, it, expect } from "vitest";
import { listPermissions, listUserRoles, getUserRole, setUserRole, removeUserRole, hasPermission, permissionsForRole } from "@/lib/permissions";

describe("permissions", () => {
  it("lists permissions", () => {
    const perms = listPermissions();
    expect(perms.length).toBeGreaterThanOrEqual(10);
  });

  it("lists user roles", () => {
    const roles = listUserRoles();
    expect(roles.length).toBeGreaterThanOrEqual(4);
  });

  it("gets user role", () => {
    const ur = getUserRole("Max");
    expect(ur).toBeTruthy();
    expect(ur!.role).toBe("admin");
  });

  it("case-insensitive user lookup", () => {
    expect(getUserRole("max")).toBeTruthy();
    expect(getUserRole("MAX")).toBeTruthy();
  });

  it("sets user role", () => {
    const ur = setUserRole("NewUser", "member");
    expect(ur.role).toBe("member");
  });

  it("updates existing user role", () => {
    setUserRole("ChangeMe", "viewer");
    const updated = setUserRole("ChangeMe", "manager");
    expect(updated.role).toBe("manager");
  });

  it("removes user role", () => {
    setUserRole("RemoveMe", "viewer");
    expect(removeUserRole("RemoveMe")).toBe(true);
    expect(getUserRole("RemoveMe")).toBeNull();
  });

  it("checks permission correctly", () => {
    expect(hasPermission("Max", "project.create")).toBe(true);
    expect(hasPermission("Max", "project.delete")).toBe(true);
    expect(hasPermission("Bob", "project.delete")).toBe(false);
    expect(hasPermission("Charlie", "report.view")).toBe(true);
    expect(hasPermission("Charlie", "issue.create")).toBe(false);
  });

  it("returns permissions for role", () => {
    const adminPerms = permissionsForRole("admin");
    expect(adminPerms.length).toBeGreaterThan(0);
    const viewerPerms = permissionsForRole("viewer");
    expect(viewerPerms.length).toBeLessThan(adminPerms.length);
  });
});
