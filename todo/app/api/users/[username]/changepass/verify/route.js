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
		const cookieStore = await cookies();
		
		const body = await req.json();

		const { username } = await params;

		const session = await getCurrentUser();

		if (session?.username !== username) {
			return Response.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const {otp} = body;
		
		const red = await redis.get(`change_otp:${username}`)
		console.log(red)
		
		if(!red){
			return Response.json({ error: "OTP incorrect or expired" }, { status: 400 });
		}
		
		const valotphash = red.hash
		
		const otphash = hashOTP(otp)
		
		const isMatchedotp = valotphash === otphash
		
		
		
		if (!isMatchedotp){
			await redis.del(`change_otp:${username}`)
			return Response.json({ error: "OTP incorrect or expired" }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db("projectdata");

		const user = await db
			.collection("users")
			.findOne({ username });

		if (!user) {
			return Response.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}
		
		await db.collection("users").updateOne({username}, {$set:{password: red.hashedpass}})
		
		const sessions = db.collection("sessions");

		await sessions.deleteMany({ username });
		
		cookieStore.set("sessionId", "", {
			httpOnly: true,
			expires: new Date(0),
			path: "/",
		});
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
