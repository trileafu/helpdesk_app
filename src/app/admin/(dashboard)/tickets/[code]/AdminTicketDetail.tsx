"use client";

import { useState, useEffect } from "react";
import { updateTicket, replyAdmin } from "@/app/admin/actions";
import { getTicketReplies, getTicketFull } from "@/app/actions";
import { Category } from "@prisma/client";
import { TicketReplyWithUser, TicketWithDetails } from "@/lib/types";
import { AdminReplyList } from "./components/AdminReplyList";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Sparkles,
	MessageSquare,
	Paperclip,
	Send,
	Clock,
	User,
	Hash,
	AlertTriangle,
} from "lucide-react";

export default function AdminTicketDetail({
	ticket: initialTicket,
	suggestion: initialSuggestion,
	categories,
}: {
	ticket: TicketWithDetails;
	suggestion: TicketWithDetails["aiSuggestion"];
	categories: Category[];
}) {
	const [ticket, setTicket] = useState<TicketWithDetails>(initialTicket);
	const [suggestion, setSuggestion] = useState(initialSuggestion);
	const [reply, setReply] = useState("");
	const [loading, setLoading] = useState(false);
	const [replies, setReplies] = useState<TicketReplyWithUser[]>(
		initialTicket.replies || [],
	);

	// Polling Status Ticket
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
					if (latest.aiSuggestion !== suggestion) {
						setSuggestion(latest.aiSuggestion);
					}
				}
			} catch (err) {
				console.error("Polling error:", err);
			}
		}, 5000); // Poll setiap 5 detik

		return () => clearInterval(pollInterval);
	}, [
		ticket.ticket_code,
		ticket.status,
		ticket.priority,
		ticket.category_id,
		replies.length,
		suggestion,
	]);

	const handleUpdate = async (field: string, value: string | number) => {
		setLoading(true);
		const updated = await updateTicket(ticket.id, { [field]: value });
		if (updated) {
			const latest = await getTicketFull(ticket.ticket_code);
			if (latest) {
				setTicket(latest);
				setReplies(latest.replies);
			}
		}
		setLoading(false);
	};

	const handleAcceptAI = async () => {
		if (!suggestion) return;
		setLoading(true);
		const cat = categories.find(
			(c) => c.category_name === suggestion.ai_suggested_category,
		);
		const catId = cat ? cat.id : undefined;

		await updateTicket(ticket.id, {
			priority: suggestion.ai_suggested_priority,
			category_id: catId,
		});

		const latest = await getTicketFull(ticket.ticket_code);
		if (latest) {
			setTicket(latest);
			setReplies(latest.replies);
		}
		setLoading(false);
	};

	const handleReply = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!reply.trim()) return;
		setLoading(true);
		await replyAdmin(ticket.id, reply);
		setReply("");

		const latest = await getTicketReplies(ticket.id);
		setReplies(latest);
		setLoading(false);
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
			{/* Main Content */}
			<div className="lg:col-span-2 space-y-6">
				{/* AI Panel */}
				{suggestion &&
					ticket.status === "Open" &&
					(!ticket.priority ||
						ticket.priority !== suggestion.ai_suggested_priority) && (
						<Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm relative overflow-hidden">
							<div className="absolute top-0 right-0 p-4 opacity-10">
								<Sparkles className="w-24 h-24 text-indigo-500" />
							</div>
							<CardHeader className="pb-2 text-indigo-900">
								<div className="flex justify-between items-center">
									<CardTitle className="flex items-center gap-2 text-lg">
										<Sparkles className="h-5 w-5 fill-indigo-500 text-indigo-500" />{" "}
										AI Analysis
									</CardTitle>
									<span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
										Gemini Powered
									</span>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="bg-white/60 p-3 rounded-md text-sm text-foreground/80 leading-relaxed border border-indigo-100/50">
									<span className="font-semibold block text-indigo-600 text-xs uppercase mb-1">
										Issue Summary
									</span>
									{suggestion.ai_summary}
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="bg-white/60 p-3 rounded-md border border-indigo-100/50">
										<div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
											Suggested Category
										</div>
										<div className="font-medium text-indigo-900">
											{suggestion.ai_suggested_category}
										</div>
									</div>
									<div className="bg-white/60 p-3 rounded-md border border-indigo-100/50">
										<div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
											Suggested Priority
										</div>
										<div
											className={`font-bold ${suggestion.ai_suggested_priority === "High" ? "text-red-600" : "text-foreground"}`}
										>
											{suggestion.ai_suggested_priority}
										</div>
									</div>
								</div>
								<Button
									onClick={handleAcceptAI}
									disabled={loading}
									size="sm"
									className="bg-indigo-600 hover:bg-indigo-700 w-full mt-2"
								>
									Apply AI Suggestions
								</Button>
							</CardContent>
						</Card>
					)}

				<Card className="shadow-sm border-none ring-1 ring-border">
					<CardHeader className="border-b bg-muted/20 py-4">
						<div className="flex justify-between items-start gap-4">
							<div>
								<CardTitle className="text-xl leading-tight font-bold">
									{ticket.title}
								</CardTitle>
								<div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
									<Clock className="w-3.5 h-3.5" />
									<span>
										Created {new Date(ticket.createdAt).toLocaleString()}
									</span>
									<span className="opacity-50">|</span>
									<User className="w-3.5 h-3.5" />
									<span className="font-medium text-foreground">
										{ticket.client_name}
									</span>
								</div>
							</div>
							<div className="font-mono text-xs font-bold text-muted-foreground bg-white border px-2 py-1 rounded shadow-sm flex items-center gap-1.5">
								<Hash className="w-3 h-3" /> {ticket.ticket_code}
							</div>
						</div>
					</CardHeader>

					<CardContent className="pt-6 pb-8 space-y-6">
						<div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans">
							{ticket.description}
						</div>

						{ticket.attachment && (
							<a
								href={ticket.attachment}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-md text-sm text-primary hover:bg-primary/10 transition-colors font-bold"
							>
								<Paperclip className="h-4 w-4" /> View Attachment
							</a>
						)}
					</CardContent>

					{/* Replies List */}
					<div className="border-t">
						<div className="bg-muted/10 p-4 border-b">
							<h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
								<MessageSquare className="h-4 w-4" /> Discussion Thread (
								{replies.length})
							</h3>
						</div>
						<div className="p-6 space-y-6 bg-slate-50/50 min-h-[150px]">
							<AdminReplyList
								replies={replies}
								clientName={ticket.client_name}
							/>
						</div>

						{/* Reply Box */}
						<div className="p-6 bg-white border-t">
							<h3 className="font-semibold text-sm mb-3">Post a Reply</h3>
							<form onSubmit={handleReply} className="space-y-4">
								<Textarea
									className="min-h-[120px] resize-y font-sans"
									placeholder="Type your official response..."
									value={reply}
									onChange={(e) => setReply(e.target.value)}
									required
								/>
								<div className="flex justify-end">
									<Button disabled={loading || !reply.trim()} className="gap-2">
										{loading ? (
											"Sending..."
										) : (
											<>
												<Send className="w-4 h-4" /> Send Reply
											</>
										)}
									</Button>
								</div>
							</form>
						</div>
					</div>
				</Card>
			</div>

			{/* Sidebar Controls */}
			<div className="space-y-6">
				{!ticket.priority && (
					<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
						<AlertTriangle className="h-5 w-5 flex-shrink-0" />
						<div>
							<div className="font-bold text-xs uppercase mb-1">
								Attention Required
							</div>
							<p className="text-xs leading-relaxed">
								This ticket has no priority assigned. Please review AI
								suggestions or set it manually.
							</p>
						</div>
					</div>
				)}
				<Card className="shadow-sm border-none ring-1 ring-border sticky top-24">
					<CardHeader className="py-3 border-b bg-muted/20">
						<CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-widest">
							Ticket Controls
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6 pt-3">
						<div className="space-y-2">
							<label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
								Status
							</label>
							<div className="relative">
								<select
									value={ticket.status}
									onChange={(e) => handleUpdate("status", e.target.value)}
									className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-medium cursor-pointer"
									disabled={loading}
								>
									<option value="Open">Open</option>
									<option value="In Progress">In Progress</option>
									<option value="Resolved">Resolved</option>
									<option value="Closed">Closed</option>
								</select>
								<div className="absolute right-3 top-2.5 pointer-events-none opacity-50">
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M19 9l-7 7-7-7"
										></path>
									</svg>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
								Priority
							</label>
							<div className="relative">
								<select
									value={ticket.priority || ""}
									onChange={(e) => handleUpdate("priority", e.target.value)}
									className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-bold cursor-pointer ${
										ticket.priority === "High"
											? "text-red-600"
											: "text-foreground"
									}`}
									disabled={loading}
								>
									<option value="">Unassigned</option>
									<option value="Low">Low</option>
									<option value="Medium">Medium</option>
									<option value="High">High</option>
								</select>
								<div className="absolute right-3 top-2.5 pointer-events-none opacity-50">
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M19 9l-7 7-7-7"
										></path>
									</svg>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
								Category
							</label>
							<div className="relative">
								<select
									value={ticket.category_id}
									onChange={(e) =>
										handleUpdate("category_id", parseInt(e.target.value))
									}
									className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-medium cursor-pointer"
									disabled={loading}
								>
									{categories.map((c) => (
										<option key={c.id} value={c.id}>
											{c.category_name}
										</option>
									))}
								</select>
								<div className="absolute right-3 top-2.5 pointer-events-none opacity-50">
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M19 9l-7 7-7-7"
										></path>
									</svg>
								</div>
							</div>
						</div>
					</CardContent>
					<div className="p-4 border-t bg-muted/10 space-y-4">
						<div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
							Client Contact
						</div>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm ring-1 ring-blue-200">
								{ticket.client_name.charAt(0)}
							</div>
							<div className="overflow-hidden">
								<div className="font-bold text-sm truncate">
									{ticket.client_name}
								</div>
								<div className="text-xs text-muted-foreground truncate">
									{ticket.client_email}
								</div>
							</div>
						</div>
						<Button variant="outline" className="w-full text-xs h-8" asChild>
							<a
								href={`mailto:${ticket.client_email}`}
								className="flex items-center gap-2"
							>
								<Send className="w-3 h-3" /> Send Direct Email
							</a>
						</Button>
					</div>
				</Card>
			</div>
		</div>
	);
}
