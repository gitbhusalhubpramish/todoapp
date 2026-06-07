import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
	//get target username
	const { username } = await params;

	//connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	//search for target user in db collection
	const user = await db.collection("usrdata").findOne(
		{ username },
		{ projection: { followers: 1, profilepic:1, following:1 } }
	);
	
	//validation
	if (!user) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}

	//get following users
	const followingUsernames = user.following || [];

	// 2. Fetch all followers in ONE query
	const followingData = await db
		.collection("usrdata")
		.find(
			{ username: { $in: followingUsernames } },
			{
				projection: {
					username: 1,
					profilepic: 1,
					bio: 1,
					_id: 0,
				},
			}
		)
		.toArray();

	// 3. Return clean structure
	return Response.json({
		user,
		following: followingData,
	});
}
