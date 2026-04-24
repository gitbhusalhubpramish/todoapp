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
			username: username,
		});

		if (!targetUser) {
			return Response.json(
				{ error: "User not found" },
				{ status: 404 }
			);
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

		// ❌ already following
		if (currentUser?.following?.includes(username)) {
			return Response.json(
				{ error: "Already following this user" },
				{ status: 400 }
			);
		}

		await db.collection("usrdata").updateOne(
			{ username: session.username },
			{ $addToSet: { following: username } }
		);

		await db.collection("usrdata").updateOne(
			{ username: username },
			{ $addToSet: { followers: session.username } }
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
			username: username,
		});

		if (!targetUser) {
			return Response.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}


		const currentUser = await db.collection("usrdata").findOne({
			username: session.username,
		});

		// ❌ not following
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
			{ username: username },
			{ $pull: { followers: session.username } }
		);

		return Response.json({ success: true, following: false });
	} catch (err) {
		return Response.json({ error: "Server error" }, { status: 500 });
	}
}
