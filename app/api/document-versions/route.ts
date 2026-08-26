import { NextRequest, NextResponse } from "next/server";
import { versionsForDocument, getVersion, latestVersion, createVersion, compareVersions, documentList } from "@/lib/document-versions";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const v = getVersion(id);
    return v ? NextResponse.json(v) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("list") !== null) {
    return NextResponse.json(documentList());
  }
  const documentId = req.nextUrl.searchParams.get("document_id");
  if (documentId) {
    if (req.nextUrl.searchParams.get("latest") !== null) {
      const v = latestVersion(documentId);
      return v ? NextResponse.json(v) : NextResponse.json({ error: "no versions" }, { status: 404 });
    }
    return NextResponse.json(versionsForDocument(documentId));
  }
  if (req.nextUrl.searchParams.get("compare") !== null) {
    const id1 = req.nextUrl.searchParams.get("id1");
    const id2 = req.nextUrl.searchParams.get("id2");
    if (id1 && id2) return NextResponse.json(compareVersions(id1, id2));
  }
  return NextResponse.json(documentList());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const v = createVersion(body.document_id, body.title, body.content, body.author || "max", body.change_summary || "");
  return NextResponse.json(v, { status: 201 });
}
