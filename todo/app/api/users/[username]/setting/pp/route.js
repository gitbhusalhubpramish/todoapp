import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req, {params}){
	const {username} = await params;
	const formData = await req.formData()
	const file = formData.get("file")
	
	const session = await getCurrentUser();
	if (session?.username !== username) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const client = await clientPromise;
	const db = client.db("projectdata");
	
	
	
	return Response.json({message:"got"}, {status:200})
}
