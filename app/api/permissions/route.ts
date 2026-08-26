import { NextResponse } from "next/server";
import { listPermissions, listUserRoles, getUserRole, setUserRole, removeUserRole, hasPermission, permissionsForRole } from "@/lib/permissions";
import type { Role } from "@/lib/permissions";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const user = url.searchParams.get("user");
  const role = url.searchParams.get("role") as Role | null;
  const action = url.searchParams.get("action");

  if (user && action) {
    return NextResponse.json({ user, action, allowed: hasPermission(user, action) });
  }

  if (user) {
    const ur = getUserRole(user);
    return ur
      ? NextResponse.json({ user_role: ur })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (role) {
    return NextResponse.json({ role, permissions: permissionsForRole(role) });
  }

  return NextResponse.json({ permissions: listPermissions(), user_roles: listUserRoles() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "remove") {
    return removeUserRole(body.user)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.user?.trim()) {
    return NextResponse.json({ error: "user required" }, { status: 400 });
  }

  const validRoles: Role[] = ["admin", "manager", "member", "viewer"];
  if (!validRoles.includes(body.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const ur = setUserRole(body.user, body.role);
  return NextResponse.json({ user_role: ur });
}
