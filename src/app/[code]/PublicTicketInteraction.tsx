"use client";

import { useState, useEffect } from "react";
import { getTicketFull, replyClient } from "@/app/actions";
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
	Clock,
	User,
	CheckCircle2,
	AlertCircle,
	Send,
	Loader2,
	Tag,
	ChevronRight,
	Paperclip,
	Info,
} from "lucide-react";

export default function PublicTicketInteraction({
	initialTicket,
	clientName,
}: {
	initialTicket: any;
	clientName: string;
}) {
	const [ticket, setTicket] = useState(initialTicket);
	const [replies, setReplies] = useState(initialTicket.replies || []);
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
		}, 5000);

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

	// Helpers
	const getPriorityColor = (p: string | null) => {
		switch (p) {
			case "High":
				return "bg-red-500";
			case "Medium":
				return "bg-yellow-500";
			case "Low":
				return "bg-green-500";
			default:
				return "bg-gray-300";
		}
	};

	const getStatusBadge = (s: string) => {
		const styles = {
			Open: "bg-blue-100 text-blue-700 border-blue-200",
			"In Progress": "bg-amber-100 text-amber-700 border-amber-200",
			Closed: "bg-green-100 text-green-700 border-green-200",
		};
		const style = styles[s as keyof typeof styles] || "bg-gray-100";
		return (
			<span
				className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border transition-colors ${style}`}
			>
				{s}
			</span>
		);
	};

	return (
		<div className="flex flex-col lg:flex-row gap-8">
			{/* Sidebar Info */}
			<div className="w-full lg:w-1/3 space-y-6">
				<Card className="border-t-4 sticky top-8 border-t-primary shadow-sm hover:shadow-md transition-shadow">
					<CardHeader className="pb-4 border-b">
						<CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
							<Tag className="w-3.5 h-3.5" /> Ticket Details
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6 pt-6">
						<div>
							<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
								Ticket ID
							</label>
							<div className="font-mono text-xl font-bold text-foreground tracking-tight mt-1 truncate">
								{ticket.ticket_code}
							</div>
						</div>

						<div>
							<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
								Status
							</label>
							<div className="mt-2">{getStatusBadge(ticket.status)}</div>
						</div>

						<div>
							<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
								Category
							</label>
							<div className="text-sm font-bold text-foreground mt-1 flex items-center gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
								{ticket.category.category_name}
							</div>
						</div>

						<div>
							<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
								Submitted On
							</label>
							<div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
								<Clock className="w-3.5 h-3.5" />
								{new Date(ticket.createdAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "short",
									day: "numeric",
								})}
							</div>
						</div>

						<div>
							<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
								Priority
							</label>
							<div className="flex items-center gap-2 mt-1">
								<span
									className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(ticket.priority)} shadow-sm`}
								></span>
								<span className="text-sm font-bold capitalize">
									{ticket.priority || "Assessment Pending"}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<div className="w-full lg:w-2/3 space-y-6">
				<Card className="shadow-sm border-none ring-1 ring-border">
					<CardHeader className="border-b bg-muted/20">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
									{ticket.client_name.charAt(0).toUpperCase()}
								</div>
								<div>
									<CardTitle className="text-xl md:text-2xl font-bold">
										{ticket.client_name}
									</CardTitle>
									<CardDescription className="flex items-center gap-1.5">
										<User className="w-3 h-3" /> {ticket.client_email}
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
						{replies.map((reply: any) => {
							if (reply.sender_type === "system") {
								return (
									<div key={reply.id} className="flex justify-center">
										<div className="bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 flex items-center gap-2 text-[11px] text-slate-600 font-medium">
											<Info className="w-3.5 h-3.5" />
											{reply.message}
											<span className="opacity-40 text-[9px] ml-1">
												{new Date(reply.createdAt).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									</div>
								);
							}
							return (
								<div
									key={reply.id}
									className={`flex ${reply.sender_type === "admin" ? "justify-start" : "justify-end"}`}
								>
									<div
										className={`relative max-w-[85%] rounded-2xl p-6 shadow-sm border ${
											reply.sender_type === "admin"
												? "bg-white border-border rounded-tl-sm shadow-indigo-50/50"
												: "bg-primary text-primary-foreground border-primary rounded-tr-sm shadow-primary/20"
										}`}
									>
										<div className="flex justify-between items-center mb-4 gap-6">
											<span
												className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${reply.sender_type === "admin" ? "text-primary" : "text-primary-foreground/90"}`}
											>
												{reply.sender_type === "admin" ? (
													<CheckCircle2 className="w-3 h-3" />
												) : (
													<User className="w-3 h-3" />
												)}
												{reply.sender_type === "admin"
													? reply.user?.name || "Support Team"
													: clientName}
											</span>
											<span
												className={`text-[10px] font-medium opacity-80 flex items-center gap-1 ${reply.sender_type === "admin" ? "text-muted-foreground" : "text-primary-foreground/70"}`}
											>
												<Clock className="w-2.5 h-2.5" />
												{new Date(reply.createdAt).toLocaleString()}
											</span>
										</div>
										<p
											className={`text-sm whitespace-pre-wrap leading-relaxed font-sans ${reply.sender_type === "admin" ? "text-slate-700" : "text-primary-foreground"}`}
										>
											{reply.message}
										</p>
									</div>
								</div>
							);
						})}
						{replies.length === 0 && (
							<div className="text-center text-muted-foreground italic py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
								<AlertCircle className="w-10 h-10 opacity-20" />
								<p className="text-sm">
									No replies yet. Our team will review your ticket soon.
								</p>
							</div>
						)}
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
