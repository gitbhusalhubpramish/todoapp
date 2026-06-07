import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

//connect to cloudify
cloudinary.config(process.env.CLOUDINARY_URL);

export async function POST(req, {params}){
	//get target username
	const {username} = await params;
	
	//get request
	const formData = await req.formData()
	
	//format file
	const file = formData.get("file")
	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);
	
	//user auth
	const session = await getCurrentUser();
	if (session?.username !== username) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	//file validation
	if (!file.type.startsWith("image/")) {
		return Response.json({ error: "Invalid file" }, { status: 400 });
	}
	
	//update database
	const uploaded = await new Promise((resolve, reject) => {
	cloudinary.uploader
		.upload_stream(
			{
				folder: `users/${username}`,
				public_id: "image",
				overwrite: true,

				transformation: [
					{
						width: 512,
						height: 512,
						crop: "fill",
						gravity: "face",

						quality: "auto",
						fetch_format: "auto",
					},
				],
			},
			(error, result) => {
				if (error) reject(error);
				else resolve(result);
			}
		)
		.end(buffer);
	});
	
	//connect to database
	const client = await clientPromise;
	const db = client.db("projectdata");
	
	//update database
	await db.collection("usrdata").updateOne(
		{ username },
		{
			$set: {
				profilepic: uploaded.secure_url
			}
		}
	)
	
	return Response.json( {status:200})
}
