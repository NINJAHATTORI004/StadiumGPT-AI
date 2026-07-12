import { notFound } from "next/navigation";
import { RoleDashboard } from "@/components/role-dashboard";
import { dashboardRoles } from "@/lib/data";

type DashboardRole = (typeof dashboardRoles)[number];

type PageProps = {
  params: Promise<{ role: string }>;
};

export function generateStaticParams() {
  return dashboardRoles.map((role) => ({ role }));
}

export default async function DashboardPage({ params }: PageProps) {
  const { role } = await params;

  if (!dashboardRoles.includes(role as DashboardRole)) {
    notFound();
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RoleDashboard role={role} />
    </main>
  );
}
