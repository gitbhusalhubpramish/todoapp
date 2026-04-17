import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(to, code) {
	await resend.emails.send({
		from: process.env.EMAIL_FROM,
		to,
		subject: "Password Reset Code",
		html: `
			<div style="font-family: sans-serif">
				<h2>Password Reset</h2>
				<p>Your verification code is:</p>
				<h1 style="letter-spacing: 4px">${code}</h1>
				<p>This code expires in 10 minutes.</p>
			</div>
		`,
	});
}
