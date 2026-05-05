import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req, { params }) {
	const { username } = await params;
	
	const session = await getCurrentUser();
	if (session?.username !== username) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const client = await clientPromise;
	const db = client.db("projectdata");
	
	const user = db.collection("usrdata").findOne(
		{username},
		{
			projection: {
				username: 1,
				profilepic: 1,
				bio: 1,
				projects: 1,
				_id: 0,
				notifications: 0,
				userId: 0
			},
		}
	)
	return Responce.json(user)
}
