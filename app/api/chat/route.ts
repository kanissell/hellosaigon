import { NextRequest, NextResponse } from "next/server";
import { parseIntent } from "@/lib/intent/parseIntent";
import { searchPlaces, getAllPlaces } from "@/lib/search/searchPlaces";
import { chat } from "@/lib/llm/groq";
import { buildUserContext } from "@/lib/context/buildUserContext";
import { profileToContext } from "@/lib/profile/profileContext";
import { buildLearnedContext } from "@/lib/learning/buildLearnedContext";
import { extractTraits, mergeTraits } from "@/lib/learning/extractTraits";
import { getPlaces } from "@/lib/data/getPlaces";
import type { ChatMessage } from "@/lib/types/chat";
import type { RecommendationRecord } from "@/lib/memory/types";
import type { UserProfile } from "@/lib/types/userProfile";
import { analyzeHistory } from "@/lib/memory/analyzeHistory";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message : "";
    const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];
    const recommendationHistory: RecommendationRecord[] = Array.isArray(body?.recommendationHistory) ? body.recommendationHistory : [];
    const userProfile: UserProfile | undefined = body?.userProfile ?? undefined;

    // 1. Extract learned traits from user message
    const existingTraits = userProfile?.learnedTraits || [];
    const newTraits = extractTraits(message, existingTraits);
    const allTraits = newTraits.length > 0 ? mergeTraits(existingTraits, newTraits) : existingTraits;

    // 2. Load places with personal data from CSV
    const places = getPlaces();

    // 3. Parse user intent from the message
    const intent = parseIntent(message);

    // 4. Analyze recommendation history for smarter scoring
    const historyAnalysis = analyzeHistory(recommendationHistory, new Date());

    // 5. Search for relevant places based on intent + profile + history
    const hasSpecificIntent = intent.category || intent.district || intent.dogFriendly || intent.vibes;
    const relevantPlaces = hasSpecificIntent ? searchPlaces(intent, places, userProfile, historyAnalysis) : getAllPlaces(places);

    // 6. Build full context: profile + learned traits + recommendation history
    const userContext = buildUserContext(recommendationHistory, new Date(), places);
    const profileContext = userProfile ? profileToContext(userProfile) : "";
    const learnedContext = buildLearnedContext(allTraits);
    const fullContext = [profileContext, learnedContext, userContext].filter(Boolean).join("\n\n");

    // 7. Generate response
    const responseText = await chat(message, history, relevantPlaces, fullContext);

    return NextResponse.json({
      text: responseText,
      updatedTraits: newTraits.length > 0 ? allTraits : undefined,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { text: "Sorry, something went wrong. Try again?" },
      { status: 500 }
    );
  }
}
