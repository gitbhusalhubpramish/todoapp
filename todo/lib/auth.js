import "server-only";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function getCurrentUser() {
	const cookieStore = await cookies();

	const sessionId = cookieStore.get("session")?.value;

	if (!sessionId) return false;

	const db = (await clientPromise).db("app");

	const session = await db.collection("sessions").findOne({
		sessionId,
	});

	/*if (!session) {
		cookieStore.set("session", "", {
			maxAge: 0,
			path: "/",
		});

		return null;
	}*/
	console.log("fake login")

	return session ? session : false;
}
