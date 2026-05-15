import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req, {params}){
	const {username} = await params;
	
	const session = await getCurrentUser();
	if (session?.username !== username) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	
	const body = await req.json();
	const { projects } = body;
	
	console.log(projects)
	
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	await db.collection("usrdata").updateMany(
		{ username },
		{
			$pull: {
				projects: { title: { $in: projects } }
			}
		}
	);
	
	const projectDocs = await db.collection("projects").find({
		owner: username,
		"content.title": {$in: projects},
	}).toArray()
	if (projectDocs.length === 0){
		return Response.json({error:"project not found in database collections"},{status:404})
	}
	const likedusers = projectDocs.flatMap(p => p.likes || []);
	
	const formatpro = projects.map(p => `${username}/${p}`)
	
	await db.collection("usrdata").updateMany(
		{ username: { $in: likedusers } },
		{
			$pull:{likedprojects: {$in: formatpro}}
		}
	)
	
	await db.collection("projects").deleteMany({
		owner: username,
		"content.title": {$in: projects},
	});
	
	return Response.json( {status:200})
}
