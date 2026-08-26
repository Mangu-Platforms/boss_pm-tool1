"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IssueCreate } from "@/components/IssueCreate";
import type { Product } from "@/lib/types";

export default function NewIssuePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, []);

  return (
    <main>
      <div className="kicker">Claim 1 + 2</div>
      <h1>Create issue</h1>
      <p className="lede">
        Assign a human or Alice / Swarm. Agent assignment without a cost cap is rejected (400).
      </p>
      <IssueCreate products={products} onCreated={() => router.push("/issues")} />
    </main>
  );
}
