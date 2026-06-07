import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req, { params }) {
	//get target user
	const { username } = await params;
	
	//user auth
	const session = await getCurrentUser();
	if (session?.username !== username) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	//connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	//fetch data
	const user = await db.collection("usrdata").findOne(
		{username},
		{
			projection: {
				username: 1,
				profilepic: 1,
				bio: 1,
				projects: 1,
			},
		}
	)
	
	//validation
	if (!user){
		return Response.json({ error: "user not found" }, { status: 404 });
	}
	return Response.json(user)
}
