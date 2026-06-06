import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const q = searchParams.get("q")?.trim() || "";

		if (!q) {
			return Response.json({
				users: [],
				projects: [],
			});
		}
		
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}

		const safeQuery = escapeRegex(q);

		const client = await clientPromise;
		const db = client.db("projectdata");

		// Search users
		const users = await db
			.collection("usrdata")
			.find(
				{
					username: {
						$regex: safeQuery,
						$options: "i",
					},
				},
				{
					projection: {
						_id: 0,
						username: 1,
						profilepic: 1,
						bio: 1,
					},
				}
			)
			.limit(20)
			.toArray();

		// Search projects
		const rawProjects = await db
			.collection("projects")
			.find(
				{
					"content.title": {
						$regex: safeQuery,
						$options: "i",
					},
				},
				{
					projection: {
						_id: 0,
						content: 1,
						owner: 1,
					},
				}
			)
			.limit(20)
			.toArray();

		// Get all owner usernames
		const owners = [...new Set(rawProjects.map((p) => p.owner))];

		// Fetch owner profile pictures
		const ownerData = await db
			.collection("usrdata")
			.find(
				{
					username: {
						$in: owners,
					},
				},
				{
					projection: {
						_id: 0,
						username: 1,
						profilepic: 1,
					},
				}
			)
			.toArray();

		// Convert to lookup map
		const ownerMap = {};

		for (const user of ownerData) {
			ownerMap[user.username] = user.profilepic;
		}

		// Final formatted projects
		const projects = rawProjects.map((project) => ({
			content: {
				title: project.content?.title,
				description: project.content?.description,
			},
			owner: project.owner,
			profilepic: ownerMap[project.owner] || null,
		}));
		
		const query = [
			...new Set([
				...rawProjects.map((p) => p.content.title),
				...users.map((u) => u.username),
			]),
		];
		

		return Response.json({
			users,
			projects,
			query,
		});
	} catch (err) {
		console.error(err);

		return Response.json(
			{ error: "Server error" },
			{ status: 500 }
		);
	}
}
