import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req, { params }) {
	//get target username
	const { username } = await params;
	
	//user auth
	const session = await getCurrentUser();
	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	
	if (session.username !== username){
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	
	//connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	//search user in database collection
	const user = await db.collection("usrdata").findOne(
		{ username },
		{ projection: { notifications: 1} }
	);
	
	//
	//format notification
	//
	
	const notifications = user.notifications
	
	//get username of activity dooers
	const allUsernames = notifications.flatMap(n => n.user);
	
	//search them in database collection for profile pic
	const usersData = await db.collection("usrdata")
		.find({ username: { $in: allUsernames } })
		.project({ username: 1, profilepic: 1 })
		.toArray();
	
	//map username and profilepic
	const userMap = {};
	for (const user of usersData) {
		userMap[user.username] = user.profilepic;
	}
	
	//update notification with maped username and profilepic
	const updatedNotifications = notifications.map(notification => ({
		...notification,
		user: notification.user.map(username => ({
			username,
			profilepic: userMap[username] || null
		}))
	}));
	
	//marked as read
	await db.collection("usrdata").updateOne(
		{ username },
		{
			$set: {
				"notifications.$[].isRead": true
			}
		}
	);
	
	return Response.json({updatedNotifications})
}
