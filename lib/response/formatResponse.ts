type Place = {
  id: string;
  name: string;
  category: "coffee" | "restaurant" | "bar" | "attraction";
  district: string;
  lat: number;
  lng: number;
  isOpen: boolean;
  insiderTip: string;
};

export function formatResponse(userMessage: string, places: Place[]): string {
  const trimmed = userMessage.trim();

  const intro = trimmed
    ? `Nice question. Based on what you asked ("${trimmed}"), here are a few local spots you might like:`
    : "Nice one. Here are a few Saigon spots locals actually go to:";

  if (!places.length) {
    return (
      intro +
      "\n\n- I don't have a specific spot to point you to right now, but wandering around District 1 with a coffee in hand is still a solid move."
    );
  }

  const lines = places.map((place) => {
    return `- ${place.name} (${place.district}) — ${place.insiderTip}`;
  });

  return [intro, "", ...lines].join("\n");
}
