"use client";

import { useId, useRef, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { useTodos } from "../todos/TodoProvider.jsx";
import ChatPanel from "./ChatPanel";
import { submitScheduleMessage } from "./submitScheduleMessage.js";

export default function ScheduleChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const { addTodo } = useTodos();
  const triggerRef = useRef(null);
  const nextMessageId = useRef(0);
  const panelId = useId();

  const closePanel = () => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const appendMessage = (role, content) => {
    nextMessageId.current += 1;
    setMessages((current) => [...current, { id: nextMessageId.current, role, content }]);
  };

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || isSending) return;

    appendMessage("user", content);
    setDraft("");
    setIsSending(true);

    const reply = await submitScheduleMessage(content, addTodo);

    appendMessage("assistant", reply.text);
    setIsSending(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[25rem]">
      {isOpen ? (
        <ChatPanel
          draft={draft}
          id={panelId}
          isSending={isSending}
          messages={messages}
          onClose={closePanel}
          onDraftChange={setDraft}
          onSend={sendMessage}
        />
      ) : (
        <button
          aria-controls={panelId}
          aria-expanded={false}
          aria-haspopup="dialog"
          className="flex w-full items-center gap-3 rounded-2xl border border-[#ded5ff] bg-[#fffdfa] p-3.5 text-left shadow-[0_8px_32px_rgba(80,65,105,0.16)] transition hover:border-[#aa9bea] hover:bg-[#faf8ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f7ce7]"
          onClick={() => setIsOpen(true)}
          ref={triggerRef}
          type="button"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ede9ff] text-[#6d5abc]">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-[#2d3559]">어떤 일정을 추가할까요?</span>
            <span className="mt-0.5 block text-xs text-[#727895]">일정 도우미와 대화하기</span>
          </span>
          <ArrowUpRight size={19} className="text-[#8f7ce7]" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
