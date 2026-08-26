import { NextResponse } from "next/server";
import { listContacts, getContact, createContact, updateContact, deleteContact } from "@/lib/contacts";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const search = url.searchParams.get("search");

  if (id) {
    const ct = getContact(id);
    return ct ? NextResponse.json({ contact: ct }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ contacts: listContacts(search || undefined) });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteContact(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update") {
    const ct = updateContact(body.id, {
      name: body.name,
      email: body.email,
      role: body.role,
      company: body.company,
      phone: body.phone,
      notes: body.notes,
    });
    return ct ? NextResponse.json({ contact: ct }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "name and email required" }, { status: 400 });
  }

  const ct = createContact(
    body.name.trim(),
    body.email.trim(),
    body.role || "",
    body.company || "",
    body.phone || "",
    body.notes || ""
  );
  return NextResponse.json({ contact: ct }, { status: 201 });
}
