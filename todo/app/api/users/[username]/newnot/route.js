import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth.js";

export async function GET(req, { params }) {
	// get params
	const { username } = await params;

	// auth
	const session = await getCurrentUser();

	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (session.username !== username) {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	// db
	const client = await clientPromise;
	const db = client.db("projectdata");

	const user = await db.collection("usrdata").findOne(
		{ username },
		{ projection: { notifications: 1 } }
	);

	if (!user || !user.notifications || user.notifications.length === 0) {
		return Response.json({unread:false});
	}

	// last notification
	const lastNotification = user.notifications[user.notifications.length - 1];

	return Response.json({unread:!lastNotification.isRead});
}
