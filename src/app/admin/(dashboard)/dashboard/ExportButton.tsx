"use client";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

type ExportRow = Record<string, string | number | null>;

export default function ExportButton({ data }: { data: ExportRow[] }) {
	const handleExport = () => {
		const ws = XLSX.utils.json_to_sheet(data);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Tickets Report");
		XLSX.writeFile(wb, "Helpdesk_Report.xlsx");
	};
	return (
		<Button
			onClick={handleExport}
			variant="outline"
			className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
		>
			<span className="mr-2">📥</span> Export Excel
		</Button>
	);
}
