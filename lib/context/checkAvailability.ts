import type { Place } from "@/lib/data/places";

type AvailabilityResult = { available: boolean; reason?: string };

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function isClosedToday(place: Place, dayOfWeek: number): boolean {
  if (!place.closedDays || place.closedDays.length === 0) return false;
  const today = DAYS[dayOfWeek];
  return place.closedDays.some(
    (d) => d.toLowerCase() === today.toLowerCase()
  );
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function isOutsideHours(place: Place, currentTime: Date): boolean {
  if (!place.operatingHours) return false;

  const hours = place.operatingHours;
  const now = currentTime.getHours() * 60 + currentTime.getMinutes();
  const dayOfWeek = currentTime.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Handle "Mon-Fri HH:MM-HH:MM, Weekends HH:MM-HH:MM" format
  if (hours.includes(",")) {
    const parts = hours.split(",").map((s) => s.trim());
    for (const part of parts) {
      const isWeekendPart =
        part.toLowerCase().includes("weekend") ||
        part.toLowerCase().includes("sat") ||
        part.toLowerCase().includes("sun");
      const isWeekdayPart =
        part.toLowerCase().includes("mon") ||
        part.toLowerCase().includes("weekday");

      if ((isWeekend && isWeekendPart) || (!isWeekend && isWeekdayPart)) {
        const timeMatch = part.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (timeMatch) {
          const open = parseTime(timeMatch[1]);
          const close = parseTime(timeMatch[2]);
          return now < open || now > close;
        }
      }
    }
    return false;
  }

  // Simple "HH:MM-HH:MM" format
  const timeMatch = hours.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!timeMatch) return false;

  const open = parseTime(timeMatch[1]);
  const close = parseTime(timeMatch[2]);
  return now < open || now > close;
}

export function isSoldOut(place: Place, currentTime: Date): boolean {
  if (!place.sellsOutBy) return false;
  const now = currentTime.getHours() * 60 + currentTime.getMinutes();
  const sellsOut = parseTime(place.sellsOutBy);
  return now >= sellsOut;
}

export function checkAvailability(
  place: Place,
  currentTime: Date
): AvailabilityResult {
  const dayOfWeek = currentTime.getDay();

  if (isClosedToday(place, dayOfWeek)) {
    return {
      available: false,
      reason: `closed today (${DAYS[dayOfWeek]})`,
    };
  }

  if (isOutsideHours(place, currentTime)) {
    return {
      available: false,
      reason: `outside operating hours (${place.operatingHours})`,
    };
  }

  if (isSoldOut(place, currentTime)) {
    return {
      available: false,
      reason: `likely sold out (sells out by ${place.sellsOutBy})`,
    };
  }

  return { available: true };
}
