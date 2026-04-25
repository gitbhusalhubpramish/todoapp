import clientPromise from "@/lib/mongodb";

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

	projectData.profilepic = user?.profilepic || null;

	return Response.json({
		project: projectData
	});
}
