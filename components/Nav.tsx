"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Portfolio" },
  { href: "/board", label: "Kanban" },
  { href: "/issues", label: "Issues" },
  { href: "/agents", label: "Agents" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/workload", label: "Workload" },
  { href: "/milestones", label: "Milestones" },
  { href: "/sprints", label: "Sprints" },
  { href: "/analytics", label: "Analytics" },
  { href: "/activity", label: "Activity" },
  { href: "/team", label: "Team" },
  { href: "/inbox", label: "Inbox" },
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
