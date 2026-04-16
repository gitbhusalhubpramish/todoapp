import "server-only";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function getCurrentUser() {
	const cookieStore = await cookies();

	const sessionId = cookieStore.get("sessionId")?.value;
	
	if (!sessionId) return false;

	const client = await clientPromise;
    const db = client.db("projectdata");
	const sessions = db.collection("sessions");
	const session = await sessions.findOne({
		sessionId,
	});

	/*if (!session) {
		cookieStore.set("session", "", {
			maxAge: 0,
			path: "/",
		});

		return null;
	}*/
	console.log(session)

	return session ? session : false;
}
