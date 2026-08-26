import { NextResponse } from "next/server";
import { getPrefs, updatePref, muteAll, unmuteAll, listEvents } from "@/lib/notification-prefs";

const USER_ID = "user-max";

export async function GET() {
  return NextResponse.json({
    prefs: getPrefs(USER_ID),
    available_events: listEvents(),
  });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "mute_all") {
    muteAll(USER_ID);
    return NextResponse.json({ ok: true, prefs: getPrefs(USER_ID) });
  }

  if (body.action === "unmute_all") {
    unmuteAll(USER_ID);
    return NextResponse.json({ ok: true, prefs: getPrefs(USER_ID) });
  }

  if (!body.event) {
    return NextResponse.json({ error: "event required" }, { status: 400 });
  }

  const pref = updatePref(
    USER_ID,
    body.event,
    body.channels || ["in_app"],
    body.enabled !== false
  );
  return NextResponse.json({ pref });
}
