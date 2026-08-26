import { describe, it, expect } from "vitest";
import { listRoles, getRole, createRole, updateRole, deleteRole, hasPermission } from "@/lib/roles";

describe("roles", () => {
  it("lists seed roles", () => {
    const roles = listRoles();
    expect(roles.length).toBeGreaterThanOrEqual(4);
  });

  it("gets role by id", () => {
    const role = getRole("role-1");
    expect(role).not.toBeNull();
    expect(role!.name).toBe("Admin");
  });

  it("creates a role", () => {
    const role = createRole("Custom", "test", ["issues:read"]);
    expect(role.is_system).toBe(false);
    expect(role.permissions).toContain("issues:read");
  });

  it("updates a custom role", () => {
    const role = createRole("Updatable", "", []);
    const updated = updateRole(role.id, { name: "Updated", permissions: ["issues:write"] });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe("Updated");
  });

  it("cannot update system role", () => {
    expect(updateRole("role-1", { name: "Hacked" })).toBeNull();
  });

  it("cannot delete system role", () => {
    expect(deleteRole("role-1")).toBe(false);
  });

  it("deletes custom role", () => {
    const role = createRole("Del Test", "", []);
    expect(deleteRole(role.id)).toBe(true);
    expect(deleteRole(role.id)).toBe(false);
  });

  it("admin has all permissions", () => {
    expect(hasPermission("role-1", "issues:write")).toBe(true);
    expect(hasPermission("role-1", "settings:write")).toBe(true);
  });

  it("viewer cannot write", () => {
    expect(hasPermission("role-4", "issues:write")).toBe(false);
    expect(hasPermission("role-4", "issues:read")).toBe(true);
  });
});
