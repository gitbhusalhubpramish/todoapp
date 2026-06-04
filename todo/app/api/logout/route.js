import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST() {
	//get cookie/sessionID
	const cookieStore = await cookies();
	const sessionId = await cookieStore.get("sessionId")?.value;

	if (sessionId) {
		//connect to database
		const client = await clientPromise;
		const db = client.db("projectdata"); 

		//connect to collection
		const sessions = db.collection("sessions");

		//delete sessionID from collection
		await sessions.deleteOne({ sessionId });
	}

	//delete sessionid form client cookies storage
	cookieStore.set("sessionId", "", {
		httpOnly: true,
		expires: new Date(0),
		path: "/",
	});

	return NextResponse.json({ success: true });
}
