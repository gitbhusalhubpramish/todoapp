import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function getCurrentUser() {
  const sessionId = cookies().get("sessionId")?.value;

  if (!sessionId) return null;

  const db = (await clientPromise).db("app");

  const session = await db.collection("sessions").findOne({
    sessionId,
  });

  if (!session) {
    // invalidate cookie if session is fake
    cookies().set("sessionId", "", {
      maxAge: 0,
      path: "/",
    });

    return null;
  }

  return session;
}
