import { FileText, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Reports"
        eyebrow="Auditable operations"
        description="Searchable shift reports, security summaries, medical logs, accessibility requests, and sustainability exports."
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden="true" />
          <Input aria-label="Search reports" placeholder="Search reports" className="pl-9" />
        </div>
        <Button variant="secondary">
          <Filter aria-hidden="true" /> Filters
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" aria-hidden="true" />
                  {report.title}
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{report.owner}</p>
              </div>
              <Badge>{report.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{report.summary}</p>
              <div className="flex flex-wrap gap-2">
                {report.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

