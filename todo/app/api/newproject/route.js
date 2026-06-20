import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
	//get and format request data
	const body = await req.json()
	const content = body
	
	//get cookies
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("sessionId")?.value;
	
	//connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	//check session
	const sessions = db.collection("sessions");
	const usrdta = db.collection("usrdata");
	const session = await sessions.findOne({
		sessionId,
	});
	
	//verify session
	const user = session.username
	if (!user){
		return Response.json(
			{ error: "user doesn't exists" },
			{ status: 403 }
		);
	}
	
	//project skull
	const project = {
		owner: user,
		createdAt: new Date(),
		likes: Array(),
		content,
	}
	
	//search for existing project
	const projects = db.collection("projects")
	const existproject = await projects.findOne({
		owner: user,
		"content.title": content.title,
	});

	//throw error if project exist
	if (existproject) {
		return Response.json(
			{ error: "Project already exists" },
			{ status: 409 }
		);
	}
	
	//add project
	await projects.insertOne(project)
	
	//add porject to usrdata collections
	await usrdta.updateOne(
		{ username: project.owner },
		{
			$push: {
				projects: {
					projectId: project._id,
					title: project.content.title
				}
			}
		}
	);
	
	return Response.json({ ok: true });
}
