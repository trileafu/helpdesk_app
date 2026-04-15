import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Tag } from "lucide-react";
import { TicketWithDetails } from "@/lib/types";

function getPriorityColor(priority: string | null) {
	switch (priority) {
		case "High":
			return "bg-red-500";
		case "Medium":
			return "bg-yellow-500";
		case "Low":
			return "bg-green-500";
		default:
			return "bg-gray-300";
	}
}

function getStatusBadge(status: string) {
	const styles = {
		Open: "bg-blue-100 text-blue-700 border-blue-200",
		"In Progress": "bg-amber-100 text-amber-700 border-amber-200",
		Resolved: "bg-green-100 text-green-700 border-green-200",
		Closed: "bg-gray-100 text-gray-700 border-gray-200",
	};
	const style = styles[status as keyof typeof styles] || "bg-gray-100";

	return (
		<span
			className={`inline-flex uppercase px-3 py-1 rounded-full text-xs font-bold border transition-colors ${style}`}
		>
			{status}
		</span>
	);
}

export function PublicTicketSidebar({ ticket }: { ticket: TicketWithDetails }) {
	return (
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
	);
}
