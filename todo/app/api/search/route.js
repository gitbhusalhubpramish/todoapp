import clientPromise from "@/lib/mongodb";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const q = searchParams.get("q") || "";
		
		console.log(q)

		const client = await clientPromise;
		const db = client.db("projectdata");

		const users = await db
			.collection("usrdata")
			.find({
				username: {
					$regex: q,
					$options: "i",
				},
			})
			.limit(20)
			.toArray();
		console.log(users)
		
		const projects = await db.collection("projects").find({
			"content.title": {
				$regex: q,
				$options: "i",
			},
		}).toArray()

		return Response.json({users, projects});
	} catch (err) {
		console.log(err)
		return Response.json(
			{ error: "Server error" },
			{ status: 500 }
		);
	}
}
