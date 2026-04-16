// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const sessionId = req.cookies.get("sessionId")?.value;

  if (!sessionId) return NextResponse.next();

  // only mark for validation (actual DB check in API)
  return NextResponse.next();
}
