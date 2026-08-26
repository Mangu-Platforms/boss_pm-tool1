"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Portfolio" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/board", label: "Kanban" },
  { href: "/issues", label: "Issues" },
  { href: "/epics", label: "Epics" },
  { href: "/goals", label: "Goals" },
  { href: "/agents", label: "Agents" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/workload", label: "Workload" },
  { href: "/milestones", label: "Milestones" },
  { href: "/sprints", label: "Sprints" },
  { href: "/analytics", label: "Analytics" },
  { href: "/reports", label: "Reports" },
  { href: "/activity", label: "Activity" },
  { href: "/team", label: "Team" },
  { href: "/inbox", label: "Inbox" },
  { href: "/sla", label: "SLA" },
  { href: "/releases", label: "Releases" },
  { href: "/changelog", label: "Changelog" },
  { href: "/risks", label: "Risks" },
  { href: "/retros", label: "Retros" },
  { href: "/capacity", label: "Capacity" },
  { href: "/feedback", label: "Feedback" },
  { href: "/decisions", label: "Decisions" },
  { href: "/standups", label: "Standups" },
  { href: "/permissions", label: "Permissions" },
  { href: "/tags", label: "Tags" },
  { href: "/views", label: "Views" },
  { href: "/integrations", label: "Integrations" },
  { href: "/automations", label: "Automations" },
  { href: "/notifications", label: "Notifications" },
  { href: "/wiki", label: "Wiki" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/audit", label: "Audit Log" },
  { href: "/leave", label: "Leave" },
  { href: "/status-page", label: "Status Page" },
  { href: "/custom-fields", label: "Custom Fields" },
  { href: "/timeline", label: "Timeline" },
  { href: "/dependencies", label: "Dependencies" },
  { href: "/time-entries", label: "Time Tracking" },
  { href: "/environments", label: "Environments" },
  { href: "/templates", label: "Templates" },
  { href: "/checklists", label: "Checklists" },
  { href: "/labels", label: "Labels" },
  { href: "/priorities", label: "Priorities" },
  { href: "/estimates", label: "Estimates" },
  { href: "/webhooks", label: "Webhooks" },
  { href: "/comments", label: "Comments" },
  { href: "/attachments", label: "Attachments" },
  { href: "/contacts", label: "Contacts" },
  { href: "/okrs", label: "OKRs" },
  { href: "/import-export", label: "Import/Export" },
  { href: "/workflows", label: "Workflows" },
  { href: "/api-keys", label: "API Keys" },
  { href: "/favorites", label: "Favorites" },
  { href: "/roles", label: "Roles" },
  { href: "/saved-filters", label: "Saved Filters" },
  { href: "/bulk-ops", label: "Bulk Ops" },
  { href: "/sla-policies", label: "SLA Policies" },
  { href: "/release-notes", label: "Release Notes" },
  { href: "/dashboards", label: "Dashboards" },
  { href: "/approvals", label: "Approvals" },
  { href: "/cost-tracking", label: "Cost Tracking" },
  { href: "/project-templates", label: "Project Templates" },
  { href: "/recurring-tasks", label: "Recurring Tasks" },
  { href: "/resource-planning", label: "Resource Planning" },
  { href: "/gantt", label: "Gantt" },
  { href: "/metric-alerts", label: "Metric Alerts" },
  { href: "/notifications-center", label: "Notification Center" },
  { href: "/document-versions", label: "Doc Versions" },
  { href: "/project-budgets", label: "Project Budgets" },
  { href: "/team-skills", label: "Team Skills" },
  { href: "/focus-mode", label: "Focus Mode" },
  { href: "/team-pulse", label: "Team Pulse" },
  { href: "/sprint-planning", label: "Sprint Planning" },
  { href: "/kanban-swimlanes", label: "Swimlanes" },
  { href: "/project-health", label: "Project Health" },
  { href: "/automation-engine", label: "Automations Engine" },
  { href: "/custom-dashboards", label: "Custom Dashboards" },
  { href: "/release-calendar", label: "Release Calendar" },
  { href: "/issue-cloning", label: "Issue Cloning" },
  { href: "/search", label: "Search" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={pathname === href ? "nav-active" : ""}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
