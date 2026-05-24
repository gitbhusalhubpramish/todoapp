import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
	const { username } = await params;

	const client = await clientPromise;
	const db = client.db("projectdata");
	
	const user = await db.collection("usrdata").findOne(
		{ username },
		{ projection: { followers: 1, profilepic:1, following:1 } }
	);
	if (!user) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}

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
