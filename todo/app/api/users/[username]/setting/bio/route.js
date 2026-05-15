import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req, {params}){
	const {username} = await params;
	
	
	
	const session = await getCurrentUser();
	if (session?.username !== username) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	
	const body = await req.json();
	const { bio } = body;
	
	console.log(bio)
	return Response.json({status:200})
}
