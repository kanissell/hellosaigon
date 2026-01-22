import { NextRequest, NextResponse } from "next/server";
import { parseIntent } from "@/lib/intent/parseIntent";
import { searchPlaces } from "@/lib/search/searchPlaces";
import { formatResponse } from "@/lib/response/formatResponse";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const message = typeof body?.message === "string" ? body.message : "";

  const intent = parseIntent(message);
  const places = searchPlaces(intent);
  const text = formatResponse(message, places);

  return NextResponse.json({
    text,
  });
}
