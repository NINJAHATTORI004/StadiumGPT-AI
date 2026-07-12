import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Clock3,
  Cross,
  Languages,
  Leaf,
  MapPinned,
  RadioTower,
  Route,
  ShieldAlert,
  Siren,
  TrainFront,
  UsersRound,
  Accessibility
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrowdHeatmap } from "@/components/crowd-heatmap";
import { AnalyticsCharts } from "@/components/analytics-charts";

const liveSignals = [
  { label: "Crowd Load", value: "78%", detail: "North Plaza", tone: "danger" },
  { label: "Gate C Queue", value: "18m", detail: "+6m forecast", tone: "warning" },
  { label: "Medical SLA", value: "91s", detail: "median response", tone: "success" },
  { label: "Transit Surge", value: "22:30", detail: "rail peak", tone: "default" }
] as const;

const missionQueue = [
  {
    icon: ShieldAlert,
    title: "Open Gate C overflow lane",
    meta: "Security + volunteer dispatch",
    badge: "Critical",
    variant: "danger" as const
  },
  {
    icon: Accessibility,
    title: "Protect accessible route via Gate D",
    meta: "Step-free path to sections 220-240",
    badge: "Active",
    variant: "success" as const
  },
  {
    icon: TrainFront,
    title: "Stage post-match rail messaging",
    meta: "Trigger after 82nd minute if score margin holds",
    badge: "Ready",
    variant: "default" as const
  }
];

const aiModules = [
  { icon: Route, label: "Fan Routing", copy: "Seat, gate, parking, food, washroom, and lost-and-found guidance." },
  { icon: RadioTower, label: "Organizer AI", copy: "Queue prediction, staffing, cleaning, transport, and incident summaries." },
  { icon: Siren, label: "Security AI", copy: "Risk triage, evacuation options, and command-ready incident briefs." },
  { icon: Cross, label: "Medical AI", copy: "Responder routing, heat-risk analysis, and severity prioritization." },
  { icon: Languages, label: "Volunteer AI", copy: "Task assignment, multilingual notices, and rapid incident reporting." },
  { icon: Leaf, label: "Sustainability", copy: "Carbon, waste, water, and energy recommendations per match phase." }
];

const zoneRows = [
  { zone: "North Plaza", status: "Elevated", queue: "16m", density: "84%", action: "Dispatch 6 staff" },
  { zone: "Gate D", status: "Stable", queue: "5m", density: "28%", action: "Preserve accessible flow" },
  { zone: "Transit Hub", status: "Building", queue: "9m", density: "61%", action: "Prepare rail nudges" },
  { zone: "Upper East", status: "Watch", queue: "7m", density: "54%", action: "Hydration alert" }
];

function signalClass(tone: (typeof liveSignals)[number]["tone"]) {
  return {
    danger: "border-danger/30 bg-danger/10 text-danger",
    warning: "border-warning/30 bg-warning/10 text-amber-700 dark:text-amber-300",
    success: "border-success/30 bg-success/10 text-success",
    default: "border-primary/30 bg-primary/10 text-primary"
  }[tone];
}

export default function LandingPage() {
  return (
    <main id="main-content" className="pb-10">
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-white">
        <Image
          src="/assets/stadium-ops-hero.png"
          alt="Smart stadium operations center with live crowd, transport, accessibility, medical, and security dashboards"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,.94),rgba(15,23,42,.78)_42%,rgba(15,23,42,.28))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1540px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,0.78fr)] lg:px-8">
          <div className="flex flex-col justify-center pb-24 pt-10">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge className="border border-white/20 bg-white/10 text-white">Live Matchday</Badge>
              <Badge className="border border-amber-300/40 bg-amber-300/20 text-amber-100">World Cup 2026</Badge>
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.96] sm:text-7xl lg:text-8xl">
              StadiumGPT AI
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl">
              One operating surface for crowd flow, security, medical response, accessibility, volunteers, transport, and sustainability.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
                <Link href="/dashboard/organizer">
                  Open Command Center <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" className="border border-white/25 bg-white/10 text-white hover:bg-white/20">
                <Link href="/maps">
                  <MapPinned aria-hidden="true" /> Live Venue Map
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
              {liveSignals.map((signal) => (
                <div key={signal.label} className={`rounded-lg border px-4 py-3 backdrop-blur ${signalClass(signal.tone)}`}>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-80">{signal.label}</p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <span className="text-3xl font-black text-white">{signal.value}</span>
                    <span className="text-sm font-semibold text-slate-100">{signal.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center lg:justify-end">
            <div className="w-full max-w-2xl rounded-lg border border-white/15 bg-slate-950/72 p-4 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-cyan-200">MetLife Stadium</p>
                  <h2 className="mt-1 text-2xl font-black">Operations Overview</h2>
                </div>
                <Badge className="bg-success/20 text-emerald-200">AI Online</Badge>
              </div>

              <div className="grid gap-3">
                {missionQueue.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white/10">
                      <item.icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold">{item.title}</h3>
                        <Badge variant={item.variant}>{item.badge}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{item.meta}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-white/10 bg-black/24 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-bold">Zone Intelligence</h3>
                  <Clock3 className="size-4 text-slate-300" aria-hidden="true" />
                </div>
                <div className="overflow-hidden rounded-lg border border-white/10">
                  {zoneRows.map((row) => (
                    <div key={row.zone} className="grid grid-cols-[1fr_80px_70px] gap-3 border-b border-white/10 px-3 py-3 text-sm last:border-b-0 sm:grid-cols-[1fr_86px_76px_1fr]">
                      <span className="font-semibold">{row.zone}</span>
                      <span className="text-slate-300">{row.queue}</span>
                      <span className="text-slate-300">{row.density}</span>
                      <span className="hidden text-right text-cyan-100 sm:block">{row.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-16 grid max-w-[1540px] gap-5 px-4 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:px-8">
        <CrowdHeatmap />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="size-5 text-primary" aria-hidden="true" />
              AI Mission Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {aiModules.map((module) => (
              <div key={module.label} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <module.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-bold">{module.label}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{module.copy}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto mt-6 max-w-[1540px] px-4 sm:px-6 lg:px-8">
        <AnalyticsCharts compact />
      </section>
    </main>
  );
}
