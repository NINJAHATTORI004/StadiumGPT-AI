"use client";

import { Bell, Languages, Moon, ShieldCheck, Volume2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleRow } from "@/components/toggle-row";

export default function SettingsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Settings"
        eyebrow="Personal operations"
        description="Configure language, accessibility, notifications, privacy, and emergency-mode preferences."
      />
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <ToggleRow icon={Languages} label="Multilingual assistant" description="Auto-detect fan language and preserve translations in reports." enabled />
            <ToggleRow icon={Volume2} label="Voice output" description="Read route and incident instructions aloud when enabled." enabled />
            <ToggleRow icon={Moon} label="Dark mode follows system" description="Keep high contrast in low-light operations rooms." enabled />
            <ToggleRow icon={Bell} label="Critical notifications" description="Bypass quiet hours for safety, medical, and evacuation updates." enabled />
            <ToggleRow icon={ShieldCheck} label="Audit activity" description="Record sensitive actions for compliance and after-action review." enabled />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
