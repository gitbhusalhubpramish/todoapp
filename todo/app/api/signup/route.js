import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const token = body.captchaToken;

    const verifyRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        }),
      }
    );

    const data = await verifyRes.json();

    // ❌ Block bots
    if (!data.success || (data.score && data.score < 0.5)) {
		console.log(data.success, data.score)
      return Response.json(
        { error: "Bot detected" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("projectdata");
    const users = db.collection("users");

    // (optional) check duplicate user
    const existing = await users.findOne({
  $or: [
    { email: body.email },
    { username: body.username }
  ]
});

if (existing) {
  return Response.json(
    { error: "User already exists" },
    { status: 409 }
  );
}
    if (existing) {
		console.log(users)
      return Response.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    await users.insertOne({
      email: body.email,
      username: body.username,
      password: body.password,
      createdAt: new Date(),
    });

    return Response.json(
      { message: "User created" },
      { status: 201 }
    );

  } catch (err) {
	  console.log(err)
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
