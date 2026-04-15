import clientPromise from "@/lib/mongodb";
export async function POST(req) {
	const body = await req.json();

	const token = body.captchaToken;

	const verifyRes = await fetch(
		"https://www.google.com/recaptcha/api/siteverify",
		{
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				secret: process.env.RECAPTCHA_SECRET_KEY,
				response: token,
			}),
		}
	);

	const data = await verifyRes.json();

	// ❌ Block bots
	if (!data.success || (data.score && data.score < 0.5)) {
		return Response.json(
			{ error: "Bot detected" },
			{ status: 403 }
		);
	}
	console.log(body)
	// ✅ Continue signup logic
	return Response.json({ success: true });
}
