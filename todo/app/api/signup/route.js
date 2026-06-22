import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import profilepic from "@/public/profile.svg"


export async function POST(req) {
	try {
		// Get request
		const body = await req.json();
		const { username, email, password, captchaToken } = body;

		//verify bot
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

		// regex
		const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		
		// convert email to lowercase
		const normalizedEmail = email.trim().toLowerCase();

		//check username regex
		if (!usernameRegex.test(username)) {
			return Response.json({ error: "Invalid username" }, { status: 400 });
		}

		// check email regex
		if (!emailRegex.test(normalizedEmail)) {
			return Response.json({ error: "Invalid email" }, { status: 400 });
		}

		// check password lenght
		if (!password || password.length < 6) {
			return Response.json({ error: "Password too short" }, { status: 400 });
		}

		//connect to database
		const client = await clientPromise;
		const db = client.db("projectdata");

		//connect to collection
		const users = db.collection("users");
		const sessions = db.collection("sessions");
		const usrdta = db.collection("usrdata");

		// search for existing user
		const existing = await users.findOne({
			$or: [{ email: normalizedEmail }, { username: username }],
		});

		//throw error on existing user
		if (existing) {
			return Response.json(
				{ error: "User already exists" },
				{ status: 409 }
			);
		}

		//hash password
		const hashedPassword = await bcrypt.hash(password, 10);
		
		// insert user to users db collection
		const result = await users.insertOne({
			email:normalizedEmail,
			username,
			password: hashedPassword,
			createdAt: new Date(),
		});
		
		//insert user to usrdata colleciton
		await usrdta.insertOne({
				userId: result.insertedId,
				username,
				profilepic: "/profile.svg",
				projects: [],
				notifications: [],
				followers: [],
				likedprojects: [],
				following: [],
				bio: "",
		})

		//create sessionid
		const sessionId = randomUUID();

		// insety sessionid to collection
		await sessions.insertOne({
			sessionId,
			userId: result.insertedId,
			username,
			createdAt: new Date(),
			expiresAt: new Date(Date.now() + 86400000), // 1 day
		});
		
		// connect to client browser cookies
		const cookieStore = await cookies();

		//create a new cookies to client browser
		cookieStore.set("sessionId", sessionId, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24,
		});

		return Response.json(
			{ message: "User created" },
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
