export type Contact = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  phone: string;
  notes: string;
  created_at: string;
};

const contacts: Contact[] = [
  { id: "ct-1", name: "Sarah Chen", email: "sarah@acme.com", role: "Product Lead", company: "Acme Corp", phone: "+1-555-0101", notes: "Primary stakeholder for the Q2 launch", created_at: "2025-01-10T00:00:00.000Z" },
  { id: "ct-2", name: "James Park", email: "james@initech.com", role: "Engineering Manager", company: "Initech", phone: "+1-555-0202", notes: "Integration partner", created_at: "2025-02-15T00:00:00.000Z" },
  { id: "ct-3", name: "Maria Gonzalez", email: "maria@globex.com", role: "VP Engineering", company: "Globex", phone: "+1-555-0303", notes: "Enterprise pilot customer", created_at: "2025-03-01T00:00:00.000Z" },
];

export function listContacts(search?: string): Contact[] {
  let items = [...contacts];
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((c) =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)
    );
  }
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export function getContact(id: string): Contact | null {
  return contacts.find((c) => c.id === id) || null;
}

export function createContact(name: string, email: string, role: string, company: string, phone: string, notes: string): Contact {
  const ct: Contact = {
    id: `ct-${crypto.randomUUID().slice(0, 8)}`,
    name,
    email,
    role,
    company,
    phone,
    notes,
    created_at: new Date().toISOString(),
  };
  contacts.push(ct);
  return ct;
}

export function updateContact(id: string, updates: Partial<Pick<Contact, "name" | "email" | "role" | "company" | "phone" | "notes">>): Contact | null {
  const ct = contacts.find((c) => c.id === id);
  if (!ct) return null;
  if (updates.name !== undefined) ct.name = updates.name;
  if (updates.email !== undefined) ct.email = updates.email;
  if (updates.role !== undefined) ct.role = updates.role;
  if (updates.company !== undefined) ct.company = updates.company;
  if (updates.phone !== undefined) ct.phone = updates.phone;
  if (updates.notes !== undefined) ct.notes = updates.notes;
  return ct;
}

export function deleteContact(id: string): boolean {
  const idx = contacts.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  contacts.splice(idx, 1);
  return true;
}
