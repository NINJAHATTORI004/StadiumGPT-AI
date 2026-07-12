import { QRCodeSVG } from "qrcode.react";
import { Accessibility, BadgeCheck, Mail, MapPin } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Profile"
        eyebrow="Identity and access"
        description="Operational identity, assigned role, QR credential, and accessibility preferences."
      />
      <div className="grid gap-4 lg:grid-cols-[0.7fr_0.3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Operations Organizer</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <p className="flex items-center gap-2"><Mail className="size-4 text-primary" aria-hidden="true" /> organizer@stadiumgpt.ai</p>
            <p className="flex items-center gap-2"><BadgeCheck className="size-4 text-success" aria-hidden="true" /> Role: Organizer Command</p>
            <p className="flex items-center gap-2"><MapPin className="size-4 text-warning" aria-hidden="true" /> Assigned: MetLife Stadium Operations Center</p>
            <p className="flex items-center gap-2"><Accessibility className="size-4 text-primary" aria-hidden="true" /> Accessibility: high-contrast UI, voice alerts</p>
            <div className="flex flex-wrap gap-2">
              {["Crowd", "Security", "Transport", "Analytics"].map((item) => (
                <Badge key={item} variant="outline">{item}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Credential</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="rounded-lg bg-white p-4 text-slate-950">
              <QRCodeSVG value="stadiumgpt://credential/organizer-demo" size={180} level="H" />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
