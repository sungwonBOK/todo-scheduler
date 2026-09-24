import WeeklyDiary from "../../../components/weekly/WeeklyDiary";
import AppShell from "../../../components/layout/AppShell";
import { dashboardSeed } from "../../../data/dashboardSeed";

export default function WeekPage() {
  return (
    <AppShell activeSection="week">
      <WeeklyDiary initialData={dashboardSeed} />
    </AppShell>
  );
}
