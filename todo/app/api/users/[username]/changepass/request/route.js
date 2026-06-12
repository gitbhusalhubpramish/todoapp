import clientPromise from "@/lib/mongodb";
import { sendResetEmail } from "@/lib/mailer";
import { getCurrentUser } from "@/lib/auth";
import { redis } from "@/lib/redis";
import bcrypt from "bcrypt";
import crypto from "crypto";

function generateOTP() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(otp) {
	return crypto
		.createHash("sha256")
		.update(otp)
		.digest("hex");
}

export async function POST(req, { params }) {
	try {
		// get request body
		const body = await req.json();

		//get params
		const { username } = await params;

		//check for session validation
		const session = await getCurrentUser();

		// verify authorization
		if (session?.username !== username) {
			return Response.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		
		//get argunment
		const {
			oldPassword,
			newPassword,
			confirmPassword,
			captchaToken,
		} = body;
		
		//bot detiection
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
			return Response.json({ error: "Bot detected" }, { status: 403 });
		}

		//check for fields layer 1
		if (
			!oldPassword ||
			!newPassword ||
			!confirmPassword
		) {
			return Response.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		// check for fields layer 2
		if (
			!oldPassword.trim() ||
			!newPassword.trim() ||
			!confirmPassword.trim()
		) {
			return Response.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		//check for length
		if (newPassword.length < 8) {
			return Response.json(
				{
					error: "Password must be at least 8 characters",
				},
				{ status: 400 }
			);
		}

		//confirmpass verification
		if (newPassword !== confirmPassword) {
			return Response.json(
				{ error: "Passwords do not match" },
				{ status: 400 }
			);
		}

		//password must be different
		if (oldPassword === newPassword) {
			return Response.json(
				{
					error:
						"New password must be different",
				},
				{ status: 400 }
			);
		}

		//password strenght
		if (
			!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(
				newPassword
			)
		) {
			return Response.json(
				{ error: "Weak password" },
				{ status: 400 }
			);
		}

		//connect to database c
		const client = await clientPromise;
		const db = client.db("projectdata");

		//search for user in database collection
		const user = await db
			.collection("users")
			.findOne({ username });

		//validation
		if (!user) {
			return Response.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// verify oldpassword
		const isMatched = await bcrypt.compare(
			oldPassword,
			user.password
		);

		//error
		if (!isMatched) {
			return Response.json(
				{
					error:
						"Old password is incorrect",
				},
				{ status: 401 }
			);
		}

		//redis ratekey
		const rateKey = `change_req_rate:${username}`;
		
		//check for existing redis key
		const existing = await redis.get(rateKey);

		//validation: user can't request another otp untill first expires
		if (existing) {
			return Response.json(
				{
					error:
						"Please wait before requesting another OTP",
				},
				{ status: 429 }
			);
		}

		//cooldown
		await redis.set(rateKey, "1", {
			ex: 30,
		});

		//generate otp
		const otp = generateOTP();

		//hash otp in sha256
		const hashed = hashOTP(otp);
		
		//hash newpassword
		const hashedpass = await bcrypt.hash(newPassword, 10);

		//set redis with newpassword and otp
		await redis.set(
			`change_otp:${username}`,
			JSON.stringify({
				hash: hashed,
				attempts: 0,
				createdAt: Date.now(),
				hashedpass,
			}),
			{ ex: 300 }
		);

		//send email to user
		await sendResetEmail(user.email, otp, "Reset password", "Reset password otp code");

		console.log(otp);

		return Response.json({
			message: "OTP sent to your email",
		});
	} catch (err) {
		console.error(err);

		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
