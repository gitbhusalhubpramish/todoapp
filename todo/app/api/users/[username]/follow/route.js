import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

// FOLLOW
export async function POST(req, { params }) {
	try {
		const session = await getCurrentUser();
		if (!session) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const targetUsername = params.username;

		if (session.username === targetUsername) {
			return Response.json(
				{ error: "Cannot follow yourself" },
				{ status: 400 }
			);
		}

		const client = await clientPromise;
		const db = client.db("projectdata");

		await db.collection("usrdata").updateOne(
			{ username: session.username },
			{ $addToSet: { following: targetUsername } }
		);

		await db.collection("usrdata").updateOne(
			{ username: targetUsername },
			{ $addToSet: { followers: session.username } }
		);

		return Response.json({ success: true, following: true });
	} catch (err) {
		return Response.json({ error: "Server error" }, { status: 500 });
	}
}

// UNFOLLOW
export async function DELETE(req, { params }) {
	try {
		const session = await getCurrentUser();
		if (!session) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const targetUsername = params.username;

		const client = await clientPromise;
		const db = client.db("projectdata");

		await db.collection("usrdata").updateOne(
			{ username: session.username },
			{ $pull: { following: targetUsername } }
		);

		await db.collection("usrdata").updateOne(
			{ username: targetUsername },
			{ $pull: { followers: session.username } }
		);

		return Response.json({ success: true, following: false });
	} catch (err) {
		return Response.json({ error: "Server error" }, { status: 500 });
	}
}
