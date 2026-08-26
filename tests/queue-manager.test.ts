import { describe, it, expect } from "vitest";
import { listQueues, getQueue, createQueue, updateQueueStatus, enqueueJob, listJobs, deleteQueue, queueStats } from "@/lib/queue-manager";

describe("queue-manager", () => {
  it("lists queues sorted by pending_jobs desc", () => {
    const all = listQueues();
    expect(all.length).toBeGreaterThanOrEqual(6);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].pending_jobs).toBeGreaterThanOrEqual(all[i].pending_jobs);
    }
  });

  it("filters by service_id", () => {
    const svc1 = listQueues("svc-1");
    expect(svc1.length).toBeGreaterThan(0);
    svc1.forEach((q) => expect(q.service_id).toBe("svc-1"));
  });

  it("filters by status", () => {
    const paused = listQueues(undefined, "paused");
    expect(paused.length).toBeGreaterThan(0);
    paused.forEach((q) => expect(q.status).toBe("paused"));
  });

  it("gets queue by id", () => {
    const q = getQueue("q-1");
    expect(q).not.toBeNull();
    expect(q!.name).toBe("email-notifications");
    expect(getQueue("q-9999")).toBeNull();
  });

  it("creates a queue", () => {
    const q = createQueue("test-queue", "svc-10", 8, 5);
    expect(q.id).toMatch(/^q-/);
    expect(q.status).toBe("idle");
    expect(q.max_concurrency).toBe(8);
    expect(q.pending_jobs).toBe(0);
    expect(getQueue(q.id)).not.toBeNull();
  });

  it("updates queue status", () => {
    const q = createQueue("status-test", "svc-10", 4, 3);
    const updated = updateQueueStatus(q.id, "active");
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe("active");
    expect(updateQueueStatus("q-9999", "paused")).toBeNull();
  });

  it("enqueues a job", () => {
    const q = createQueue("job-test", "svc-10", 4, 3);
    const before = q.pending_jobs;
    const job = enqueueJob(q.id, "test payload");
    expect(job).not.toBeNull();
    expect(job!.status).toBe("pending");
    expect(job!.payload).toBe("test payload");
    expect(getQueue(q.id)!.pending_jobs).toBe(before + 1);
    expect(enqueueJob("q-9999", "nope")).toBeNull();
  });

  it("lists jobs for a queue", () => {
    const jobs = listJobs("q-1");
    expect(jobs.length).toBeGreaterThan(0);
    jobs.forEach((j) => expect(j.queue_id).toBe("q-1"));
  });

  it("deletes a queue", () => {
    const q = createQueue("delete-me", "svc-10", 2, 1);
    expect(deleteQueue(q.id)).toBe(true);
    expect(getQueue(q.id)).toBeNull();
    expect(deleteQueue("q-9999")).toBe(false);
  });

  it("returns queue stats", () => {
    const s = queueStats();
    expect(s.total_queues).toBeGreaterThan(0);
    expect(typeof s.total_pending).toBe("number");
    expect(typeof s.total_processing).toBe("number");
    expect(typeof s.total_failed).toBe("number");
    expect(s.by_status).toBeDefined();
  });
});
