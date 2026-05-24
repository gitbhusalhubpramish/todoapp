import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

// FOLLOW USER
export async function POST(req, { params }) {
	try {
		const session = await getCurrentUser();
		if (!session) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { username } = await params;

		if (session.username === username) {
			return Response.json(
				{ error: "Cannot follow yourself" },
				{ status: 400 }
			);
		}

		const client = await clientPromise;
		const db = client.db("projectdata");

		// check target user
		const targetUser = await db.collection("usrdata").findOne({ username });

		if (!targetUser) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		// check current user
		const currentUser = await db.collection("usrdata").findOne({
			username: session.username,
		});

		if (currentUser?.following?.includes(username)) {
			return Response.json(
				{ error: "Already following this user" },
				{ status: 400 }
			);
		}

		// -----------------------------
		// FOLLOW RELATIONSHIP (TOP INSERT)
		// -----------------------------

		// add to my following (TOP)
		await db.collection("usrdata").updateOne(
			{
				username: session.username,
				following: { $ne: username },
			},
			{
				$push: {
					following: {
						$each: [username],
						$position: 0,
					},
				},
			}
		);

		// add to target followers (TOP)
		await db.collection("usrdata").updateOne(
			{
				username,
				followers: { $ne: session.username },
			},
			{
				$push: {
					followers: {
						$each: [session.username],
						$position: 0,
					},
				},
			}
		);

		// -----------------------------
		// NOTIFICATION
		// -----------------------------

		const notification = {
			type: "follow",
			user: [session.username],
			entity: `/${username}/followers`,
			createdAt: new Date(),
			isRead: false,
		};

		const target = await db.collection("usrdata").findOne(
			{ username },
			{ projection: { notifications: { $slice: 1 } } }
		);

		const last = target?.notifications?.[0];

		// merge if same type
		if (last && last.type === "follow") {
			await db.collection("usrdata").updateOne(
				{
					username,
					"notifications.type": "follow",
				},
				{
					$addToSet: {
						"notifications.$.user": session.username,
					},
					$set: {
						"notifications.$.createdAt": new Date(),
						"notifications.$.isRead": false,
					},
				}
			);
		} else {
			// insert at TOP
			await db.collection("usrdata").updateOne(
				{ username },
				{
					$push: {
						notifications: {
							$each: [notification],
							$position: 0,
						},
					},
				}
			);
		}

		return Response.json({ success: true, following: true });
	} catch (err) {
		return Response.json({ error: "Server error" }, { status: 500 });
	}
}

// UNFOLLOW USER
export async function DELETE(req, { params }) {
	try {
		const session = await getCurrentUser();
		if (!session) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { username } = await params;
		const client = await clientPromise;
		const db = client.db("projectdata");

		const targetUser = await db.collection("usrdata").findOne({ username });

		if (!targetUser) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		const currentUser = await db.collection("usrdata").findOne({
			username: session.username,
		});

		if (!currentUser?.following?.includes(username)) {
			return Response.json(
				{ error: "Not following this user" },
				{ status: 400 }
			);
		}

		// remove from following
		await db.collection("usrdata").updateOne(
			{ username: session.username },
			{ $pull: { following: username } }
		);

		// remove from followers
		await db.collection("usrdata").updateOne(
			{ username },
			{ $pull: { followers: session.username } }
		);

		return Response.json({ success: true, following: false });
	} catch (err) {
		return Response.json({ error: "Server error" }, { status: 500 });
	}
}
