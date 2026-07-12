import { Activity, Car, Leaf, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  { label: "Live crowd zones", value: "42", change: "+8 monitored", icon: Activity },
  { label: "Queue prediction", value: "14 min", change: "Gate C peak", icon: Car },
  { label: "Safety SLA", value: "91 sec", change: "Median response", icon: ShieldCheck },
  { label: "Carbon saved", value: "18.4t", change: "Transit nudges", icon: Leaf }
];

export function MetricStrip() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold">{metric.value}</p>
              <p className="mt-1 text-xs font-semibold text-primary">{metric.change}</p>
            </div>
            <span className="grid size-11 place-items-center rounded-lg bg-accent/20 text-amber-700 dark:text-amber-300">
              <metric.icon aria-hidden="true" />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
