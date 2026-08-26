import { NextResponse } from "next/server";
import { listRoles, getRole, createRole, updateRole, deleteRole, hasPermission } from "@/lib/roles";
import type { Permission } from "@/lib/roles";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const checkPerm = url.searchParams.get("check_permission");

  if (id && checkPerm) {
    return NextResponse.json({ has_permission: hasPermission(id, checkPerm as Permission) });
  }

  if (id) {
    const role = getRole(id);
    if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ role });
  }

  return NextResponse.json({ roles: listRoles() });
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteRole(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found or system role" }, { status: 400 });
  }

  if (body.action === "update") {
    const role = updateRole(body.id, body.updates || {});
    return role ? NextResponse.json({ role }) : NextResponse.json({ error: "Not found or system role" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const role = createRole(body.name, body.description || "", body.permissions || []);
  return NextResponse.json({ role }, { status: 201 });
}
