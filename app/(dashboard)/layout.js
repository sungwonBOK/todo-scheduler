import { TodoProvider } from "../../features/todos/TodoProvider.jsx";
import ScheduleChat from "../../features/chat/ScheduleChat.jsx";

export default function DashboardLayout({ children }) {
  return (
    <TodoProvider>
      {children}
      <ScheduleChat />
    </TodoProvider>
  );
}
