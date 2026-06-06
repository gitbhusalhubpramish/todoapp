import clientPromise from "@/lib/mongodb";
import { sendResetEmail } from "@/lib/mailer";
import { getCurrentUser } from "@/lib/auth";
import { redis } from "@/lib/redis";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { cookies } from "next/headers";

function hashOTP(otp) {
	return crypto
		.createHash("sha256")
		.update(otp)
		.digest("hex");
}

export async function POST(req, {params}){
	try {
		//initilize cookies
		const cookieStore = await cookies();
		
		//get request body
		const body = await req.json();

		//get params
		const { username } = await params;

		//check for session
		const session = await getCurrentUser();

		//session authorization
		if (session?.username !== username) {
			return Response.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		//get otp and captchatoken form body
		const {otp, captchaToken} = body;
		
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

		const data = await verifyRes.json();

		if (!data.success || (data.score && data.score < 0.5)) {
			console.log(data.success, data.score);
			return Response.json({ error: "Bot detected" }, { status: 403 });
		}
		
		//get redis key
		const red = await redis.get(`change_otp:${username}`)
		console.log(red)
		
		//otp expire validation
		if(!red){
			return Response.json({ error: "OTP incorrect or expired" }, { status: 400 });
		}
		
		//get password
		const valotphash = red.hash
		
		//get otp code
		const otphash = hashOTP(otp)
		
		//match for otp
		const isMatchedotp = valotphash === otphash
		
		//throw error if not matched
		if (!isMatchedotp){
			await redis.del(`change_otp:${username}`)
			return Response.json({ error: "OTP incorrect or expired" }, { status: 400 });
		}

		//connect to database
		const client = await clientPromise;
		const db = client.db("projectdata");

		//find user form users collection
		const user = await db
			.collection("users")
			.findOne({ username });

		//user validation
		if (!user) {
			return Response.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}
		
		//update password
		await db.collection("users").updateOne({username}, {$set:{password: red.hashedpass}})
		
		//get session form session collection
		const sessions = db.collection("sessions");

		//logout from all profile
		await sessions.deleteMany({ username });
		
		//delete sessionid form user
		cookieStore.set("sessionId", "", {
			httpOnly: true,
			expires: new Date(0),
			path: "/",
		});
		
		//delete redis
		await redis.del(`change_otp:${username}`)
		
		return Response.json({message: "password successfully changed"}, {status: 200})
	}catch (err) {
		console.error(err);

		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
