import { NextResponse } from "next/server";
import { getPlaces } from "@/lib/data/getPlaces";

export async function GET() {
  const places = getPlaces().filter((p) => p.verifiedByYou);
  return NextResponse.json(places);
}
