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
		//get params username 
		const {username} = await params;
		
		//get otp and captcha token form client
		const { otp, captchaToken } = await req.json();
	
		//user auth
		const session = await getCurrentUser();
		if (session?.username !== username) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}
		
		//verify captcha
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
		
		//redis key initilization
		const key = `delete_otp:${username}`;
		const raw = await redis.get(key);

		//checking for existing key
		if (!raw) {
			return Response.json(
				{ error: "OTP expired or not found" },
				{ status: 400 }
			);
		}
		
		const data = raw;

		//hash user otp to sha256
		const hashedInput = hashOTP(otp);

		//otp validation
		if (hashedInput !== data.hash) {
			//delete otp
			await redis.del(key);

			return Response.json(
				{ error: "Invalid OTP" },
				{ status: 401 }
			);
		}
		
		//delete redis
		await redis.del(key);
		
		// -----------------------------
		// 7. MongoDB cleanup (CASCADE DELETE)
		// -----------------------------
		const client = await clientPromise;
		const db = client.db("projectdata");

		//search for user in database collections
		const usr = await db.collection("usrdata").findOne({username})
		
		//user validation
		if (!usr){
			return Response.json({error: "user is null in usrdata database collections"}, {status: 404})
		}
		console.log(usr)
		
		//get userproject
		const projects = usr.projects
		
		//delete project if exist
		if (projects.length>0){
			//get project title
			const projecttitl = projects.map(p=> p.title)
		
			//find user project
			const projectDocs = await db.collection("projects").find({
				owner: username,
				"content.title": {$in: projecttitl},
			}).toArray()
			
			//projectdocs validation
			if (projectDocs.length !== 0){
				//get username of user who liked the project
				const likedusers = projectDocs.flatMap(p => p.likes || []);
	
				//format the username adn project
				const formatpro = projects.map(p => `${username}/${p}`)
	
				//delete deleted project form every user liked collection
				await db.collection("usrdata").updateMany(
					{ username: { $in: likedusers } },
					{
						$pull:{likedprojects: {$in: formatpro}}
					}
				)
	
				//delete all project of that user
				await db.collection("projects").deleteMany({
					owner: username,
				});
			}
		}
		
		//unlike all project the user has liked ever
		await db.collection("projects").updateMany(
			{},
			{
				$pull: {likes: username}
			}
		)
		
		//remove user form follower and following list
		await db.collection("usrdata").updateMany(
			{},
			{
				$pull: {
					followers: username,
					following: username,
				},
			}
		);
		
		//delete user from usrdata database collection
		await db.collection("usrdata").deleteOne({username: username})
		
		//init cookies
		const cookieStore = await cookies();

		//delete sessionid
		cookieStore.set("sessionId", "", {
			httpOnly: true,
			expires: new Date(0),
			path: "/",
		});
		
		//Delete user
		await db.collection("users").deleteOne({ username });
		
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
