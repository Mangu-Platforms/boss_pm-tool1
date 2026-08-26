"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const NAV_KEYS: Record<string, string> = {
  "1": "/",
  "2": "/board",
  "3": "/issues",
};

export function KeyboardNav() {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const path = NAV_KEYS[e.key];
      if (path) {
        e.preventDefault();
        router.push(path);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return null;
}
