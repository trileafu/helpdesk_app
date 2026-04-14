import { trackTicket } from "@/app/actions";
import Link from "next/link";
import PublicTicketInteraction from "./PublicTicketInteraction";
import { Button } from "@/components/ui/button";
import { Frown, ArrowLeft } from "lucide-react";

export default async function TicketStatusPage({
	params,
}: {
	params: Promise<{ code: string }>;
}) {
	const { code } = await params;
	const ticket = await trackTicket(code);

	if (!ticket) {
		return (
			<div className="min-h-screen flex items-center justify-center flex-col bg-slate-50 p-4 font-sans">
				<Frown className="w-16 h-16 text-muted-foreground mb-4" />
				<h2 className="text-2xl font-bold text-gray-800">Ticket Not Found</h2>
				<p className="text-muted-foreground mt-2 text-center max-w-md">
					We couldn&apos;t find a ticket with reference:{" "}
					<span className="font-mono bg-muted px-2 rounded font-bold text-foreground">
						{code}
					</span>
				</p>
				<Link
					href="/"
					className="mt-8 transition-transform hover:scale-105 active:scale-95 duration-200"
				>
					<Button variant="default" className="gap-2">
						<ArrowLeft className="w-4 h-4" /> Back to Home
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8 font-sans">
			<div className="container max-w-5xl mx-auto">
				<Link
					href="/"
					className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors gap-2 group"
				>
					<ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />{" "}
					Back to Home
				</Link>

				<PublicTicketInteraction
					initialTicket={ticket}
					clientName={ticket.client_name}
				/>
			</div>
		</main>
	);
}
