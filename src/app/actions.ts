"use server";

import { prisma } from "@/lib/db";
import { generateTicketCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/storage";
import { sendEmail } from "@/lib/email";

export type ActionState = {
	success?: boolean;
	error?: string;
	ticketCode?: string;
};

async function verifyRecaptcha(token: string) {
	const secret = process.env.RECAPTCHA_SECRET_KEY;
	if (!secret) return true;

	const response = await fetch(
		`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
		{
			method: "POST",
		},
	);
	const data = await response.json();
	return data.success;
}

export async function createTicket(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const title = formData.get("title") as string;
		const description = formData.get("description") as string;
		const category_id = parseInt(formData.get("category") as string);
		const attachmentFile = formData.get("attachment") as File;
		const recaptchaToken = formData.get("g-recaptcha-response") as string;

		if (!name || !email || !title || !description || !category_id) {
			return { error: "Please fill in all required fields." };
		}

		if (process.env.RECAPTCHA_SECRET_KEY) {
			if (!recaptchaToken)
				return { error: "Please complete the CAPTCHA check." };
			const isHuman = await verifyRecaptcha(recaptchaToken);
			if (!isHuman)
				return { error: "CAPTCHA verification failed. Please try again." };
		}

		const code = generateTicketCode();

		// Handle File Upload
		let attachmentPath = null;
		if (attachmentFile && attachmentFile.size > 0) {
			attachmentPath = await uploadFile(attachmentFile);
		}

		await prisma.ticket.create({
			data: {
				ticket_code: code,
				client_name: name,
				client_email: email,
				title: title,
				description: description,
				category_id: category_id,
				attachment: attachmentPath,
				status: "Open",
			},
		});

		// Kirim Confirmation Email
		await sendEmail({
			to: email,
			subject: `[${code}] Ticket Received: ${title}`,
			text: `Hi ${name},\n\nWe have received your support request. Your ticket code is: ${code}.\n\nYou can track the status of your ticket here: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${code}\n\nSummary:\n${description}\n\nRegards,\nSupport Team`,
			html: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>Ticket Received</h2>
                <p>Hi <strong>${name}</strong>,</p>
                <p>We have received your support request. Your ticket code is:</p>
                <div style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0;">${code}</div>
                <p>You can track the status of your ticket by clicking the button below:</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${code}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; rounded: 5px;">Track Ticket Status</a>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">Summary: ${title}</p>
            </div>
        `,
		});

		// Mengirim email notifikasi ke admin
		const admins = await prisma.user.findMany({ where: { role: "admin" } });
		if (admins.length > 0) {
			await sendEmail({
				to: admins[0].email, // Hanya super admin
				subject: `[New Ticket] ${code}: ${title}`,
				text: `New ticket from ${name} (${email}).\nCode: ${code}\nLink: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/tickets/${code}`,
			});
		}

		return { success: true, ticketCode: code };
	} catch (e) {
		console.error(e);
		return { error: "An unexpected error occurred. Please try again later." };
	}
}

export async function getCategories() {
	return await prisma.category.findMany();
}

export async function trackTicket(code: string) {
	return await prisma.ticket.findUnique({
		where: { ticket_code: code },
		include: {
			category: true,
			replies: {
				include: { user: true },
				orderBy: { createdAt: "asc" },
			},
			aiSuggestion: true,
		},
	});
}

export async function replyClient(ticketId: number, message: string) {
	if (!message.trim()) return;

	await prisma.ticketReply.create({
		data: {
			ticket_id: ticketId,
			message,
			sender_type: "client",
		},
	});

	await prisma.ticket.findUnique({ where: { id: ticketId } });

	revalidatePath("/");
}

export async function getTicketReplies(ticketId: number) {
	return await prisma.ticketReply.findMany({
		where: { ticket_id: ticketId },
		include: { user: true },
		orderBy: { createdAt: "asc" },
	});
}

export async function getAllTickets() {
	return await prisma.ticket.findMany({
		include: { category: true },
		orderBy: { createdAt: "desc" },
	});
}

export async function getTicketFull(code: string) {
	return await prisma.ticket.findUnique({
		where: { ticket_code: code },
		include: {
			category: true,
			replies: { include: { user: true }, orderBy: { createdAt: "asc" } },
			aiSuggestion: true,
		},
	});
}
