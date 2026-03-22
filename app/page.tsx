"use client";

import { FormEvent, useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage } from "@/lib/types/chat";
import { extractRecommendations } from "@/lib/memory/extractRecommendations";
import type { RecommendationRecord } from "@/lib/memory/types";
import type { UserProfile, LearnedTrait } from "@/lib/types/userProfile";
import { LS_PROFILE_KEY } from "@/lib/types/userProfile";
import type { Place } from "@/lib/data/places";
import OnboardingModal from "@/components/OnboardingModal";
import PlaceCard from "@/components/PlaceCard";
import MessageContent from "@/components/MessageContent";
import HUDHeader from "@/components/HUDHeader";
import ScanningLoader from "@/components/ScanningLoader";
import { generateSmartCards } from "@/lib/cards/generateSmartCards";
import { parsePlaceReferences } from "@/lib/message/parsePlaceReferences";
import VoiceButton from "@/components/VoiceButton";
import LearnedTraitsPanel from "@/components/LearnedTraitsPanel";

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

function getGreeting(profile: UserProfile | null): { heading: string; sub: string } {
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (!profile) {
    return {
      heading: `${timeGreet}. I'm your local Saigon concierge.`,
      sub: "Here's what I'd suggest right now:",
    };
  }

  const traits = profile.learnedTraits || [];
  const locationTrait = traits.find((t) => t.category === "location");
  const prefTrait = traits.find((t) => t.category === "preferences" || t.category === "dietary");

  if (locationTrait || prefTrait) {
    const parts: string[] = [`${timeGreet}.`];
    if (prefTrait) parts.push(`Since you ${prefTrait.value.toLowerCase()},`);
    parts.push("here's what looks good right now:");
    return {
      heading: `Welcome back.`,
      sub: parts.join(" "),
    };
  }

  return {
    heading: `${timeGreet}. Welcome back.`,
    sub: "Here's what I'd suggest right now:",
  };
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [smartCards, setSmartCards] = useState<Place[]>([]);
  const [placeRefs, setPlaceRefs] = useState<Map<number, Place[]>>(new Map());
  const [latestAssistantIdx, setLatestAssistantIdx] = useState(-1);
  const [showTraits, setShowTraits] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recsRef = useRef<RecommendationRecord[]>([]);

  useEffect(() => {
    recsRef.current = loadRecs();
    setMessages(loadChat());
    try {
      const raw = localStorage.getItem(LS_PROFILE_KEY);
      if (raw) {
        setProfile(JSON.parse(raw));
      } else {
        setShowOnboarding(true);
      }
    } catch {
      setShowOnboarding(true);
    }
    setHydrated(true);

    fetch("/api/places")
      .then((r) => r.json())
      .then((places: Place[]) => {
        setAllPlaces(places);
        const savedMsgs = loadChat();
        const refs = new Map<number, Place[]>();
        savedMsgs.forEach((msg, i) => {
          if (msg.role === "assistant") {
            const matched = parsePlaceReferences(msg.content, places);
            if (matched.length > 0) refs.set(i, matched);
          }
        });
        if (refs.size > 0) setPlaceRefs(refs);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (allPlaces.length > 0) {
      setSmartCards(generateSmartCards(allPlaces, profile, recsRef.current));
    }
  }, [allPlaces, profile]);

  const handlePlaceEngage = useCallback((placeId: string) => {
    const recs = recsRef.current;
    let updated = false;
    for (let i = recs.length - 1; i >= 0; i--) {
      if (recs[i].placeId === placeId && !recs[i].engaged) {
        recs[i].engaged = true;
        updated = true;
        break;
      }
    }
    if (updated) {
      recsRef.current = saveRecs(recs);
    }
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

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setInput("");

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveChat(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
          recommendationHistory: recsRef.current,
          userProfile: profile,
        }),
      });

      const data: { text: string; updatedTraits?: LearnedTrait[] } = await response.json();
      const assistantMessage: ChatMessage = { role: "assistant", content: data.text };

      // Persist learned traits
      if (data.updatedTraits && profile) {
        const updatedProfile = { ...profile, learnedTraits: data.updatedTraits };
        setProfile(updatedProfile);
        localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(updatedProfile));
      }

      const newRecs = extractRecommendations(data.text);
      if (newRecs.length > 0) {
        recsRef.current = saveRecs([...recsRef.current, ...newRecs]);
      }

      const withAssistant = [...newMessages, assistantMessage];
      setMessages(withAssistant);
      saveChat(withAssistant);
      setLatestAssistantIdx(withAssistant.length - 1);

      if (allPlaces.length > 0) {
        const refs = parsePlaceReferences(data.text, allPlaces);
        if (refs.length > 0) {
          setPlaceRefs((prev) => new Map(prev).set(withAssistant.length - 1, refs));
        }
      }
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
  const greeting = getGreeting(profile);

  return (
    <div className="relative flex min-h-screen flex-col" style={{ zIndex: 1 }}>
      {showOnboarding && (
        <OnboardingModal
          onComplete={(p) => {
            setProfile(p);
            setShowOnboarding(false);
          }}
        />
      )}

      {/* Learned Traits Panel */}
      {showTraits && profile && (
        <LearnedTraitsPanel
          profile={profile}
          onUpdate={setProfile}
          onClose={() => setShowTraits(false)}
        />
      )}

      {/* JARVIS HUD Header */}
      <div className="safe-top">
        <HUDHeader onSettingsClick={() => setShowTraits(true)} />
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {hydrated && messages.length === 0 && (
            <div className="py-8">
              <p className="mb-1 text-lg font-medium text-foreground">
                {greeting.heading}
              </p>
              <p className="mb-6 text-sm text-cyan-600 dark:text-cyan-500/50">
                {greeting.sub}
              </p>

              {smartCards.length > 0 && (
                <div className="mb-6 grid gap-3">
                  {smartCards.map((place, i) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      animationDelay={i * 0.12}
                      onClick={() =>
                        setInput(`Tell me more about ${place.name}`)
                      }
                    />
                  ))}
                </div>
              )}

              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-600/40 dark:text-cyan-500/30">
                Or ask me about
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => setInput(suggestion.query)}
                    className="chip rounded-full px-4 py-2 text-sm text-foreground/70 hover:text-cyan-400"
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
              className={`msg-appear flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-cyan-500 to-teal-600 text-white"
                    : "glass-card text-foreground"
                }`}
              >
                {message.role === "assistant" ? (
                  <MessageContent
                    text={message.content}
                    referencedPlaces={placeRefs.get(index) || []}
                    onPlaceEngage={handlePlaceEngage}
                    animate={index === latestAssistantIdx}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {message.content}
                  </p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="msg-appear flex justify-start">
              <div className="max-w-[85%]">
                <ScanningLoader />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="hud-border-top safe-bottom px-4 py-4" style={{ zIndex: 10 }}>
        <form
          onSubmit={handleSubmit}
          className="glow-border mx-auto flex max-w-2xl gap-2 rounded-xl bg-background/50 p-1.5 backdrop-blur-sm"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask me anything about Saigon..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none placeholder:text-cyan-700/30 dark:placeholder:text-cyan-500/25 disabled:opacity-50"
          />
          <VoiceButton onTranscript={setInput} disabled={isLoading} />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`btn-accent rounded-lg px-5 py-2.5 text-[15px] ${
              input.trim() && !isLoading ? "btn-accent-pulse" : ""
            }`}
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
