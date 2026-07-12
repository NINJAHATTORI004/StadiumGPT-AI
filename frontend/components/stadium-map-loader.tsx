"use client";

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/page-header";

const StadiumMap = dynamic(() => import("@/components/stadium-map"), {
  ssr: false,
  loading: () => <div className="min-h-[520px] rounded-lg border border-border bg-muted" aria-label="Loading map" />
});

export function StadiumMapLoader() {
  return (
    <>
      <PageHeader
        title="Maps"
        eyebrow="Live venue routing"
        description="OpenStreetMap-powered operations view for gates, crowds, food, accessible routes, medical posts, parking, and transit."
      />
      <StadiumMap />
    </>
  );
}

