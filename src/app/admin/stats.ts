import { prisma } from "@/lib/db";
import { MonthlyStatPoint, TopCategoryPoint } from "@/lib/types";

type MonthlyCountRow = {
	month: string;
	count: number | bigint;
};

export async function getMonthlyStats() {
	try {
		const created = await prisma.$queryRaw<MonthlyCountRow[]>`
        SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
        FROM tickets 
        WHERE created_at >= date('now', 'start of year')
        GROUP BY month
      `;

		const closed = await prisma.$queryRaw<MonthlyCountRow[]>`
        SELECT strftime('%Y-%m', updated_at) as month, COUNT(*) as count 
        FROM tickets 
        WHERE status = 'Closed' AND updated_at >= date('now', 'start of year')
        GROUP BY month
      `;

		const months = [
			"01",
			"02",
			"03",
			"04",
			"05",
			"06",
			"07",
			"08",
			"09",
			"10",
			"11",
			"12",
		];
		const data: MonthlyStatPoint[] = months.map((m) => {
			const c = created.find((r) => r.month.endsWith(`-${m}`));
			const cl = closed.find((r) => r.month.endsWith(`-${m}`));
			return {
				name: new Date(`2024-${m}-01`).toLocaleString("default", {
					month: "short",
				}),
				Created: c ? Number(c.count) : 0,
				Closed: cl ? Number(cl.count) : 0,
			};
		});

		return data;
	} catch (e) {
		console.error(e);
		return [];
	}
}

export async function getTopCategories() {
	const cats = await prisma.ticket.groupBy({
		by: ["category_id"],
		_count: {
			category_id: true,
		},
		orderBy: {
			_count: {
				category_id: "desc",
			},
		},
		take: 10,
	});

	const result: TopCategoryPoint[] = [];
	for (const item of cats) {
		const category = await prisma.category.findUnique({
			where: { id: item.category_id },
		});
		if (category) {
			result.push({
				name: category.category_name,
				count: item._count.category_id,
			});
		}
	}
	return result;
}
