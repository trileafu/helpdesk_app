import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: parseInt(process.env.SMTP_PORT || "587"),
	secure: process.env.SMTP_SECURE === "true",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

export async function sendEmail({
	to,
	subject,
	text,
	html,
}: {
	to: string;
	subject: string;
	text: string;
	html?: string;
}) {
	if (!process.env.SMTP_HOST) {
		console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
		console.log(`[Email Mock] Body: ${text}`);
		return;
	}

	try {
		const info = await transporter.sendMail({
			from: `"${process.env.SMTP_FROM_NAME || "Helpdesk Support"}" <${process.env.SMTP_FROM_ADDRESS}>`,
			to,
			subject,
			text,
			html,
		});
		return info;
	} catch (error) {
		throw error;
	}
}
