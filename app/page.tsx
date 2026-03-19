"use client";

import { FormEvent, useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage } from "@/lib/types/chat";
import { extractRecommendations } from "@/lib/memory/extractRecommendations";
import type { RecommendationRecord } from "@/lib/memory/types";

const LS_RECS_KEY = "hs_recs";
const LS_CHAT_KEY = "hs_chat";
const MAX_RECORDS = 100;
const MAX_CHAT_MESSAGES = 50;

function loadRecs(): RecommendationRecord[] {
  try {
    const raw = localStorage.getItem(LS_RECS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecs(recs: RecommendationRecord[]) {
  const trimmed = recs.slice(-MAX_RECORDS);
  localStorage.setItem(LS_RECS_KEY, JSON.stringify(trimmed));
  return trimmed;
}

function loadChat(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LS_CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChat(msgs: ChatMessage[]) {
  const trimmed = msgs.slice(-MAX_CHAT_MESSAGES);
  localStorage.setItem(LS_CHAT_KEY, JSON.stringify(trimmed));
  return trimmed;
}

type Suggestion = { label: string; query: string };

function getSmartSuggestions(): Suggestion[] {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return [
      { label: "Breakfast spot", query: "Where's good for breakfast?" },
      { label: "Morning coffee", query: "Best coffee to start the day?" },
      { label: "Pho nearby", query: "Where should I get pho this morning?" },
    ];
  } else if (hour >= 11 && hour < 14) {
    return [
      { label: "Quick lunch", query: "Where's good for a quick lunch?" },
      { label: "Com tam", query: "Best com tam around here?" },
      { label: "Work cafe", query: "Good cafe to work from this afternoon?" },
    ];
  } else if (hour >= 14 && hour < 17) {
    return [
      { label: "Coffee break", query: "Good spot for an afternoon coffee?" },
      { label: "Workspace", query: "Best cafe with wifi for working?" },
      { label: "Snack run", query: "Where can I grab a good snack?" },
    ];
  } else if (hour >= 17 && hour < 22) {
    return [
      { label: "Dinner plans", query: "Where should I eat dinner tonight?" },
      { label: "Banh mi", query: "Best banh mi in Saigon?" },
      { label: "Rooftop bar", query: "Good rooftop bar for drinks tonight?" },
    ];
  } else {
    return [
      { label: "Late eats", query: "What's still open for food late night?" },
      { label: "Night bar", query: "Best bar open late?" },
      { label: "24h coffee", query: "Any 24-hour coffee spots?" },
    ];
  }
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recsRef = useRef<RecommendationRecord[]>([]);

  useEffect(() => {
    recsRef.current = loadRecs();
    setMessages(loadChat());
    setHydrated(true);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
    };

    // Clear input immediately
    setInput("");

    // Add user message
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveChat(newMessages);
    setIsLoading(true);

    try {
      // Send POST request with message and conversation history
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
          recommendationHistory: recsRef.current,
        }),
      });

      const data: { text: string } = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.text,
      };

      // Extract and save recommendations from response
      const newRecs = extractRecommendations(data.text);
      if (newRecs.length > 0) {
        recsRef.current = saveRecs([...recsRef.current, ...newRecs]);
      }

      const withAssistant = [...newMessages, assistantMessage];
      setMessages(withAssistant);
      saveChat(withAssistant);
    } catch {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I couldn't connect. Check your internet and try again?",
      };
      const withError = [...newMessages, errorMessage];
      setMessages(withError);
      saveChat(withError);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = getSmartSuggestions();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            HelloSaigon
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your local Saigon concierge
          </p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {hydrated && messages.length === 0 && (
            <div className="py-12 text-center">
              <p className="mb-2 text-lg text-zinc-700 dark:text-zinc-300">
                Hey! I&apos;m your local Saigon concierge.
              </p>
              <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                Ask me anything — where to eat, best coffee for working, a
                trusted barber, motorbike repair, whatever you need.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => setInput(suggestion.query)}
                    className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  message.role === "user"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:ring-zinc-800"
                }`}
              >
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                <div className="flex space-x-1.5">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask me anything about Saigon..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-[15px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-800"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
