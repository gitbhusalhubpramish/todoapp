import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
	//get username
	const { username } = await params;

	// connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");

	//get userdata
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
	
	// throw error on user doesn't exist in usrdata collection
	if (!user) {
		return Response.json(
			{ error: "user not found" },
			{ status: 404 }
		);
	}
	
	//find projects
	const projects = await db.collection("projects").find({ owner: username }).toArray();

	//format project form {title} to {title, description, isdone}
	const formattedProjects = projects.map(p => ({
		title: p.content?.title,
		description: p.content?.description,
		isdone: p.content?.isdone
	}));
	
	//set project as formatted project
	user.projects = formattedProjects
	
	//get liked project link
	const liked = user.likedprojects.map((item) => {
		const [owner, project] = item.split("/");
		return { owner, project };
	});
	
	// get liked project detail form projects collection
	const likedpro = await db.collection("projects").find({
		"content.title": { $in: liked.map(p => p.project) },
		owner: { $in: liked.map(p => p.owner) }
	}).toArray()
	
	
	//find for owner of project
	const users = await db.collection("usrdata").find({
		username: { $in: likedpro.map(p => p.owner) }
	}).toArray()

	//format usermpa
	const userMap = Object.fromEntries(
		users.map(u => [u.username, u.profilepic])
	);
	
	
	//add profile pic too
	const result = likedpro.map(p => ({
		owner: p.owner,
		profilepic: userMap[p.owner],
		content: {
			title: p.content.title,
			description: p.content.description
		}
	}));
	
	
	//set changes
	user.likedprojects = result

	return Response.json({ user });
}
