import clientPromise from "@/lib/mongodb";
import { sendResetEmail } from "@/lib/mailer";
import { getCurrentUser } from "@/lib/auth";
import { redis } from "@/lib/redis";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(req, {params}){
	try {
		const body = await req.json();

		const { username } = await params;

		const session = await getCurrentUser();

		if (session?.username !== username) {
			return Response.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const {
			oldPassword,
			newPassword,
			confirmPassword,
		} = body;

		if (
			!oldPassword ||
			!newPassword ||
			!confirmPassword
		) {
			return Response.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		if (
			!oldPassword.trim() ||
			!newPassword.trim() ||
			!confirmPassword.trim()
		) {
			return Response.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		if (newPassword.length < 8) {
			return Response.json(
				{
					error: "Password must be at least 8 characters",
				},
				{ status: 400 }
			);
		}

		if (newPassword !== confirmPassword) {
			return Response.json(
				{ error: "Passwords do not match" },
				{ status: 400 }
			);
		}

		if (oldPassword === newPassword) {
			return Response.json(
				{
					error:
						"New password must be different",
				},
				{ status: 400 }
			);
		}

		if (
			!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(
				newPassword
			)
		) {
			return Response.json(
				{ error: "Weak password" },
				{ status: 400 }
			);
		}

		const client = await clientPromise;
		const db = client.db("projectdata");

		const user = await db
			.collection("users")
			.findOne({ username });

		if (!user) {
			return Response.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		const isMatched = await bcrypt.compare(
			oldPassword,
			user.password
		);

		if (!isMatched) {
			return Response.json(
				{
					error:
						"Old password is incorrect",
				},
				{ status: 401 }
			);
		}
	}catch (err) {
		console.error(err);

		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
