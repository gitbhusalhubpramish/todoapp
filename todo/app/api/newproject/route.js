import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
	const body = await req.json()
	
	const content = body
	const cookieStore = await cookies();

	const sessionId = cookieStore.get("sessionId")?.value;
	
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	const sessions = db.collection("sessions");
    const usrdta = db.collection("usrdata");
	const session = await sessions.findOne({
		sessionId,
	});
	const user = session.username
	console.log(user);
	if (!user){
		return Response.json(
			{ error: "user doesn't exists" },
			{ status: 403 }
		);
	}
	const project = {
		owner: user,
		createdAt: new Date(),
		likes: Array(),
		content,
	}
	console.log(JSON.stringify(project, null, 2));
	const projects = db.collection("projects")
	const existproject = await projects.findOne({
		owner: user,
		"content.title": content.title,
	});

	if (existproject) {
		return Response.json(
			{ error: "Project already exists" },
			{ status: 409 }
		);
	}
	
	await projects.insertOne(project)
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
	//console.log(projects)
	return Response.json({ ok: true });
}
