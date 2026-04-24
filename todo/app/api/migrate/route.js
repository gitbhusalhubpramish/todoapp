import clientPromise from "@/lib/mongodb";

// ONE-TIME MIGRATION: CLEAN FOLLOW DATA
export async function GET() {
	try {
		const client = await clientPromise;
		const db = client.db("projectdata");
		const users = db.collection("usrdata");

		const allUsers = await users.find({}).toArray();

		// valid usernames set
		const validUsernames = new Set(
			allUsers.map((u) => u.username).filter(Boolean)
		);

		let updatedCount = 0;

		for (const user of allUsers) {
			const following = user.following || [];
			const followers = user.followers || [];

			const cleanFollowing = following.filter(
				(u) =>
					typeof u === "string" &&
					u &&
					validUsernames.has(u) &&
					u !== user.username
			);

			const cleanFollowers = followers.filter(
				(u) =>
					typeof u === "string" &&
					u &&
					validUsernames.has(u) &&
					u !== user.username
			);

			// only update if changed
			if (
				cleanFollowing.length !== following.length ||
				cleanFollowers.length !== followers.length
			) {
				await users.updateOne(
					{ _id: user._id },
					{
						$set: {
							following: cleanFollowing,
							followers: cleanFollowers,
						},
					}
				);
				updatedCount++;
			}
		}

		return Response.json({
			success: true,
			message: "Migration completed",
			updatedUsers: updatedCount,
		});
	} catch (err) {
		console.error(err);
		return Response.json(
			{ error: "Migration failed" },
			{ status: 500 }
		);
	}
}
