"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Command,
  MapPin,
  Radio,
  Sparkles,
  UsersRound
} from "lucide-react";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { AiChatPanel } from "@/components/ai-chat-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrowdHeatmap } from "@/components/crowd-heatmap";
import { roleDashboards } from "@/lib/data";

const icons = [UsersRound, Clock, AlertTriangle, CheckCircle2, Radio, MapPin];

export function RoleDashboard({ role }: { role: string }) {
  const dashboard = roleDashboards[role];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-border bg-slate-950 text-white shadow-panel">
        <div className="grid gap-6 p-5 lg:grid-cols-[0.9fr_1.1fr] lg:p-7">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-cyan-100">
                <Command className="size-4" aria-hidden="true" />
                {dashboard.eyebrow}
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">{dashboard.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {dashboard.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="border border-emerald-300/30 bg-emerald-300/20 text-emerald-100">AI Online</Badge>
              <Badge className="border border-cyan-300/30 bg-cyan-300/20 text-cyan-100">Live Sensors</Badge>
              <Badge className="border border-amber-300/30 bg-amber-300/20 text-amber-100">Command Sync</Badge>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {dashboard.metrics.map((metric, index) => {
              const Icon = icons[index % icons.length];
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{metric.label}</p>
                    <p className="mt-2 text-3xl font-black">{metric.value}</p>
                    <Badge className="mt-3" variant={metric.variant}>{metric.detail}</Badge>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white/10 text-cyan-100">
                    <Icon aria-hidden="true" />
                  </span>
                </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" aria-hidden="true" />
              Priority Work Queue
            </CardTitle>
            <Badge variant="warning">AI Ranked</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.tasks.map((task) => (
              <div key={task.title} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{task.copy}</p>
                  </div>
                  <Badge variant={task.variant}>{task.priority}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <CrowdHeatmap />
      </div>
      <AnalyticsCharts compact />
      <AiChatPanel defaultModule={dashboard.module} compact />
    </div>
  );
}
