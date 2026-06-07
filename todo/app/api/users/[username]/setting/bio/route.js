import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req, {params}){
	//get target username
	const {username} = await params;
	
	//user auth
	const session = await getCurrentUser();
	if (session?.username !== username) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	
	//get request 
	const body = await req.json();
	const { bio } = body;
	
	//req validation
	if (bio.length>150){
		return Response.josn({error:"bio must be less than 150 character"}, {status: 400})
	}
	
	//connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	//save changes
	await db.collection("usrdata").updateOne(
		{ username },
		{
			$set: {
				bio: bio
			}
		}
	)
	return Response.json({status:200})
}
