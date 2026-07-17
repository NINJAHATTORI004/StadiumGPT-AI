import { notFound } from "next/navigation";
import { RoleDashboard } from "@/components/role-dashboard";
import { dashboardRoles } from "@/lib/data";

type DashboardRole = (typeof dashboardRoles)[number];

type PageProps = {
  params: { role: string };
};

export function generateStaticParams() {
  return dashboardRoles.map((role) => ({ role }));
}

export default function DashboardPage({ params }: PageProps) {
  const { role } = params;

  if (!dashboardRoles.includes(role as DashboardRole)) {
    notFound();
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RoleDashboard role={role} />
    </main>
  );
}
