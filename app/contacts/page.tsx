"use client";

import { useEffect, useState } from "react";

type Contact = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  phone: string;
  notes: string;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  function loadContacts() {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/contacts${params}`)
      .then((r) => r.json())
      .then((data) => setContacts(data.contacts || []));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), role, company, phone, notes }),
    });
    setName("");
    setEmail("");
    setRole("");
    setCompany("");
    setPhone("");
    setNotes("");
    loadContacts();
  }

  async function handleDelete(id: string) {
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <main>
      <div className="kicker">People</div>
      <h1>Contacts</h1>
      <p className="lede">Stakeholders, partners, and key contacts for your projects.</p>

      <div className="ct-search">
        <input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadContacts()}
        />
        <button className="subtle-btn" onClick={loadContacts}>Search</button>
      </div>

      <div className="ct-list">
        {contacts.map((ct) => (
          <div key={ct.id} className="ct-card">
            <div className="ct-header">
              <span className="ct-name">{ct.name}</span>
              {ct.company && <span className="ct-company">{ct.company}</span>}
            </div>
            <div className="ct-details">
              <span className="hint">{ct.email}</span>
              {ct.role && <span className="hint">{ct.role}</span>}
              {ct.phone && <span className="mono hint">{ct.phone}</span>}
            </div>
            {ct.notes && <p className="ct-notes">{ct.notes}</p>}
            <button className="subtle-btn" onClick={() => handleDelete(ct.id)}>Delete</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Add Contact</h2>
      <form className="ct-form" onSubmit={handleCreate}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
        <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        <button className="go" type="submit" disabled={!name.trim() || !email.trim()}>Add</button>
      </form>
    </main>
  );
}
