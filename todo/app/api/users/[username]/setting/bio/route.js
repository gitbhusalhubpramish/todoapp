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
	
	if (bio.length>150){
		return Response.josn({error:"bio must be less than 150 character"}, {status: 400})
	}
	
	const client = await clientPromise;
	const db = client.db("projectdata");
	
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
