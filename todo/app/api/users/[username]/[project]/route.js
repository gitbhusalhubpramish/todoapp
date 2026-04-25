import clientPromise from "@/lib/mongodb";
import {getCurrentUser} from "@/lib/auth.js"

export async function GET(req, { params }) {
	const { username, project } = await params;

	const client = await clientPromise;
	const db = client.db("projectdata");

	const projectData = await db.collection("projects").findOne({
		owner: username,
		"content.title": project
	});

	const user = await db.collection("usrdata").findOne(
		{ username },
		{
			projection: {
				profilepic: 1,
				username: 1,
				_id: 0
			}
		}
	);
	if (!user || !projectData){
		return Response.json({error: "user or project not found"}, {status: 404})
	}

	projectData.profilepic = user?.profilepic || null;

	return Response.json({
		project: projectData
	});
}
export async function PATCH(req, { params }) {
	const { username, project } = await params;
	const { taskIndex } = await req.json();
	
	const session = await getCurrentUser()
	if (session.username !== username){
		return Response.json({error: "Unathorized"}, {status: 401})
	}

	const client = await clientPromise;
	const db = client.db("projectdata");
	console.log(username, project)

	const doc = await db.collection("projects").findOne({
		owner: username,
		"content.title": project
	});

	if (!doc) {
		return Response.json({ error: "Not found" }, { status: 404 });
	}

	const tasks = doc.content.tasks;

	// toggle isDone
	tasks[taskIndex].isDone = !tasks[taskIndex].isDone;

	await db.collection("projects").updateOne(
		{ _id: doc._id },
		{
			$set: {
				"content.tasks": tasks,
			},
		}
	);

	return Response.json({
		updatedTasks: tasks,
	});
}
