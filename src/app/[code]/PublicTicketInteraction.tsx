"use client";

import { useState, useEffect } from "react";
import { getTicketFull, replyClient } from "@/app/actions";
import { PublicTicketSidebar } from "./components/PublicTicketSidebar";
import { PublicReplyList } from "./components/PublicReplyList";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	MessageSquare,
	User,
	Send,
	Loader2,
	ChevronRight,
	Paperclip,
} from "lucide-react";
import { TicketReplyWithUser, TicketWithDetails } from "@/lib/types";

export default function PublicTicketInteraction({
	initialTicket,
	clientName,
}: {
	initialTicket: TicketWithDetails;
	clientName: string;
}) {
	const [ticket, setTicket] = useState<TicketWithDetails>(initialTicket);
	const [replies, setReplies] = useState<TicketReplyWithUser[]>(
		initialTicket.replies || [],
	);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	// Polling Ticket dan Replies
	useEffect(() => {
		const pollInterval = setInterval(async () => {
			try {
				const latest = await getTicketFull(ticket.ticket_code);
				if (latest) {
					if (latest.replies.length !== replies.length) {
						setReplies(latest.replies);
					}
					if (
						latest.status !== ticket.status ||
						latest.priority !== ticket.priority ||
						latest.category_id !== ticket.category_id
					) {
						setTicket(latest);
					}
				}
			} catch (err) {
				console.error("Polling error:", err);
			}
		}, 1000);

		return () => clearInterval(pollInterval);
	}, [
		ticket.ticket_code,
		ticket.status,
		ticket.priority,
		ticket.category_id,
		replies.length,
	]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!message.trim()) return;

		setLoading(true);
		try {
			await replyClient(ticket.id, message);
			setMessage("");
			const latest = await getTicketFull(ticket.ticket_code);
			if (latest) setReplies(latest.replies);
		} catch (err) {
			console.error("Reply error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col lg:flex-row gap-8">
			{/* Sidebar Info */}
			<div className="w-full lg:w-1/3 space-y-6">
				<PublicTicketSidebar ticket={ticket} />
			</div>

			{/* Main Content */}
			<div className="w-full lg:w-2/3 space-y-6">
				<Card className="shadow-sm border-none ring-1 ring-border">
					<CardHeader className="border-b bg-muted/20">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
									<User />
								</div>
								<div>
									<CardTitle className="text-xl md:text-2xl font-bold">
										{ticket.client_name}
									</CardTitle>
									<CardDescription className="flex items-center gap-1.5">
										{ticket.client_email}
									</CardDescription>
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-8">
						<h2 className="text-lg font-bold mb-4 flex items-center gap-2">
							<ChevronRight className="w-5 h-5 text-primary" /> {ticket.title}
						</h2>
						<div className="prose prose-sm whitespace-pre-wrap prose-slate max-w-none bg-slate-50 p-6 rounded-lg border border-slate-200/60 leading-relaxed font-sans text-slate-700">
							{ticket.description}
						</div>

						{ticket.attachment && (
							<div className="mt-6">
								<a
									href={ticket.attachment}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-md text-sm text-primary hover:bg-primary/10 transition-colors font-bold"
								>
									<Paperclip className="h-4 w-4" /> View Attachment
								</a>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Discussion History */}
				<div className="space-y-6">
					<h3 className="font-bold text-foreground text-lg flex items-center gap-2 px-1">
						<MessageSquare className="w-5 h-5 text-primary" /> Discussion
						History
					</h3>

					<div className="space-y-8">
						<PublicReplyList replies={replies} clientName={clientName} />
					</div>
				</div>

				{/* Reply Form */}
				<Card className="border-none ring-1 ring-border shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg font-bold flex items-center gap-2">
							<MessageSquare className="w-4 h-4 text-primary" /> Add a Reply
						</CardTitle>
						<CardDescription>
							Need to add more information? Send a follow-up message.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-4">
						<form onSubmit={handleSubmit} className="space-y-4">
							<Textarea
								className="min-h-[120px] resize-y bg-background font-sans"
								placeholder="Type your message to the support team here..."
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								required
							/>
							<div className="flex justify-end">
								<Button
									type="submit"
									disabled={loading || !message.trim()}
									className="gap-2"
								>
									{loading ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Send className="w-4 h-4" />
									)}
									{loading ? "Sending..." : "Send Reply"}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
