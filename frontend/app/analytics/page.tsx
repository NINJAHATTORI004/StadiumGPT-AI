import { AnalyticsCharts } from "@/components/analytics-charts";
import { PageHeader } from "@/components/page-header";

export default function AnalyticsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Analytics"
        eyebrow="Operational intelligence"
        description="Matchday KPIs across crowd flow, queues, safety, accessibility, transport, and sustainability."
      />
      <AnalyticsCharts />
    </main>
  );
}

