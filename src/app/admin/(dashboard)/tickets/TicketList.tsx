"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllTickets } from "@/app/actions";
import { TicketWithCategory } from "@/lib/types";
import { TicketStatusBadge } from "./components/TicketStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
	Ticket,
	Calendar,
	ArrowRight,
	Tag,
	Search,
	X,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function TicketList({
	initialTickets,
}: {
	initialTickets: TicketWithCategory[];
}) {
	const [tickets, setTickets] = useState<TicketWithCategory[]>(initialTickets);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		const pollInterval = setInterval(async () => {
			try {
				const latest = await getAllTickets();
				setTickets(latest);
			} catch (err) {
				console.error("Polling error:", err);
			}
		}, 10000);

		return () => clearInterval(pollInterval);
	}, []);

	const filteredTickets = tickets.filter((t) => {
		if (!searchQuery) return true;
		const q = searchQuery.toLowerCase();
		return (
			t.ticket_code?.toLowerCase().includes(q) ||
			t.title?.toLowerCase().includes(q) ||
			t.client_name?.toLowerCase().includes(q) ||
			t.client_email?.toLowerCase().includes(q) ||
			t.category?.category_name?.toLowerCase().includes(q)
		);
	});

	const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
	const paginatedTickets = filteredTickets.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	return (
		<div className="space-y-6">
			<div className="relative w-full">
				<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<Input
					placeholder="Search by ID, name, or subject..."
					className="pl-11 h-11 border-none bg-white ring-1 ring-border shadow-sm focus-visible:ring-primary"
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value);
						setCurrentPage(1);
					}}
				/>
				{searchQuery && (
					<button
						onClick={() => {
							setSearchQuery("");
							setCurrentPage(1);
						}}
						className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
					>
						<X className="w-3 h-3 text-muted-foreground" />
					</button>
				)}
			</div>

			<Card className="border-none ring-1 ring-border overflow-hidden bg-white">
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm whitespace-nowrap">
							<thead className="bg-muted/30 text-muted-foreground font-bold text-[10px] tracking-widest border-b">
								<tr>
									<th className="py-4 px-6">Submitted</th>
									<th className="py-4 px-6">Reference ID</th>
									<th className="py-4 px-6">Issue</th>
									<th className="py-4 px-6">Client</th>
									<th className="py-4 px-6">Status</th>
									<th className="py-4 px-6">Priority</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{paginatedTickets.map((t) => (
									<tr
										key={t.id}
										className="hover:bg-muted/20 transition-all duration-200 group"
									>
										<td className="py-4 px-6">
											<div className="flex items-center gap-2 text-muted-foreground">
												<Calendar className="w-3.5 h-3.5 opacity-50" />
												<span className="font-medium text-xs">
													{new Date(t.createdAt).toLocaleDateString()}
												</span>
											</div>
										</td>
										<td className="py-4 px-6">
											<Link
												href={`/admin/tickets/${t.ticket_code}`}
												className="font-mono text-xs font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all duration-200 px-2 py-1 rounded border border-primary/10"
											>
												{t.ticket_code}
											</Link>
										</td>
										<td className="py-4 px-6">
											<div className="flex flex-col -space-y-0.5">
												<Link
													href={`/admin/tickets/${t.ticket_code}`}
													className="font-bold text-foreground text-sm truncate hover:text-primary transition-colors"
													title={t.title}
												>
													{t.title}
												</Link>
												<span className="text-[10px] text-muted-foreground flex items-center gap-1">
													<Tag className="w-3 h-3 opacity-50" />{" "}
													{t.category.category_name}
												</span>
											</div>
										</td>
										<td className="py-4 px-6">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs ring-1 ring-slate-200">
													{t.client_name.charAt(0)}
												</div>
												<div className="flex flex-col -space-y-0.5">
													<span className="font-bold text-xs text-foreground tracking-tight">
														{t.client_name}
													</span>
													<span className="text-[10px] text-muted-foreground">
														{t.client_email}
													</span>
												</div>
											</div>
										</td>
										<td className="py-4 px-6">
											<TicketStatusBadge status={t.status} />
										</td>
										<td className="py-4 px-6">
											{t.priority ? (
												<div className="flex items-center gap-2">
													<span
														className={`h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm ${
															t.priority === "High"
																? "bg-red-500"
																: t.priority === "Medium"
																	? "bg-amber-500"
																	: "bg-green-500"
														}`}
													/>
													<span
														className={`text-[11px] font-bold ${
															t.priority === "High"
																? "text-red-600"
																: "text-slate-600"
														}`}
													>
														{t.priority}
													</span>
												</div>
											) : (
												<span className="text-muted-foreground text-[10px] font-bold tracking-widest opacity-70">
													PENDING
												</span>
											)}
										</td>
										<td className="py-4 px-6 text-center">
											<Link href={`/admin/tickets/${t.ticket_code}`}>
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
												>
													<ArrowRight className="w-4 h-4" />
												</Button>
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{filteredTickets.length === 0 ? (
						<div className="p-16 text-center flex flex-col items-center justify-center gap-3 bg-muted/5">
							<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
								<Ticket className="w-8 h-8 text-muted-foreground/30" />
							</div>
							<div className="space-y-1">
								<p className="font-bold text-foreground">No tickets found</p>
								<p className="text-xs text-muted-foreground">
									Try adjusting your filters or search criteria.
								</p>
							</div>
						</div>
					) : (
						<div className="px-6 py-4 flex items-center justify-between border-t bg-muted/5">
							<div className="text-xs text-muted-foreground font-medium">
								Showing{" "}
								<span className="text-foreground font-bold">
									{Math.min(
										filteredTickets.length,
										(currentPage - 1) * ITEMS_PER_PAGE + 1,
									)}
								</span>{" "}
								to{" "}
								<span className="text-foreground font-bold">
									{Math.min(
										filteredTickets.length,
										currentPage * ITEMS_PER_PAGE,
									)}
								</span>{" "}
								of{" "}
								<span className="text-foreground font-bold">
									{filteredTickets.length}
								</span>{" "}
								tickets
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setCurrentPage((prev) => Math.max(1, prev - 1))
									}
									disabled={currentPage === 1}
									className="h-8 gap-1 text-xs font-bold"
								>
									<ChevronLeft className="w-3.5 h-3.5" /> Previous
								</Button>
								<div className="flex items-center gap-1">
									{[...Array(totalPages)].map((_, i) => {
										const pageNum = i + 1;
										if (
											pageNum === 1 ||
											pageNum === totalPages ||
											(pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
										) {
											return (
												<Button
													key={pageNum}
													variant={
														currentPage === pageNum ? "default" : "ghost"
													}
													size="sm"
													onClick={() => setCurrentPage(pageNum)}
													className={`h-8 w-8 text-xs font-bold ${currentPage === pageNum ? "shadow-md shadow-primary/20" : ""}`}
												>
													{pageNum}
												</Button>
											);
										} else if (
											pageNum === currentPage - 2 ||
											pageNum === currentPage + 2
										) {
											return (
												<span
													key={pageNum}
													className="text-muted-foreground px-1 text-xs"
												>
													...
												</span>
											);
										}
										return null;
									})}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setCurrentPage((prev) => Math.min(totalPages, prev + 1))
									}
									disabled={currentPage === totalPages}
									className="h-8 gap-1 text-xs font-bold"
								>
									Next <ChevronRight className="w-3.5 h-3.5" />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
