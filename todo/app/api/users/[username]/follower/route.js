import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
	//get target username
	const { username } = await params;

	//connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	//get target user form database collection
	const user = await db.collection("usrdata").findOne(
		{ username },
		{ projection: { followers: 1, profilepic:1, following:1 } }
	);
	
	//validation
	if (!user) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}

	//look for follower
	const followerUsernames = user.followers || [];

	// 2. Fetch all followers in ONE query
	const followersData = await db
		.collection("usrdata")
		.find(
			{ username: { $in: followerUsernames } },
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
		followers: followersData,
	});
}
