export function TicketStatusBadge({ status }: { status: string }) {
	const styles = {
		Open: "bg-blue-100 text-blue-700 border-blue-200",
		"In Progress": "bg-amber-100 text-amber-700 border-amber-200",
		Closed: "bg-green-100 text-green-700 border-green-200",
	};
	const style = styles[status as keyof typeof styles] || "bg-gray-100";

	return (
		<span
			className={`inline-flex uppercase cursor-default items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider ${style}`}
		>
			{status}
		</span>
	);
}
