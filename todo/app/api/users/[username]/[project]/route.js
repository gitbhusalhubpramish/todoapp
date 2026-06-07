import clientPromise from "@/lib/mongodb";
import {getCurrentUser} from "@/lib/auth.js"

//get project data
export async function GET(req, { params }) {
	//get target user and project
	const { username, project } = await params;

	//connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");

	//search for project in database collection
	const projectData = await db.collection("projects").findOne({
		owner: username,
		"content.title": project
	});

	//get target user profilepic
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
	
	//validation
	if (!user || !projectData){
		return Response.json({error: "user or project not found"}, {status: 404})
	}

	//profilepic val
	projectData.profilepic = user?.profilepic || null;

	return Response.json({
		project: projectData
	});
}

//change done status
export async function PATCH(req, { params }) {
	//get target username and project
	const { username, project } = await params;
	
	//get task index
	const { taskIndex } = await req.json();
	
	//session validation
	const session = await getCurrentUser()
	if (session.username !== username){
		return Response.json({error: "Forbidden"}, {status: 403})
	}

	//connect to database collection
	const client = await clientPromise;
	const db = client.db("projectdata");
	console.log(username, project)

	//get project form database collection
	const doc = await db.collection("projects").findOne({
		owner: username,
		"content.title": project
	});

	//validation
	if (!doc) {
		return Response.json({ error: "Not found" }, { status: 404 });
	}

	//task validation
	const tasks = doc.content.tasks;
	if (!tasks?.[taskIndex]) {
		return Response.json({ error: "Invalid task" }, { status: 400 });
	}

	// toggle isDone
	tasks[taskIndex].isdone = !tasks[taskIndex].isdone;
	const allDone = tasks.every((t) => t.isdone === true);

	//update data
	await db.collection("projects").updateOne(
		{ _id: doc._id },
		{
			$set: {
				"content.tasks": tasks,
				"content.isdone": allDone,
			},
		}
	);

	return Response.json({
		updatedTasks: tasks,
		projectDone: allDone,
	});
}
