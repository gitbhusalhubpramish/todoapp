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
	
	
	
}
