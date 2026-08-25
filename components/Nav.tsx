"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Board" },
  { href: "/issues", label: "Issues" },
  { href: "/issues/new", label: "Create" },
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
