import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
	const body = await req.json()
	
	const content = body
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
	const project = {
		owner: user,
		createdAt: new Date(),
		likes: Array(),
		content,
	}
	console.log(JSON.stringify(project, null, 2));
	projects = db.collection("projects")
	await projects.insertOne(project)
	console.log(projects)
	return Response.json({ ok: true });
}
