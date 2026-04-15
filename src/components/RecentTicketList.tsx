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

export function RecentTicketList() {
	const [ticketCodes, setTicketCodes] = useState<string[]>([]);

	useEffect(() => {
		const syncTicketCodes = () => {
			setTicketCodes(getRecentTicketCodes());
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
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener(
				recentTicketCodesChangedEventName(),
				handleRecentTicketCodesChange,
			);
		};
	}, []);

	return (
		ticketCodes.length > 0 && (
			<Card className="mx-auto max-w-3xl border-primary/10 shadow-lg mb-16">
				<CardHeader className="border-b bg-muted/5">
					<CardTitle className="text-xl font-bold">Your Tickets</CardTitle>
					<CardDescription>
						Recently submitted ticket codes saved in this browser.
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-6">
					<ul className="flex flex-col gap-3">
						{ticketCodes.map((ticketCode) => (
							<li key={ticketCode}>
								<Button
									asChild
									variant="outline"
									className="h-auto w-full justify-between px-4 py-4 font-mono text-base tracking-wider"
								>
									<Link href={`/${ticketCode}`}>
										<span>{ticketCode}</span>
										<span className="font-sans text-sm font-medium text-muted-foreground">
											View
										</span>
									</Link>
								</Button>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		)
	);
}
