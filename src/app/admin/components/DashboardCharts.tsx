"use client";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyStatPoint, TopCategoryPoint } from "@/lib/types";

export default function DashboardCharts({
	data,
	topCategories,
}: {
	data: MonthlyStatPoint[];
	topCategories: TopCategoryPoint[];
}) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card className="shadow-sm border-none ring-1 ring-border">
				<CardHeader className="py-4 border-b">
					<CardTitle className="text-base font-semibold">
						Monthly Ticket Activity
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6">
					<div className="h-[300px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={data}>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									stroke="#e5e7eb"
								/>
								<XAxis
									dataKey="name"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#6b7280", fontSize: 12 }}
									dy={10}
								/>
								<YAxis
									allowDecimals={false}
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#6b7280", fontSize: 12 }}
								/>
								<Tooltip
									cursor={{ fill: "#f3f4f6" }}
									contentStyle={{
										borderRadius: "8px",
										border: "1px solid #e5e7eb",
										boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
									}}
								/>
								<Legend
									iconType="circle"
									wrapperStyle={{ paddingTop: "20px" }}
								/>
								<Bar
									dataKey="Created"
									fill="#2563eb"
									radius={[4, 4, 0, 0]}
									maxBarSize={40}
								/>
								<Bar
									dataKey="Closed"
									fill="#16a34a"
									radius={[4, 4, 0, 0]}
									maxBarSize={40}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-sm border-none ring-1 ring-border">
				<CardHeader className="py-4 border-b">
					<CardTitle className="text-base font-semibold">
						Top Issues by Category
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6">
					<div className="h-[300px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={topCategories}
								layout="vertical"
								margin={{ left: 10, right: 30 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									horizontal={true}
									vertical={false}
									stroke="#e5e7eb"
								/>
								<XAxis
									type="number"
									allowDecimals={false}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									dataKey="name"
									type="category"
									width={100}
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
								/>
								<Tooltip
									cursor={{ fill: "transparent" }}
									contentStyle={{
										borderRadius: "8px",
										border: "1px solid #e5e7eb",
										boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
									}}
								/>
								<Legend
									iconType="circle"
									wrapperStyle={{ paddingTop: "20px" }}
								/>
								<Bar
									dataKey="count"
									name="Total Tickets"
									fill="#c026d3"
									radius={[0, 4, 4, 0]}
									barSize={24}
								></Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
