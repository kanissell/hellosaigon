import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "@/lib/prompt/systemPrompt";
import type { ScoredPlace } from "@/lib/search/searchPlaces";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function formatPlacesForContext(places: ScoredPlace[]): string {
  if (places.length === 0) {
    return "No places in database yet.";
  }

  return places
    .map((place) => {
      const lines: string[] = [
        "---",
        `Name: ${place.name}`,
        `Category: ${place.category} (${place.subcategory})`,
        `District: ${place.district}`,
        `Address: ${place.address}`,
      ];

      if (place._distanceKm !== undefined) {
        const mins = Math.round(place._distanceKm * 3); // ~20km/h on bike in Saigon traffic
        lines.push(`Distance from user: ${place._distanceKm}km (~${mins} min by bike)`);
      }
      if (place._inRequestedDistrict === false) {
        lines.push(`Note: NOT in the user's requested district`);
      }

      if (place.hemAddress) lines.push(`Hem/Alley: ${place.hemAddress}`);
      if (place.googleMapsUrl) lines.push(`Google Maps: ${place.googleMapsUrl}`);

      lines.push(`Personal Rating: ${place.personalRating}/10`);
      lines.push(`Insider Notes: ${place.personalNotes}`);
      lines.push(`What to Order: ${place.signatureItem}`);

      if (place.insiderTip) lines.push(`Insider Tip: ${place.insiderTip}`);

      lines.push(`Vibes: ${place.vibes.join(", ")}`);

      if (place.bestTime) lines.push(`Best Time: ${place.bestTime.join(", ")}`);

      lines.push(`Price Range: ${place.priceRange}`);
      lines.push(`Dog Friendly: ${place.dogFriendly ? "Yes" : "No"}`);

      if (place.acOrOutdoor) lines.push(`AC/Outdoor: ${place.acOrOutdoor}`);

      lines.push(`Cash Only: ${place.cashOnly ? "Yes" : "No"}`);

      if (place.acceptsMomo) lines.push(`Accepts MoMo: Yes`);

      lines.push(`Parking: ${place.parkingSituation}`);

      if (place.yearsOpen) lines.push(`Years Open: ${place.yearsOpen}`);
      if (place.menuSize) lines.push(`Menu Size: ${place.menuSize}`);
      if (place.operatingHours) lines.push(`Hours: ${place.operatingHours}`);
      if (place.closedDays) lines.push(`Closed: ${place.closedDays.join(", ")}`);
      if (place.sellsOutBy) lines.push(`Sells Out By: ${place.sellsOutBy}`);
      if (place.reservationNeeded) lines.push(`Reservation Needed: Yes`);

      if (place.bestFor) lines.push(`Best For: ${place.bestFor.join(", ")}`);
      if (place.phoneNumber) lines.push(`Phone: ${place.phoneNumber}`);
      if (place.instagramHandle) lines.push(`Instagram: ${place.instagramHandle}`);

      // Service-specific fields
      if (place.contactMethod) lines.push(`Contact Method: ${place.contactMethod}`);
      if (place.serviceArea) lines.push(`Service Area: ${place.serviceArea}`);
      if (place.priceExample) lines.push(`Price Example: ${place.priceExample}`);
      if (place.languagesSpoken) lines.push(`Languages: ${place.languagesSpoken.join(", ")}`);
      if (place.responseTime) lines.push(`Response Time: ${place.responseTime}`);

      if (place.lastVerified) lines.push(`Last Verified: ${place.lastVerified}`);

      lines.push("---");
      return lines.join("\n");
    })
    .join("\n");
}

export async function chat(
  userMessage: string,
  conversationHistory: ChatMessage[],
  relevantPlaces: ScoredPlace[],
  userContext?: string
): Promise<string> {
  const placesContext = formatPlacesForContext(relevantPlaces);

  const contextBlock = userContext ? `\n\n${userContext}\n` : "";

  const systemWithContext = `${SYSTEM_PROMPT}

## Your current database of places:
${placesContext}
${contextBlock}
Remember: ONLY recommend places from this database. If none of these fit what the user wants, say you don't have a good option yet.`;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [
      { role: "system", content: systemWithContext },
      ...conversationHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: userMessage },
    ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
}
