import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth.js";

export async function GET(){
	//get params
	const { username } = await params;

	//get cookies
	const session = await getCurrentUser();

	//permitinon validation
	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (session.username !== username) {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}
	
	//connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	//search user in database collection
	const user = await db.collection("usrdata").findOne(
		{ username },
		{ projection: { notifications: 1} }
	);
	
	return Response.json(user.notifications[-1].isRead)
}
