import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = await cookieStore.get("sessionId")?.value;

  if (sessionId) {
    const client = await clientPromise;
    const db = client.db("projectdata"); // change if needed

    const sessions = db.collection("sessions");

    await sessions.deleteOne({ sessionId });
  }

  cookieStore.set("sessionId", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return NextResponse.json({ success: true });
}
