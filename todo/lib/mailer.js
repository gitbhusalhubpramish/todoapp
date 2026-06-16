import { Resend } from "resend";

//connect resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(to, code, text, subject) {
	//send email
	await resend.emails.send({
		from: tickit <onboarding@resend.dev>,
		to,
		subject: subject,
		html: `
			<div style="font-family: sans-serif">
				<h2>${text}</h2>
				<p>Your verification code is:</p>
				<h1 style="letter-spacing: 4px">${code}</h1>
				<p>This code expires in 5 minutes.</p>
			</div>
		`,
	});
}
