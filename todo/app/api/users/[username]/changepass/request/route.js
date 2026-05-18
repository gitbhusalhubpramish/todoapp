import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import crypto from "crypto";
import { sendResetEmail } from "@/lib/mailer";
import { getCurrentUser } from "@/lib/auth";


export async function POST(req, {params}){
	const body = req.body
	const {username} = await params
	
	const session = await getCurrentUser();
	if (session?.username !== username) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	
	const { oldPassword, newPassword, confirmPassword } = body
	
	if (
		!oldPassword.trim() ||
		!newPassword.trim() ||
		!confirmPassword.trim()
	) {
		return Response.json({error:"All fields are required"},{status: 401})
	}
	
		if (newPassword.length < 8) {
		return Response.json({error:"Password must be at least 8 characters"},{status:401}
	}
	if (newPassword !== confirmPassword) {
		return Response.json({error:"Passwords do not match"},{status:401})
	}

	if (oldPassword === newPassword) {
		return Response.json({error:"New password must be different"},{status:401})
	}

	if (
		!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(
			newPassword
		)
	) {
		return Response.json({error:"Weak password"},{status:401})
	}
}
