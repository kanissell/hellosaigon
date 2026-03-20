"use client";

import type { Place } from "@/lib/data/places";
import PlaceCard from "./PlaceCard";
import TypewriterText from "./TypewriterText";

type Props = {
  text: string;
  referencedPlaces: Place[];
  onPlaceEngage?: (placeId: string) => void;
  animate?: boolean;
};

export default function MessageContent({ text, referencedPlaces, onPlaceEngage, animate = false }: Props) {
  return (
    <div>
      <p className="text-[15px] leading-relaxed">
        <TypewriterText text={text} animate={animate} />
      </p>
      {referencedPlaces.length > 0 && (
        <div className="mt-3 space-y-2">
          {referencedPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              compact
              onNavigate={() => onPlaceEngage?.(place.id)}
              onCall={() => onPlaceEngage?.(place.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
