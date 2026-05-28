import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import crypto from "crypto";
import { redis } from "@/lib/redis";
import { getCurrentUser } from "@/lib/auth";

function hashOTP(otp) {
	return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req, {params}){
	try {
		const {username} = await params;
		const { otp, captchaToken } = await req.json();
	
		//user auth
		const session = await getCurrentUser();
		if (session?.username !== username) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}
		
		const verifyRes = await fetch(
			"https://www.google.com/recaptcha/api/siteverify",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					secret: process.env.RECAPTCHA_SECRET_KEY,
					response: captchaToken,
				}),
			}
		);

		const verdata = await verifyRes.json();

		if (!verdata.success || (verdata.score && verdata.score < 0.5)) {
			console.log(verdata.success, verdata.score);
			return Response.json({ error: "Bot detected" }, { status: 403 });
		}
		
		
		//otp verification
		if (!otp || typeof otp !== "string" || otp.length !== 6) {
			return Response.json(
				{ error: "Invalid OTP format" },
				{ status: 400 }
			);
		}
		
		const key = `delete_otp:${username}`;
		const raw = await redis.get(key);

		if (!raw) {
			return Response.json(
				{ error: "OTP expired or not found" },
				{ status: 400 }
			);
		}
		
		const data = raw;

		const hashedInput = hashOTP(otp);

		if (hashedInput !== data.hash) {

			await redis.del(key);

			return Response.json(
				{ error: "Invalid OTP" },
				{ status: 401 }
			);
		}
		
		await redis.del(key);
		
		// -----------------------------
		// 7. MongoDB cleanup (CASCADE DELETE)
		// -----------------------------
		const client = await clientPromise;
		const db = client.db("projectdata");

		// 7.1 Delete user
		await db.collection("users").deleteOne({ username });
		
		const usr = await db.collection("usrdata").findOne({username})
		if (!usr){
			return Response.json({error: "user is null in usrdata database collections"}, {status: 404})
		}
		const projects = usr.projects
		
		if (projects.lenght>0){
		
		const projectDocs = await db.collection("projects").find({
			owner: username,
			"content.title": {$in: projects},
		}).toArray()
		if (projectDocs.length === 0){
			return Response.json({error:"project not found in database collections"},{status:404})
		}
		const likedusers = projectDocs.flatMap(p => p.likes || []);
	
		const formatpro = projects.map(p => `${username}/${p}`)
	
		await db.collection("usrdata").updateMany(
			{ username: { $in: likedusers } },
			{
				$pull:{likedprojects: {$in: formatpro}}
			}
		)
	
		await db.collection("projects").deleteMany({
			owner: username,
			"content.title": {$in: projects},
		});
		}
		
		await db.collection("projects").updateMany(
			{},
			{
				$pull: {likes: username}
			}
		)
		
		await db.collection("usrdata").updateMany(
			{},
			{
				$pull: {
					followers: username,
					following: username,
				},
			}
		);
		
		await db.collection("usrdata").deleteOne({username: username})
		
		const cookieStore = await cookies();

		cookieStore.set("token", "", {
			maxAge: 0,
			path: "/",
		});
		
		return Response.json({
			message: "Account deleted successfully",
		});
		
	}catch (err) {
		console.error("DELETE REQUEST ERROR:", err);

		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
	
}
