import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
	const body = await req.json()
	const cookieStore = await cookies();

	const sessionId = cookieStore.get("sessionId")?.value;
	
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	const sessions = db.collection("sessions");
	const session = await sessions.findOne({
		sessionId,
	});
	const user = session.username
	console.log(user);

	return Response.json({ ok: true });
}
