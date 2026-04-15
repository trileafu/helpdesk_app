import { getMonthlyStats, getTopCategories } from "@/app/admin/stats";
import DashboardCharts from "@/app/admin/components/DashboardCharts";
import { prisma } from "@/lib/db";
import ExportButton from "./ExportButton";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Flame, CheckCircle2, Bot } from "lucide-react";

export default async function DashboardPage() {
	const monthlyStats = await getMonthlyStats();
	const topCategories = await getTopCategories();

	const allTickets = await prisma.ticket.findMany({
		include: { category: true },
	});

	const exportData = allTickets.map((t) => ({
		ID: t.ticket_code,
		Client: t.client_name,
		Email: t.client_email,
		Title: t.title,
		Category: t.category.category_name,
		Status: t.status,
		Priority: t.priority,
		Created: t.createdAt.toISOString(),
		Closed: t.status === "Closed" ? t.updatedAt.toISOString() : "",
	}));

	const stats = [
		{
			label: "Total Tickets",
			value: allTickets.length,
			icon: <ClipboardList className="w-6 h-6" />,
			color: "text-blue-600",
			bg: "bg-blue-50",
		},
		{
			label: "Open",
			value: allTickets.filter((t) => t.status === "Open").length,
			icon: <Flame className="w-6 h-6" />,
			color: "text-amber-600",
			bg: "bg-amber-50",
		},
		{
			label: "In Progress",
			value: allTickets.filter((t) => t.status === "In Progress").length,
			icon: <Bot className="w-6 h-6" />,
			color: "text-purple-600",
			bg: "bg-purple-50",
		},
		{
			label: "Resolved",
			value: allTickets.filter((t) => t.status === "Resolved").length,
			icon: <CheckCircle2 className="w-6 h-6" />,
			color: "text-green-600",
			bg: "bg-green-50",
		},
		{
			label: "Closed",
			value: allTickets.filter((t) => t.status === "Closed").length,
			icon: <CheckCircle2 className="w-6 h-6" />,
			color: "text-gray-600",
			bg: "bg-gray-50",
		},
	];

	return (
		<div className="space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
				</div>
				<ExportButton data={exportData} />
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
				{stats.map((stat, i) => (
					<Card key={i} className="shadow-sm border-none ring-1 ring-border">
						<CardContent className="p-6 flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
									{stat.label}
								</p>
								<p className="text-3xl font-bold mt-2">{stat.value}</p>
							</div>
							<div className={`p-3 rounded-xl ${stat.bg}`}>
								<span className={`text-2xl ${stat.color}`}>{stat.icon}</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<DashboardCharts data={monthlyStats} topCategories={topCategories} />
		</div>
	);
}
