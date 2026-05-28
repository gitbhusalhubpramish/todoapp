import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
	const { username } = await params;

	const client = await clientPromise;
	const db = client.db("projectdata");

	const user = await db.collection("usrdata").findOne(
		{ username },
		{
			projection: {
				_id: 0,
				notifications: 0,
				userId: 0
			}
		}
	);
	const projects = await db.collection("projects").find({ owner: username }).toArray();

	const formattedProjects = projects.map(p => ({
		title: p.content?.title,
		description: p.content?.description,
		isdone: p.content?.isdone
	}));

	if (!user) {
		return Response.json(
			{ error: "user not found" },
			{ status: 404 }
		);
	}
	user.projects = formattedProjects
	
	const liked = user.likedprojects.map((item) => {
		const [owner, project] = item.split("/");
		return { owner, project };
	});
	
	console.log(liked)
	
	const likedpro = await db.collection("projects").find({
		"content.title": { $in: liked.map(p => p.project) },
		owner: { $in: liked.map(p => p.owner) }
	}).toArray()
	
	console.log(likedpro)
	
	const users = await db.collection("usrdata").find({
		username: { $in: likedpro.map(p => p.owner) }
	}).toArray()

	console.log(users)
	
	const userMap = Object.fromEntries(
		users.map(u => [u.username, u.profilepic])
	);
	
	console.log(userMap)
	
	const result = likedpro.map(p => ({
		owner: p.owner,
		profilepic: userMap[p.owner],
		content: {
			title: p.content.title,
			description: p.content.description
		}
	}));
	
	console.log(result)
	
	user.likedprojects = result

	return Response.json({ user });
}
