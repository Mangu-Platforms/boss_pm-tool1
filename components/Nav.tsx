"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Portfolio" },
  { href: "/board", label: "Kanban" },
  { href: "/issues", label: "Issues" },
  { href: "/agents", label: "Agents" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/analytics", label: "Analytics" },
  { href: "/activity", label: "Activity" },
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
