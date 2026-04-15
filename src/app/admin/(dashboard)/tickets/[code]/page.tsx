import { prisma } from "@/lib/db";
import { analyzeTicket } from "@/lib/ai";
import AdminTicketDetail from "./AdminTicketDetail";

export default async function AdminTicketPage({
	params,
}: {
	params: Promise<{ code: string }>;
}) {
	const { code } = await params;
	const ticket = await prisma.ticket.findUnique({
		where: { ticket_code: code },
		include: {
			category: true,
			replies: { include: { user: true }, orderBy: { createdAt: "asc" } },
			aiSuggestion: true,
		},
	});

	if (!ticket) {
		return (
			<div className="p-8 text-center text-red-500 font-bold">
				Ticket not found: {code}
			</div>
		);
	}

	// Analisa AI otomatis
	let suggestion = ticket.aiSuggestion;
	if (ticket.status === "Open" && !suggestion) {
		try {
			suggestion = (await analyzeTicket(ticket.id, ticket.description)) ?? null;
		} catch (err) {
			console.error("AI Analysis failed:", err);
		}
	}

	const categories = await prisma.category.findMany();

	return (
		<AdminTicketDetail
			ticket={ticket}
			suggestion={suggestion}
			categories={categories}
		/>
	);
}
