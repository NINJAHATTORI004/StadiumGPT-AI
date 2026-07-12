"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { congestionTrend, queueByGate } from "@/lib/data";

export function AnalyticsCharts({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-4 ${compact ? "lg:grid-cols-2" : "lg:grid-cols-2"}`}>
      <Card>
        <CardHeader>
          <CardTitle>Crowd Density Forecast</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={congestionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="north" stroke="#0f766e" fill="#0f766e33" name="North Plaza" />
              <Area type="monotone" dataKey="east" stroke="#d97706" fill="#d9770633" name="East Gate" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Queue Minutes by Gate</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={queueByGate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="gate" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="minutes" fill="#2563eb" radius={[6, 6, 0, 0]} name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

