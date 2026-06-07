import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req, {params}){
	//get target username
	const {username} = await params;
	
	//user auth
	const session = await getCurrentUser();
	if (session?.username !== username) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	
	//get req
	const body = await req.json();
	const { projects } = body;
	
	console.log(projects)
	
	//connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	//update target user collection
	await db.collection("usrdata").updateMany(
		{ username },
		{
			$pull: {
				projects: { title: { $in: projects } }
			}
		}
	);
	
	//fetch project form project collection
	const projectDocs = await db.collection("projects").find({
		owner: username,
		"content.title": {$in: projects},
	}).toArray()
	
	//project collection validation
	if (projectDocs.length === 0){
		return Response.json({error:"project not found in database collections"},{status:404})
	}
	
	//get users who liken the projects
	const likedusers = projectDocs.flatMap(p => p.likes || []);
	
	//format as it is stored
	const formatpro = projects.map(p => `${username}/${p}`)
	
	//delete project form others liked collectioin
	await db.collection("usrdata").updateMany(
		{ username: { $in: likedusers } },
		{
			$pull:{likedprojects: {$in: formatpro}}
		}
	)
	
	//delete project
	await db.collection("projects").deleteMany({
		owner: username,
		"content.title": {$in: projects},
	});
	
	return Response.json( {status:200})
}
