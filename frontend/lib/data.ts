export const dashboardRoles = ["fan", "organizer", "security", "medical", "volunteer"] as const;

type Variant = "default" | "outline" | "success" | "warning" | "danger";

export const modules = [
  { name: "Fan Assistant", description: "Routes fans to seats, gates, food, parking, washrooms, lost-and-found, and match schedules." },
  { name: "Organizer AI", description: "Summarizes incidents, crowd pressure, staffing gaps, transportation, cleaning, and queue forecasts." },
  { name: "Security AI", description: "Triage reports, recommend emergency actions, and compare evacuation options with live crowd data." },
  { name: "Accessibility AI", description: "Provides wheelchair routing, screen-reader friendly steps, voice assistance, and accessible facility search." }
];

export const roleDashboards: Record<string, {
  eyebrow: string;
  title: string;
  description: string;
  module: string;
  metrics: Array<{ label: string; value: string; detail: string; variant: Variant }>;
  tasks: Array<{ title: string; copy: string; priority: string; variant: Variant }>;
}> = {
  fan: {
    eyebrow: "Fan journey",
    title: "Fan Dashboard",
    description: "Personal matchday guidance for navigation, tickets, parking, concessions, accessibility, and multilingual support.",
    module: "FAN",
    metrics: [
      { label: "Seat route", value: "8 min", detail: "Step-free", variant: "success" },
      { label: "Nearest gate", value: "D", detail: "Low queue", variant: "success" },
      { label: "Food pickup", value: "12 min", detail: "Vendor 18", variant: "warning" },
      { label: "Transit home", value: "22:44", detail: "Track 3", variant: "default" }
    ],
    tasks: [
      { title: "Use Gate D", copy: "Gate C is congested. Gate D has elevator access and a shorter queue.", priority: "Recommended", variant: "success" },
      { title: "Preorder water", copy: "Hydration vendors near section 232 have a 3 minute pickup window.", priority: "Optional", variant: "default" }
    ]
  },
  organizer: {
    eyebrow: "Command center",
    title: "Organizer Dashboard",
    description: "Tournament-wide operational intelligence for crowd movement, incident load, volunteers, transport, and sustainability.",
    module: "ORGANIZER",
    metrics: [
      { label: "Open incidents", value: "17", detail: "4 elevated", variant: "warning" },
      { label: "Volunteer coverage", value: "94%", detail: "North low", variant: "success" },
      { label: "Queue forecast", value: "18 min", detail: "Gate C", variant: "danger" },
      { label: "Transport load", value: "71%", detail: "Stable", variant: "default" }
    ],
    tasks: [
      { title: "Rebalance volunteers", copy: "Move six volunteers from South Fan Zone to North Plaza before halftime.", priority: "High", variant: "danger" },
      { title: "Open overflow lane", copy: "Gate C will exceed target queue length in 11 minutes without intervention.", priority: "High", variant: "warning" }
    ]
  },
  security: {
    eyebrow: "Safety operations",
    title: "Security Dashboard",
    description: "Incident triage, emergency recommendations, evacuation route checks, and risk summaries for safety teams.",
    module: "SECURITY",
    metrics: [
      { label: "Risk level", value: "Elevated", detail: "North Plaza", variant: "warning" },
      { label: "Active reports", value: "9", detail: "2 urgent", variant: "danger" },
      { label: "Response SLA", value: "82 sec", detail: "On target", variant: "success" },
      { label: "Egress capacity", value: "83%", detail: "Good", variant: "success" }
    ],
    tasks: [
      { title: "Dispatch rover team", copy: "Two adjacent zones show rising density and repeated fan assistance requests.", priority: "Urgent", variant: "danger" },
      { title: "Prepare east egress", copy: "Keep accessible route clear before post-match release.", priority: "Medium", variant: "warning" }
    ]
  },
  medical: {
    eyebrow: "Medical response",
    title: "Medical Dashboard",
    description: "Medical request intake, severity routing, responder location, accessible access paths, and heat-related risk signals.",
    module: "MEDICAL",
    metrics: [
      { label: "Open requests", value: "6", detail: "1 critical", variant: "danger" },
      { label: "Median response", value: "2m 10s", detail: "Improving", variant: "success" },
      { label: "Heat index", value: "31 C", detail: "Hydrate", variant: "warning" },
      { label: "Med teams", value: "14", detail: "All online", variant: "success" }
    ],
    tasks: [
      { title: "Route Team 4", copy: "Use service corridor S2 to reach section 118 without crossing fan surge.", priority: "Urgent", variant: "danger" },
      { title: "Send hydration alert", copy: "Upper east stand has repeated heat-related queries.", priority: "Medium", variant: "warning" }
    ]
  },
  volunteer: {
    eyebrow: "Volunteer mode",
    title: "Volunteer Dashboard",
    description: "Assignments, translation, navigation, incident reporting, and escalation guidance for matchday volunteers.",
    module: "VOLUNTEER",
    metrics: [
      { label: "Assigned tasks", value: "5", detail: "2 nearby", variant: "default" },
      { label: "Translation", value: "12", detail: "Languages", variant: "success" },
      { label: "Help requests", value: "21", detail: "North", variant: "warning" },
      { label: "Shift time", value: "3h 40m", detail: "Remaining", variant: "default" }
    ],
    tasks: [
      { title: "Assist accessibility route", copy: "Meet a fan at Parking B and guide them to elevator bank E2.", priority: "High", variant: "warning" },
      { title: "Translate gate notice", copy: "Spanish and French notices needed for Gate C rerouting.", priority: "Medium", variant: "default" }
    ]
  }
};

export const heatmapZones = [
  { name: "N1", density: 78, color: "#dc2626" },
  { name: "N2", density: 69, color: "#f97316" },
  { name: "E1", density: 54, color: "#d97706" },
  { name: "E2", density: 33, color: "#0f766e" },
  { name: "S1", density: 41, color: "#2563eb" },
  { name: "S2", density: 28, color: "#16a34a" },
  { name: "W1", density: 62, color: "#f97316" },
  { name: "W2", density: 46, color: "#0f766e" },
  { name: "P1", density: 84, color: "#b91c1c" },
  { name: "P2", density: 36, color: "#16a34a" },
  { name: "T1", density: 71, color: "#d97706" },
  { name: "T2", density: 44, color: "#2563eb" }
];

export const congestionTrend = [
  { time: "17:00", north: 42, east: 28 },
  { time: "17:30", north: 52, east: 36 },
  { time: "18:00", north: 68, east: 48 },
  { time: "18:30", north: 77, east: 61 },
  { time: "19:00", north: 64, east: 55 },
  { time: "19:30", north: 58, east: 46 }
];

export const queueByGate = [
  { gate: "A", minutes: 7 },
  { gate: "B", minutes: 11 },
  { gate: "C", minutes: 18 },
  { gate: "D", minutes: 5 },
  { gate: "E", minutes: 9 }
];

export const aiModules = [
  { value: "FAN", label: "Fan Assistant" },
  { value: "ORGANIZER", label: "Organizer AI" },
  { value: "SECURITY", label: "Security AI" },
  { value: "VOLUNTEER", label: "Volunteer AI" },
  { value: "ACCESSIBILITY", label: "Accessibility AI" },
  { value: "SUSTAINABILITY", label: "Sustainability AI" },
  { value: "MEDICAL", label: "Medical AI" }
];

export const assistantExamples: Record<string, string[]> = {
  FAN: ["Nearest low-queue gate", "Best route to section 232", "Find vegetarian food nearby"],
  ORGANIZER: ["Summarize crowd risks", "Predict staff needs", "Which queues need intervention?"],
  SECURITY: ["Triage north plaza incident", "Recommend evacuation route", "Summarize elevated risks"],
  VOLUNTEER: ["Translate gate closure to Spanish", "Assign my next task", "Report lost child"],
  ACCESSIBILITY: ["Wheelchair route from Parking B", "Find accessible washroom", "Read route aloud"],
  SUSTAINABILITY: ["Reduce transport emissions", "Waste forecast", "Energy recommendations"],
  MEDICAL: ["Fastest route to section 118", "Heat risk summary", "Prioritize medical calls"]
};

export const mapMarkers = [
  { name: "Gate C", type: "High queue gate", position: [40.816, -74.076] as [number, number], density: 78, risk: "High", riskColor: "#dc2626" },
  { name: "Gate D", type: "Accessible low queue gate", position: [40.812, -74.071] as [number, number], density: 28, risk: "Low", riskColor: "#16a34a" },
  { name: "Medical Post 2", type: "Medical response", position: [40.814, -74.072] as [number, number], density: 36, risk: "Low", riskColor: "#16a34a" },
  { name: "North Plaza", type: "Crowd surge watch", position: [40.817, -74.074] as [number, number], density: 84, risk: "High", riskColor: "#b91c1c" },
  { name: "Transit Hub", type: "Rail and shuttle", position: [40.809, -74.078] as [number, number], density: 61, risk: "Medium", riskColor: "#d97706" }
];

export const routeLines = [
  { name: "Accessible route Parking B to Gate D", color: "#0f766e", points: [[40.809, -74.078], [40.811, -74.075], [40.812, -74.071]] as [number, number][] },
  { name: "Emergency service corridor S2", color: "#dc2626", points: [[40.813, -74.079], [40.814, -74.074], [40.814, -74.072]] as [number, number][] }
];

export const notifications = [
  { id: "n1", severity: "CRITICAL", title: "Gate C queue threshold exceeded", body: "Open overflow lane and route fans with accessibility needs to Gate D." },
  { id: "n2", severity: "ELEVATED", title: "Heat advisory in upper east stand", body: "Send hydration message in English, Spanish, and French." },
  { id: "n3", severity: "ELEVATED", title: "Transit surge expected at 22:30", body: "Rail operator recommends staggered exit messaging after final whistle." }
];

export const reports = [
  { id: "r1", title: "Halftime Crowd Summary", owner: "Organizer AI", status: "Ready", summary: "North Plaza exceeded density targets for nine minutes; mitigations reduced queue time by 31%.", tags: ["Crowd", "Queue", "Staffing"] },
  { id: "r2", title: "Medical Response Log", owner: "Medical Command", status: "Reviewed", summary: "Six requests, one critical, median response 2m 10s, no unresolved priority calls.", tags: ["Medical", "SLA"] },
  { id: "r3", title: "Sustainability Snapshot", owner: "Sustainability AI", status: "Ready", summary: "Transit nudges avoided an estimated 18.4t CO2e; waste sorting compliance at 73%.", tags: ["Carbon", "Waste"] },
  { id: "r4", title: "Accessibility Service Review", owner: "Accessibility Lead", status: "Draft", summary: "Step-free routes handled 112 route requests with two elevator delay alerts.", tags: ["Accessibility", "Routing"] }
];

