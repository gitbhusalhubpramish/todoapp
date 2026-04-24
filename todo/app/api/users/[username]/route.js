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

	return Response.json({ user });
}
