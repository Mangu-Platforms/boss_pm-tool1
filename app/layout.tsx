import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boss PM — Mangu",
  description: "Operator PM. Instant. Agent-native. One portfolio board.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="shell">
          <header className="top">
            <div className="brand">
              Mangu Platforms
              <b>Boss PM</b>
            </div>
            <nav className="nav">
              <Link href="/">Board</Link>
              <Link href="/issues">Issues</Link>
              <Link href="/issues/new">Create</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
