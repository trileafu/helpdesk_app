import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export function TicketStatusBadge({ status }: { status: string }) {
	const styles = {
		Open: "bg-blue-100 text-blue-700 border-blue-200",
		"In Progress": "bg-amber-100 text-amber-700 border-amber-200",
		Closed: "bg-green-100 text-green-700 border-green-200",
	};
	const icons = {
		Open: <AlertCircle className="w-3 h-3" />,
		"In Progress": <Clock className="w-3 h-3" />,
		Closed: <CheckCircle2 className="w-3 h-3" />,
	};
	const style = styles[status as keyof typeof styles] || "bg-gray-100";
	const icon = icons[status as keyof typeof icons] || null;

	return (
		<span
			className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider ${style}`}
		>
			{icon} {status}
		</span>
	);
}
