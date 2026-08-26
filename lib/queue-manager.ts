export type QueueStatus = "active" | "paused" | "draining" | "idle";
export type JobStatus = "pending" | "processing" | "completed" | "failed" | "retrying";

export type Queue = {
  id: string;
  name: string;
  service_id: string;
  status: QueueStatus;
  pending_jobs: number;
  processing_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  avg_processing_ms: number;
  max_concurrency: number;
  retry_limit: number;
  created_at: string;
};

export type Job = {
  id: string;
  queue_id: string;
  payload: string;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

let nextQueueId = 7;
let nextJobId = 16;

const queues: Queue[] = [
  { id: "q-1", name: "email-notifications", service_id: "svc-4", status: "active", pending_jobs: 45, processing_jobs: 5, completed_jobs: 12500, failed_jobs: 23, avg_processing_ms: 120, max_concurrency: 10, retry_limit: 3, created_at: "2024-12-01T00:00:00Z" },
  { id: "q-2", name: "webhook-delivery", service_id: "svc-1", status: "active", pending_jobs: 12, processing_jobs: 3, completed_jobs: 8900, failed_jobs: 156, avg_processing_ms: 450, max_concurrency: 5, retry_limit: 5, created_at: "2024-12-01T00:00:00Z" },
  { id: "q-3", name: "report-generation", service_id: "svc-3", status: "active", pending_jobs: 3, processing_jobs: 1, completed_jobs: 340, failed_jobs: 8, avg_processing_ms: 15000, max_concurrency: 2, retry_limit: 2, created_at: "2024-12-15T00:00:00Z" },
  { id: "q-4", name: "image-processing", service_id: "svc-2", status: "paused", pending_jobs: 89, processing_jobs: 0, completed_jobs: 5600, failed_jobs: 45, avg_processing_ms: 3000, max_concurrency: 4, retry_limit: 3, created_at: "2024-11-01T00:00:00Z" },
  { id: "q-5", name: "data-export", service_id: "svc-3", status: "draining", pending_jobs: 2, processing_jobs: 2, completed_jobs: 120, failed_jobs: 3, avg_processing_ms: 30000, max_concurrency: 2, retry_limit: 1, created_at: "2025-01-01T00:00:00Z" },
  { id: "q-6", name: "audit-log-flush", service_id: "svc-1", status: "idle", pending_jobs: 0, processing_jobs: 0, completed_jobs: 7200, failed_jobs: 0, avg_processing_ms: 50, max_concurrency: 1, retry_limit: 3, created_at: "2024-10-01T00:00:00Z" },
];

const jobs: Job[] = [
  { id: "job-1", queue_id: "q-1", payload: "Welcome email to user-42", status: "completed", attempts: 1, max_attempts: 3, error: null, created_at: "2025-01-25T09:00:00Z", started_at: "2025-01-25T09:00:01Z", completed_at: "2025-01-25T09:00:02Z" },
  { id: "job-2", queue_id: "q-1", payload: "Password reset for user-15", status: "processing", attempts: 1, max_attempts: 3, error: null, created_at: "2025-01-25T10:00:00Z", started_at: "2025-01-25T10:00:01Z", completed_at: null },
  { id: "job-3", queue_id: "q-2", payload: "POST https://partner.example.com/webhook", status: "failed", attempts: 5, max_attempts: 5, error: "Connection refused", created_at: "2025-01-25T08:00:00Z", started_at: "2025-01-25T09:30:00Z", completed_at: null },
  { id: "job-4", queue_id: "q-2", payload: "POST https://client.example.com/events", status: "retrying", attempts: 2, max_attempts: 5, error: "Timeout after 30s", created_at: "2025-01-25T09:30:00Z", started_at: "2025-01-25T09:30:01Z", completed_at: null },
  { id: "job-5", queue_id: "q-3", payload: "Monthly report Q4 2024", status: "processing", attempts: 1, max_attempts: 2, error: null, created_at: "2025-01-25T06:00:00Z", started_at: "2025-01-25T06:00:05Z", completed_at: null },
];

export function listQueues(service_id?: string, status?: QueueStatus): Queue[] {
  let result = [...queues];
  if (service_id) result = result.filter((q) => q.service_id === service_id);
  if (status) result = result.filter((q) => q.status === status);
  return result.sort((a, b) => b.pending_jobs - a.pending_jobs);
}

export function getQueue(id: string): Queue | null {
  return queues.find((q) => q.id === id) || null;
}

export function createQueue(name: string, service_id: string, max_concurrency: number, retry_limit: number): Queue {
  const q: Queue = {
    id: `q-${nextQueueId++}`,
    name,
    service_id,
    status: "idle",
    pending_jobs: 0,
    processing_jobs: 0,
    completed_jobs: 0,
    failed_jobs: 0,
    avg_processing_ms: 0,
    max_concurrency,
    retry_limit,
    created_at: new Date().toISOString(),
  };
  queues.push(q);
  return q;
}

export function updateQueueStatus(id: string, status: QueueStatus): Queue | null {
  const q = queues.find((qu) => qu.id === id);
  if (!q) return null;
  q.status = status;
  return q;
}

export function enqueueJob(queue_id: string, payload: string): Job | null {
  const q = queues.find((qu) => qu.id === queue_id);
  if (!q) return null;
  const job: Job = {
    id: `job-${nextJobId++}`,
    queue_id,
    payload,
    status: "pending",
    attempts: 0,
    max_attempts: q.retry_limit,
    error: null,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
  };
  jobs.push(job);
  q.pending_jobs++;
  return job;
}

export function listJobs(queue_id: string, status?: JobStatus): Job[] {
  let result = jobs.filter((j) => j.queue_id === queue_id);
  if (status) result = result.filter((j) => j.status === status);
  return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function deleteQueue(id: string): boolean {
  const idx = queues.findIndex((q) => q.id === id);
  if (idx === -1) return false;
  queues.splice(idx, 1);
  return true;
}

export function queueStats() {
  const total_queues = queues.length;
  const total_pending = queues.reduce((s, q) => s + q.pending_jobs, 0);
  const total_processing = queues.reduce((s, q) => s + q.processing_jobs, 0);
  const total_failed = queues.reduce((s, q) => s + q.failed_jobs, 0);
  const by_status: Record<string, number> = {};
  queues.forEach((q) => { by_status[q.status] = (by_status[q.status] || 0) + 1; });
  return { total_queues, total_pending, total_processing, total_failed, by_status };
}
