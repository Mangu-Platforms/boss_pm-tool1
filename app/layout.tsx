import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { KeyboardHelp } from "@/components/KeyboardHelp";
import { KeyboardNav } from "@/components/KeyboardNav";
import { ToastContainer } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Boss PM — Mangu Platforms",
  description: "Operator PM. Instant. Agent-native. One portfolio board.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
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
            <Nav />
          </header>
          {children}
        </div>
        <KeyboardHelp />
        <KeyboardNav />
        <ToastContainer />
      </body>
    </html>
  );
}
