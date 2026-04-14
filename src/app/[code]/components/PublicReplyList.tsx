import { AlertCircle, CheckCircle2, Clock, Info, User } from "lucide-react";
import { TicketReplyWithUser } from "@/lib/types";

export function PublicReplyList({
	replies,
	clientName,
}: {
	replies: TicketReplyWithUser[];
	clientName: string;
}) {
	return (
		<div className="space-y-8">
			{replies.map((reply) => {
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
	);
}
