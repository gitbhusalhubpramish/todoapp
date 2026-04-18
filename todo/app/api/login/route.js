import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import crypto from "crypto";
import { sendResetEmail } from "@/lib/mailer";


export async function POST(req) {
  try {
	const body = await req.json();
	const {action, username, password, code, captchaToken } = body;

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

	const usernameRegex = /^[a-zA-Z0-9_@.\-]+$/;

	if (!usernameRegex.test(username)) {
	  return Response.json({ error: "Invalid username" }, { status: 400 });
	}

	const client = await clientPromise;
	const db = client.db("projectdata");

	const users = db.collection("users");
	const sessions = db.collection("sessions");

	const user = await users.findOne({
  $or: [
	{ email: username },
	{ username: username }
  ],
});

	if (!user) {
	  return Response.json(
		{ error: "Password or username incorrect" },
		{ status: 401 }
	  );
	}
	
	
	if (action === "forget"){
		if (!password || password.length < 6) {
			return Response.json({ error: "Password too short" }, { status: 400 });
		}
		const forgetcode = db.collection("forgetcode");
		console.log("forget ",action)
		const hashedPassword = await bcrypt.hash(password, 10);
		const resetCode = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
		const lastRequest = await forgetcode.findOne(
			{ userId: user._id },
			{ sort: { createdAt: -1 } }
		);

		if (lastRequest && Date.now() - new Date(lastRequest.createdAt).getTime() < 60000) {
			return Response.json(
				{ error: "Wait 60 seconds before requesting again" },
				{ status: 429 }
			);
		}
		await sendResetEmail(user.email, resetCode);
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
		await forgetcode.insertOne({
			userId: user._id,
			code: resetCode,
			expiresAt,
			newpass: hashedPassword,
			used: false,
			createdAt: new Date(),
		});
		return Response.json({ message: "Reset code sent" });
	}
	if (action === "verify"){
		const otp = await forgetcode.findOne(
			{ userId: user._id },
			{ sort: { createdAt: -1 } }
		);
		console.log(otp)
	}
	

	const isMatched = await bcrypt.compare(password, user.password);
	if(!isMatched){
		return Response.json(
		{ error: "Password or username incorrect" },
		{ status: 401 }
	  );
	}


	const sessionId = randomUUID();

	await sessions.insertOne({
	  sessionId,
	  userId: user._id,
	  username,
	  createdAt: new Date(),
	  expiresAt: new Date(Date.now() + 86400000), // 1 day
	});

	const cookieStore = await cookies();

cookieStore.set("sessionId", sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24,
});

	return Response.json(
	  { message: "Log in successful" },
	  { status: 201 }
	);

  } catch (err) {
	console.log(err);
	return Response.json(
	  { error: "Server error" },
	  { status: 500 }
	);
  }
}
