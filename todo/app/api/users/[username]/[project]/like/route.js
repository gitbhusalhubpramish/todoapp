import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth.js";

export async function POST(req, { params }) {
	const { username, project } = await params;
	console.log(username, project)

	const session = await getCurrentUser();

	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (session.username === username) {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	const client = await clientPromise;
	const db = client.db("projectdata");

	const doc = await db.collection("projects").findOne({
		owner: username,
		"content.title": project,
	});

	if (!doc) {
		return Response.json({ error: "Not found" }, { status: 404 });
	}

	if (doc.likes?.includes(session.username)) {
		return Response.json(
			{ error: "Already liked" },
			{ status: 409 }
		);
	}

	await db.collection("projects").updateOne(
		{ _id: doc._id },
		{
			$addToSet: {
				likes: session.username,
			},
		}
	);

	return Response.json({ ok: true }, { status: 200 });
}
