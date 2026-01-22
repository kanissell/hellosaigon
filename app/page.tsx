"use client";

import { FormEvent, useState } from "react";
import type { ChatMessage } from "@/lib/types/chat";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
    };

    // 1) Append user message
    setMessages((prev) => [...prev, userMessage]);

    // 2) Send POST request to /api/chat
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: trimmed }),
    });

    // 3) Await the response and 4) append assistant message using response.text
    const data: { text: string } = await response.json();
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: data.text,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // 5) Clear the input
    setInput("");
  };

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-4 py-6 font-sans dark:bg-black">
      <main className="flex h-full w-full max-w-2xl flex-col rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Minimal Chat
        </h1>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {messages.length === 0 && (
            <p className="text-zinc-500 dark:text-zinc-400">
              Start the conversation by typing a message below.
            </p>
          )}

          {messages.map((message, index) => (
            <div key={index} className="flex flex-col">
              <span className="mb-0.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {message.role === "user" ? "You" : "Assistant"}
              </span>
              <div
                className={
                  message.role === "user"
                    ? "self-start rounded-md bg-white px-3 py-2 text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-800"
                    : "self-start rounded-md bg-zinc-100 px-3 py-2 text-zinc-900 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-700"
                }
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:disabled:bg-zinc-600"
            disabled={!input.trim()}
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
