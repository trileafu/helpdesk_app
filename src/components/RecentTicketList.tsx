"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	getRecentTicketCodes,
	recentTicketCodesChangedEventName,
} from "@/lib/utils";

type RecentTicket = {
	ticket_code: string;
	title: string;
	status: string;
};

function getStatusStyles(status: string) {
	const styles: Record<string, string> = {
		Open: "bg-blue-100 text-blue-700 border-blue-200",
		"In Progress": "bg-amber-100 text-amber-700 border-amber-200",
		Resolved: "bg-green-100 text-green-700 border-green-200",
		Closed: "bg-gray-100 text-gray-700 border-gray-200",
	};

	return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
}

export function RecentTicketList() {
	const [ticketCodes, setTicketCodes] = useState<string[]>([]);
	const [tickets, setTickets] = useState<RecentTicket[]>([]);

	useEffect(() => {
		const controller = new AbortController();

		const syncTicketCodes = () => {
			const nextTicketCodes = getRecentTicketCodes();
			setTicketCodes(nextTicketCodes);

			if (nextTicketCodes.length === 0) {
				setTickets([]);
				return;
			}

			fetch("/api/tickets/recent", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ codes: nextTicketCodes }),
				signal: controller.signal,
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error("Failed to load recent tickets");
					}

					return response.json();
				})
				.then((data: { tickets?: RecentTicket[] }) => {
					setTickets(data.tickets ?? []);
				})
				.catch(() => {
					if (!controller.signal.aborted) {
						setTickets([]);
					}
				});
		};

		syncTicketCodes();

		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === null || event.key === "helpdesk_recent_ticket_codes") {
				syncTicketCodes();
			}
		};

		const handleRecentTicketCodesChange = () => {
			syncTicketCodes();
		};

		window.addEventListener("storage", handleStorageChange);
		window.addEventListener(
			recentTicketCodesChangedEventName(),
			handleRecentTicketCodesChange,
		);

		return () => {
			controller.abort();
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener(
				recentTicketCodesChangedEventName(),
				handleRecentTicketCodesChange,
			);
		};
	}, []);

	if (ticketCodes.length === 0) {
		return null;
	}

	return (
		<Card className="mx-auto max-w-3xl border-primary/10 shadow-lg mb-16">
			<CardHeader className="border-b bg-muted/5">
				<CardTitle className="text-xl font-bold">Your Tickets</CardTitle>
				<CardDescription>
					Recently submitted ticket codes saved in this browser.
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-6">
				<ul className="flex flex-col gap-3">
					{tickets.map((ticket) => (
						<li key={ticket.ticket_code}>
							<Button
								asChild
								variant="outline"
								className="h-auto w-full px-4 py-4"
							>
								<Link
									href={`/${ticket.ticket_code}`}
									className="flex w-full items-center justify-between gap-4 text-left"
								>
									<div className="min-w-0 flex flex-col gap-1">
										<span className="truncate text-base font-semibold text-foreground">
											{ticket.title}
										</span>
										<span className="font-mono text-xs tracking-wider text-muted-foreground">
											{ticket.ticket_code}
										</span>
									</div>
									<span
										className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(ticket.status)}`}
									>
										{ticket.status}
									</span>
								</Link>
							</Button>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
