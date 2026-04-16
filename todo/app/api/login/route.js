import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, password, captchaToken } = body;

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

    if (!usernameRegex.test(username)) {
      return Response.json({ error: "Invalid username" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("projectdata");

    const users = db.collection("users");
    const sessions = db.collection("sessions");

    const user = await users.findOne({ username });

    if (!user) {
      return Response.json(
        { error: "Password or username incorrect" },
        { status: 401 }
      );
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
