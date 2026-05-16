import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import crypto from "crypto";
import { sendResetEmail } from "@/lib/mailer";

export async function POST(req, {params}){
	const {username} = await params;
	
	const session = await getCurrentUser();
	if (session?.username !== username) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	
	
}
