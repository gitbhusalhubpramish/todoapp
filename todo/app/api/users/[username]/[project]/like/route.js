import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth.js";

export async function POST(req, { params }) {
	const { username, project } = await params;

	const session = await getCurrentUser();

	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (session.username === username) {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	const client = await clientPromise;
	const db = client.db("projectdata");

	// check user
	const user = await db.collection("usrdata").findOne({
		username: session.username,
	});

	if (!user) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}

	// check project
	const doc = await db.collection("projects").findOne({
		owner: username,
		"content.title": project,
	});

	if (!doc) {
		return Response.json({ error: "Project not found" }, { status: 404 });
	}

	// already liked
	if (doc.likes?.includes(session.username)) {
		return Response.json({ error: "Already liked" }, { status: 409 });
	}

	// add like to project
	await db.collection("projects").updateOne(
		{ _id: doc._id },
		{
			$addToSet: { likes: session.username },
		}
	);

	// add to user's liked projects
	await db.collection("usrdata").updateOne(
		{ username: session.username },
		{
			$addToSet: {
				likedprojects: `${username}/${project}`,
			},
		}
	);

	// -----------------------------
	// NOTIFICATION LOGIC (FIXED)
	// -----------------------------

	const notification = {
		type: "like",
		user: [session.username],
		entity: `/${username}/${project}`,
		createdAt: new Date(),
		isRead: false,
	};

	const targetUser = await db.collection("usrdata").findOne(
		{ username },
		{ projection: { notifications: { $slice: 1 } } } 
	);

	const last = targetUser?.notifications?.[0];

	// if same type + same entity → merge
	if (
		last &&
		last.type === "like" &&
		last.entity === notification.entity
	) {
		await db.collection("usrdata").updateOne(
			{
				username,
				"notifications.entity": notification.entity,
				"notifications.type": "like",
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
		// insert NEW notification at TOP
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

	return Response.json(
		{ ok: true, message: "Project liked" },
		{ status: 200 }
	);
}

export async function DELETE(req, { params }) {
	const { username, project } = await params;

	const session = await getCurrentUser();

	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (session.username === username) {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	const client = await clientPromise;
	const db = client.db("projectdata");

	const user = await db.collection("usrdata").findOne({
		username: session.username,
	});

	if (!user) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}

	const doc = await db.collection("projects").findOne({
		owner: username,
		"content.title": project,
	});

	if (!doc) {
		return Response.json({ error: "Project not found" }, { status: 404 });
	}

	if (!doc.likes?.includes(session.username)) {
		return Response.json(
			{ error: "Project not liked yet" },
			{ status: 409 }
		);
	}

	await db.collection("projects").updateOne(
		{ _id: doc._id },
		{
			$pull: { likes: session.username },
		}
	);

	await db.collection("usrdata").updateOne(
		{ username: session.username },
		{
			$pull: {
				likedprojects: `${username}/${project}`,
			},
		}
	);

	return Response.json(
		{ ok: true, message: "Like removed" },
		{ status: 200 }
	);
}
