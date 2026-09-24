import Dashboard from "../../components/dashboard/Dashboard";
import AppShell from "../../components/layout/AppShell";
import { dashboardSeed } from "../../data/dashboardSeed";

export default function HomePage() {
  return (
    <AppShell>
      <Dashboard initialData={dashboardSeed} />
    </AppShell>
  );
}
