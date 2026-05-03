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
		const client = await clientPromise;
		const db = client.db("projectdata");

		const targetUser = await db.collection("usrdata").findOne({
			username,
		});

		if (!targetUser) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		if (session.username === username) {
			return Response.json(
				{ error: "Cannot follow yourself" },
				{ status: 400 }
			);
		}

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
		// FOLLOW RELATION UPDATE
		// -----------------------------
		await db.collection("usrdata").updateOne(
			{ username: session.username },
			{ $addToSet: { following: username } }
		);

		await db.collection("usrdata").updateOne(
			{ username },
			{ $addToSet: { followers: session.username } }
		);

		// -----------------------------
		// NOTIFICATIONS (SAFE VERSION)
		// -----------------------------
		const target = await db.collection("usrdata").findOne({ username });

		let notifications = target?.notifications || [];

		const last = notifications.length
			? notifications[notifications.length - 1]
			: null;

		if (last && last.type === "follow") {
			// merge into last notification
			const updatedUserList = Array.isArray(last.user)
				? Array.from(new Set([...last.user, session.username]))
				: [session.username];

			notifications[notifications.length - 1] = {
				...last,
				user: updatedUserList,
				createdAt: new Date(),
			};
		} else {
			// new notification
			notifications.push({
				type: "follow",
				user: [session.username],
				entity: `/${username}/followers`,
				createdAt: new Date(),
				isRead: false,
			});
		}

		await db.collection("usrdata").updateOne(
			{ username },
			{ $set: { notifications } }
		);

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

		const targetUser = await db.collection("usrdata").findOne({
			username,
		});

		if (!targetUser) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		const currentUser = await db.collection("usrdata").findOne({
			username: session.username,
		});

		if (!currentUser?.following?.includes(username)) {
			return Response.json(
				{ error: "You are not following this user" },
				{ status: 400 }
			);
		}

		await db.collection("usrdata").updateOne(
			{ username: session.username },
			{ $pull: { following: username } }
		);

		await db.collection("usrdata").updateOne(
			{ username },
			{ $pull: { followers: session.username } }
		);

		return Response.json({ success: true, following: false });
	} catch (err) {
		return Response.json({ error: "Server error" }, { status: 500 });
	}
}
