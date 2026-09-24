"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";

import { useTodos } from "../../features/todos/TodoProvider.jsx";
import Button from "../ui/Button";
import TodoAddDialog from "./TodoAddDialog";

export default function TodoAddControl() {
  const [isOpen, setIsOpen] = useState(false);
  const { addTodo } = useTodos();
  const triggerRef = useRef(null);

  const closeDialog = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} ref={triggerRef} type="button">
        <Plus size={17} aria-hidden="true" />
        할일 추가
      </Button>
      <TodoAddDialog
        onClose={closeDialog}
        onSubmit={addTodo}
        open={isOpen}
      />
    </>
  );
}
