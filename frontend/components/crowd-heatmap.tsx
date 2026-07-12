import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { heatmapZones } from "@/lib/data";

export function CrowdHeatmap() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Live Crowd Heatmap</CardTitle>
        <Badge variant="warning">Predictive</Badge>
      </CardHeader>
      <CardContent>
        <div
          className="grid aspect-[1.6] grid-cols-6 gap-2 rounded-lg border border-border bg-muted p-3"
          role="img"
          aria-label="Crowd heatmap showing zone density and queue risk"
        >
          {heatmapZones.map((zone) => (
            <div
              key={zone.name}
              className="flex min-h-16 flex-col justify-between rounded-lg p-3 text-xs font-semibold text-white"
              style={{ backgroundColor: zone.color }}
              title={`${zone.name}: ${zone.density}% density`}
            >
              <span>{zone.name}</span>
              <span>{zone.density}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

