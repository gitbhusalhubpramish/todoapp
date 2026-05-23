import clientPromise from "@/lib/mongodb";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const q = searchParams.get("q") || "";
		
		console.log(q)

		const client = await clientPromise;
		const db = client.db("projectdata");

		const users = await db
			.collection("users")
			.find({
				username: {
					$regex: q,
					$options: "i",
				},
			})
			.limit(20)
			.toArray();
		console.log(users)

		return Response.json(users);
	} catch (err) {
		return Response.json(
			{ error: "Server error" },
			{ status: 500 }
		);
	}
}
