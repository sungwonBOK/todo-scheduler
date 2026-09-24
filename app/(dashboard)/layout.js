import { dashboardSeed } from "../../data/dashboardSeed";
import { TodoProvider } from "../../features/todos/TodoProvider.jsx";

export default function DashboardLayout({ children }) {
  return <TodoProvider initialTasks={dashboardSeed.tasks}>{children}</TodoProvider>;
}
