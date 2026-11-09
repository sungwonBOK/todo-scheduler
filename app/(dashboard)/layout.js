import { TodoProvider } from "../../features/todos/TodoProvider.jsx";
import ScheduleChat from "../../features/chat/ScheduleChat.jsx";
import AuthGuard from "../../features/auth/AuthGuard.jsx";

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <TodoProvider>
        {children}
        <ScheduleChat />
      </TodoProvider>
    </AuthGuard>
  );
}
