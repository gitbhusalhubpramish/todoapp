import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth.js";

export async function POST(req, { params }) {
	const { username, project } = await params;

	const session = await getCurrentUser();

	if (!session) {
		return Response.json(
			{ error: "Unauthorized" },
			{ status: 401 }
		);
	}

	if (session.username === username) {
		return Response.json(
			{ error: "Forbidden" },
			{ status: 403 }
		);
	}

	const client = await clientPromise;
	const db = client.db("projectdata");

	// check current user exists
	const user = await db.collection("usrdata").findOne({
		username: session.username,
	});

	if (!user) {
		return Response.json(
			{ error: "User not found" },
			{ status: 404 }
		);
	}

	// check target project exists
	const doc = await db.collection("projects").findOne({
		owner: username,
		"content.title": project,
	});

	if (!doc) {
		return Response.json(
			{ error: "Project not found" },
			{ status: 404 }
		);
	}

	// prevent double like
	if (doc.likes?.includes(session.username)) {
		return Response.json(
			{ error: "Already liked" },
			{ status: 409 }
		);
	}

	// add like to project
	await db.collection("projects").updateOne(
		{ _id: doc._id },
		{
			$addToSet: {
				likes: session.username,
			},
		}
	);

	// add liked project to user
	await db.collection("usrdata").updateOne(
		{ username: session.username },
		{
			$addToSet: {
				likedprojects: `${username}/${project}`,
			},
		}
	);
	
	const targetUser = await db.collection("usrdata").findOne({
		username,
	});

	let notifications = targetUser?.notifications || [];

	const last = notifications.length
		? notifications[notifications.length - 1]
		: null;

	if (last && last.type === "like") {
		// 🔥 MERGE INTO LAST LIKE NOTIFICATION
		const updatedUsers = Array.isArray(last.user)
			? Array.from(new Set([...last.user, session.username]))
			: [session.username];

		notifications[notifications.length - 1] = {
			...last,
			user: updatedUsers,
			createdAt: new Date(),
			isRead: false,
		};
	} else {
		// 🆕 NEW LIKE NOTIFICATION
		notifications.push({
			type: "like",
			user: [session.username],
			entity: `/${username}/${project}`,
			project,
			createdAt: new Date(),
			isRead: false,
		});
	}

	await db.collection("usrdata").updateOne(
		{ username },
		{ $set: { notifications } }
	);

	return Response.json(
		{ ok: true, message: "Project liked" },
		{ status: 200 }
	);
}

export async function DELETE(req, { params }) {
	const { username, project } = await params;

	const session = await getCurrentUser();

	if (!session) {
		return Response.json(
			{ error: "Unauthorized" },
			{ status: 401 }
		);
	}

	if (session.username === username) {
		return Response.json(
			{ error: "Forbidden" },
			{ status: 403 }
		);
	}

	const client = await clientPromise;
	const db = client.db("projectdata");

	// check current user exists
	const user = await db.collection("usrdata").findOne({
		username: session.username,
	});

	if (!user) {
		return Response.json(
			{ error: "User not found" },
			{ status: 404 }
		);
	}

	// check target project exists
	const doc = await db.collection("projects").findOne({
		owner: username,
		"content.title": project,
	});

	if (!doc) {
		return Response.json(
			{ error: "Project not found" },
			{ status: 404 }
		);
	}

	// ensure user already liked
	if (!doc.likes?.includes(session.username)) {
		return Response.json(
			{ error: "Project not liked yet" },
			{ status: 409 }
		);
	}

	// remove like from project
	await db.collection("projects").updateOne(
		{ _id: doc._id },
		{
			$pull: {
				likes: session.username,
			},
		}
	);

	// remove liked project from user
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
