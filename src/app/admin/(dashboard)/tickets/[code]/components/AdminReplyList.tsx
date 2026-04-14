import { CheckCircle2, Info, MessageSquare, User } from "lucide-react";
import { TicketReplyWithUser } from "@/lib/types";

export function AdminReplyList({
	replies,
	clientName,
}: {
	replies: TicketReplyWithUser[];
	clientName: string;
}) {
	return (
		<div className="p-6 space-y-6 bg-slate-50/50 min-h-[150px]">
			{replies.map((reply) => {
				if (reply.sender_type === "system") {
					return (
						<div key={reply.id} className="flex justify-center my-4">
							<div className="bg-blue-50/50 border border-blue-100 rounded-full px-4 py-1.5 flex items-center gap-2 text-[11px] text-blue-600 font-medium">
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
						className={`flex ${reply.sender_type === "admin" ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`relative max-w-[85%] rounded-lg p-4 text-sm shadow-sm border ${
								reply.sender_type === "admin"
									? "bg-primary text-primary-foreground border-primary"
									: "bg-white border-border text-foreground"
							}`}
						>
							<div
								className={`flex justify-between gap-4 mb-2 text-[10px] font-bold uppercase tracking-wider ${
									reply.sender_type === "admin"
										? "opacity-80"
										: "text-muted-foreground"
								}`}
							>
								<span className="flex items-center gap-1.5 ring-offset-background">
									{reply.sender_type === "admin" ? (
										<CheckCircle2 className="h-3 w-3" />
									) : reply.sender_type === "client" ? (
										<User className="h-3 w-3" />
									) : null}
									{reply.sender_type === "admin"
										? reply.user?.name || "Agent"
										: clientName}
								</span>
								<span>{new Date(reply.createdAt).toLocaleString()}</span>
							</div>
							<p className="whitespace-pre-wrap leading-relaxed">
								{reply.message}
							</p>
						</div>
					</div>
				);
			})}

			{replies.length === 0 && (
				<div className="text-center py-12 text-muted-foreground">
					<MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
					<p className="italic text-sm">No conversation yet.</p>
				</div>
			)}
		</div>
	);
}
