import WeeklyDiary from "../../../components/weekly/WeeklyDiary";
import AppShell from "../../../components/layout/AppShell";

export default function WeekPage() {
  return (
    <AppShell activeSection="week">
      <WeeklyDiary />
    </AppShell>
  );
}
