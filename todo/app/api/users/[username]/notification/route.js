import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
	const { username } = await params;

	const client = await clientPromise;
	const db = client.db("projectdata");
}
