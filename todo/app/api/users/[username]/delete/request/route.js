import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import crypto from "crypto";
import { sendResetEmail } from "@/lib/mailer";
import { redis } from "@/lib/redis";
import { getCurrentUser } from "@/lib/auth";

function generateOTP(){
	return Math.floor(100000 + Math.random() * 900000).toString();
	
}

function hashOTP(otp) {
	return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req, {params}){
	try {
		const {username} = await params;
	
		const session = await getCurrentUser();
		if (session?.username !== username) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}
	
		const client = await clientPromise;
		const db = client.db("projectdata");

		const user = await db.collection("users").findOne({ username });
		console.log("PARAM USERNAME:", username);
		if (!user) {
			return Response.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}
	
		// -----------------------------
		// 4. Rate limiting (basic Redis guard)
		// -----------------------------
		const rateKey = `delete_req_rate:${username}`;
		const existing = await redis.get(rateKey);
		if (existing) {
			return Response.json(
				{ error: "Please wait before requesting another OTP" },
				{ status: 429 }
			);
		}

		// set 30s cooldown
		await redis.set(rateKey, "1", { ex: 30 });

		// -----------------------------
		// 5. Generate OTP
		// -----------------------------
		const otp = generateOTP();
		const hashed = hashOTP(otp);

		// store in Redis (5 min expiry)
		await redis.set(
			`delete_otp:${username}`,
			JSON.stringify({
				hash: hashed,
				attempts: 0,
				createdAt: Date.now(),
			}),
			{ ex: 300 }
		);
	
		// -----------------------------
		// 6. Send email
		// -----------------------------
		await sendResetEmail({
			to: user.email,
			subject: "Account Deletion OTP",
			text: `Your account deletion OTP is: ${otp}. It expires in 5 minutes.`,
		});
	
		return Response.json({
				message: "OTP sent to your email",
			});
	}
	catch (err) {
		console.error("DELETE REQUEST ERROR:", err);

		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
