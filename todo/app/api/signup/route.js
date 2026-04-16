import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, email, password, captchaToken } = body;

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

    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    const emailRegex = /^[a-zA-Z0-9_@.\-]+$/;

    if (!usernameRegex.test(username)) {
      return Response.json({ error: "Invalid username" }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return Response.json({ error: "Password too short" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("projectdata");

    const users = db.collection("users");
    const sessions = db.collection("sessions");

    const existing = await users.findOne({
      $or: [{ email }, { username }],
    });

    if (existing) {
      return Response.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      email,
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    const sessionId = randomUUID();

    await sessions.insertOne({
      sessionId,
      userId: result.insertedId,
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
