import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth.js";

export async function GET(){
	const { username, project } = await params;

	const session = await getCurrentUser();

	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (session.username !== username) {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}
	
	
}
