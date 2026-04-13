"use server";

import { prisma } from "@/lib/db";
import { createSession, logout, getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { uploadFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function loginAdmin(prevState: any, formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) return { error: "Please enter details" };

	const user = await prisma.user.findUnique({ where: { email } });

	if (!user || !(await bcrypt.compare(password, user.password))) {
		return { error: "Invalid credentials. Try: admin@bonet.id / admin123" };
	}

	await createSession(user.id, user.email, user.role);
	redirect("/admin/dashboard");
}

export async function logoutAdmin() {
	await logout();
	redirect("/admin/login");
}

export async function updateTicket(
	ticketId: number,
	data: { status?: string; priority?: string; category_id?: number },
) {
	const oldTicket = await prisma.ticket.findUnique({
		where: { id: ticketId },
		include: { category: true },
	});

	if (!oldTicket) return;

	const updatedTicket = await prisma.ticket.update({
		where: { id: ticketId },
		data: data,
		include: { category: true },
	});

	// System messages dalam diskusi
	const systemMessages: string[] = [];

	if (data.status && data.status !== oldTicket.status) {
		systemMessages.push(
			`Ticket status changed from "${oldTicket.status}" to "${data.status}"`,
		);
	}

	if (data.priority && data.priority !== oldTicket.priority) {
		systemMessages.push(
			`Ticket priority changed from "${oldTicket.priority || "None"}" to "${data.priority}"`,
		);
	}

	if (data.category_id && data.category_id !== oldTicket.category_id) {
		systemMessages.push(
			`Ticket category changed from "${oldTicket.category.category_name}" to "${updatedTicket.category.category_name}"`,
		);
	}

	for (const msg of systemMessages) {
		await prisma.ticketReply.create({
			data: {
				ticket_id: ticketId,
				sender_type: "system",
				message: msg,
			},
		});
	}

	return updatedTicket;
}

export async function replyAdmin(ticketId: number, message: string) {
	const session = await getSession();
	if (!session) throw new Error("Unauthorized");

	await prisma.ticketReply.create({
		data: {
			ticket_id: ticketId,
			user_id: session.userId,
			sender_type: "admin",
			message,
		},
	});

	const ticket = await prisma.ticket.findUnique({
		where: { id: ticketId },
	});

	if (ticket) {
		await sendEmail({
			to: ticket.client_email,
			subject: `[${ticket.ticket_code}] New Reply: ${ticket.title}`,
			text: `Hi ${ticket.client_name},\n\nOur support team has replied to your ticket:\n\n"${message}"\n\nYou can view and reply here: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${ticket.ticket_code}\n\nRegards,\nSupport Team`,
			html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h3>New Support Reply</h3>
                    <p>Hi <strong>${ticket.client_name}</strong>,</p>
                    <p>Our support team has posted a reply to your ticket <strong>${ticket.ticket_code}</strong>:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; font-style: italic;">
                        ${message.replace(/\n/g, "<br/>")}
                    </div>
                    <p>To view the full history or reply back, please click the button below:</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${ticket.ticket_code}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">View Ticket & Reply</a>
                </div>
            `,
		});
	}
}

export async function updateAdminProfile(formData: FormData) {
	const session = await getSession();
	if (!session) throw new Error("Unauthorized");

	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const avatarFile = formData.get("avatar") as File;

	const data: any = { name, email };

	if (avatarFile && avatarFile.size > 0) {
		const path = await uploadFile(avatarFile);
		if (path) data.avatar = path;
	}

	const updated = await prisma.user.update({
		where: { id: session.userId },
		data,
	});

	// Update session jika email berubah
	await createSession(updated.id, updated.email, updated.role);

	revalidatePath("/admin");
	return { success: true, user: updated };
}

export async function changeAdminPassword(prevState: any, formData: FormData) {
	const session = await getSession();
	if (!session) return { error: "Unauthorized" };

	const currentPassword = formData.get("currentPassword") as string;
	const newPassword = formData.get("newPassword") as string;
	const confirmPassword = formData.get("confirmPassword") as string;

	if (newPassword !== confirmPassword)
		return { error: "New passwords do not match" };

	const user = await prisma.user.findUnique({ where: { id: session.userId } });
	if (!user) return { error: "User not found" };

	const valid = await bcrypt.compare(currentPassword, user.password);
	if (!valid) return { error: "Incorrect current password" };

	const hashedPassword = await bcrypt.hash(newPassword, 10);
	await prisma.user.update({
		where: { id: session.userId },
		data: { password: hashedPassword },
	});

	return { success: true };
}

export async function getAdminUsers() {
	const session = await getSession();
	if (!session || session.role !== "superadmin")
		throw new Error("Unauthorized");

	return await prisma.user.findMany({
		orderBy: { createdAt: "desc" },
	});
}

export async function createAdminUser(prevState: any, formData: FormData) {
	const session = await getSession();
	if (!session || session.role !== "superadmin")
		return { error: "Unauthorized" };

	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const role = formData.get("role") as string;

	if (!name || !email || !password) return { error: "Fill all fields" };

	const exists = await prisma.user.findUnique({ where: { email } });
	if (exists) return { error: "Email already taken" };

	const hashedPassword = await bcrypt.hash(password, 10);
	await prisma.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
			role: role || "admin",
		},
	});

	revalidatePath("/admin/users");
	return { success: true };
}

export async function deleteAdminUser(id: number) {
	const session = await getSession();
	if (!session || session.role !== "superadmin")
		throw new Error("Unauthorized");

	if (session.userId === id) throw new Error("Cannot delete yourself");

	await prisma.user.delete({ where: { id } });
	revalidatePath("/admin/users");
}
