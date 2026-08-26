import { NextRequest, NextResponse } from "next/server";
import { listQueues, getQueue, createQueue, updateQueueStatus, enqueueJob, listJobs, deleteQueue, queueStats } from "@/lib/queue-manager";
import type { QueueStatus, JobStatus } from "@/lib/queue-manager";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const q = getQueue(id);
    return q ? NextResponse.json(q) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("stats") !== null) return NextResponse.json(queueStats());
  const jobsFor = req.nextUrl.searchParams.get("jobs");
  if (jobsFor) {
    const jobStatus = req.nextUrl.searchParams.get("job_status") as JobStatus | undefined;
    return NextResponse.json(listJobs(jobsFor, jobStatus || undefined));
  }
  const service_id = req.nextUrl.searchParams.get("service_id") || undefined;
  const status = req.nextUrl.searchParams.get("status") as QueueStatus | undefined;
  return NextResponse.json(listQueues(service_id, status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteQueue(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update_status") {
    const q = updateQueueStatus(body.id, body.status);
    return q ? NextResponse.json(q) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "enqueue") {
    const job = enqueueJob(body.queue_id, body.payload);
    return job ? NextResponse.json(job, { status: 201 }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const q = createQueue(body.name, body.service_id, body.max_concurrency || 5, body.retry_limit || 3);
  return NextResponse.json(q, { status: 201 });
}
