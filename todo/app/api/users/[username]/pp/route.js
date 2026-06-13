import clientPromise from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";

//connect to cloudify
cloudinary.config(process.env.CLOUDINARY_URL);

export async function GET(req,{params}){
	//get target username
	const {username} = await params;
	
	//connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	const user = await db.collection("usrdata").findOne({username})
	
	return Response.json({profilepic: user.profilepic})
}
