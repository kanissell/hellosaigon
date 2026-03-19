import { NextRequest, NextResponse } from "next/server";
import { parseIntent } from "@/lib/intent/parseIntent";
import { searchPlaces, getAllPlaces } from "@/lib/search/searchPlaces";
import { chat } from "@/lib/llm/groq";
import { buildUserContext } from "@/lib/context/buildUserContext";
import { getPlaces } from "@/lib/data/getPlaces";
import type { ChatMessage } from "@/lib/types/chat";
import type { RecommendationRecord } from "@/lib/memory/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message : "";
    const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];
    const recommendationHistory: RecommendationRecord[] = Array.isArray(body?.recommendationHistory) ? body.recommendationHistory : [];

    // 1. Load places with personal data from CSV
    const places = getPlaces();

    // 2. Parse user intent from the message
    const intent = parseIntent(message);

    // 3. Search for relevant places based on intent
    const hasSpecificIntent = intent.category || intent.district || intent.dogFriendly || intent.vibes;
    const relevantPlaces = hasSpecificIntent ? searchPlaces(intent, places) : getAllPlaces(places);

    // 4. Build user context from recommendation history
    const userContext = buildUserContext(recommendationHistory, new Date(), places);

    // 5. Generate response using Groq LLM with places + user context
    const responseText = await chat(message, history, relevantPlaces, userContext);

    return NextResponse.json({
      text: responseText,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { text: "Sorry, something went wrong. Try again?" },
      { status: 500 }
    );
  }
}
