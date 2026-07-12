import { BellRing, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { notifications } from "@/lib/data";

export function NotificationCenter() {
  return (
    <>
      <PageHeader
        title="Notifications"
        eyebrow="Real-time alerts"
        description="Operational alerts for crowd surges, medical response, transport changes, accessibility requests, and weather."
      />
      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                {notification.severity === "CRITICAL" ? (
                  <Siren className="size-5 text-danger" aria-hidden="true" />
                ) : (
                  <BellRing className="size-5 text-primary" aria-hidden="true" />
                )}
                {notification.title}
              </CardTitle>
              <Badge variant={notification.severity === "CRITICAL" ? "danger" : "warning"}>
                {notification.severity}
              </Badge>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              {notification.body}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

