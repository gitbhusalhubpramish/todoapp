import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req, { params }) {
	const { username } = await params;
	
	const session = await getCurrentUser();
	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	
	if (session.username !== username){
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	const user = await db.collection("usrdata").findOne(
		{ username },
		{ projection: { notifications: 1} }
	);
	//const notification = user.notifications
	return Response.json({user})
}
