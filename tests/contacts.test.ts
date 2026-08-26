import { describe, it, expect } from "vitest";
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from "@/lib/contacts";

describe("contacts", () => {
  it("lists seed contacts", () => {
    const cts = listContacts();
    expect(cts.length).toBeGreaterThanOrEqual(3);
  });

  it("searches contacts", () => {
    const cts = listContacts("acme");
    expect(cts.length).toBeGreaterThanOrEqual(1);
    expect(cts[0].company).toBe("Acme Corp");
  });

  it("gets contact by id", () => {
    const ct = getContact("ct-1");
    expect(ct).not.toBeNull();
    expect(ct!.name).toBe("Sarah Chen");
  });

  it("creates a contact", () => {
    const ct = createContact("Test User", "test@test.com", "Dev", "TestCo", "", "");
    expect(ct.name).toBe("Test User");
    expect(ct.email).toBe("test@test.com");
  });

  it("updates a contact", () => {
    const ct = createContact("Update Me", "upd@test.com", "", "", "", "");
    const updated = updateContact(ct.id, { role: "Lead", company: "NewCo" });
    expect(updated).not.toBeNull();
    expect(updated!.role).toBe("Lead");
    expect(updated!.company).toBe("NewCo");
  });

  it("deletes a contact", () => {
    const ct = createContact("Del Me", "del@test.com", "", "", "", "");
    expect(deleteContact(ct.id)).toBe(true);
    expect(deleteContact(ct.id)).toBe(false);
  });
});
