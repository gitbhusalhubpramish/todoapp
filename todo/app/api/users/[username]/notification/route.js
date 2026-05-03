import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req, { params }) {
	const { username } = await params;
	
	const session = await getCurrentUser();
	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	
	if (session.username !== username){
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	const user = await db.collection("usrdata").findOne(
		{ username },
		{ projection: { notifications: 1} }
	);
	
	const notifications = user.notifications
	
	const allUsernames = notifications.flatMap(n => n.user);
	const usersData = await db.collection("usrdata")
		.find({ username: { $in: allUsernames } })
		.project({ username: 1, profilepic: 1 })
		.toArray();
	
	const userMap = {};
	for (const user of usersData) {
		userMap[user.username] = user.profilepic;
	}
	
	const updatedNotifications = notifications.map(notification => ({
		...notification,
		user: notification.user.map(username => ({
			username,
			profilepic: userMap[username] || null
		}))
	}));
	
	return Response.json({updatedNotifications})
}
