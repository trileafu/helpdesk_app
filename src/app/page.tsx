import { getCategories } from "./actions";
import TicketForm from "@/components/TicketForm";
import Link from "next/link";
import { LifeBuoy, Rocket, User } from "lucide-react";
import { TrackTicketDialog } from "@/components/TrackTicketDialog";

export default async function Home() {
	const categories = await getCategories();

	return (
		<main className="min-h-screen flex flex-col bg-slate-50">
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 items-center justify-between">
					<Link
						href="/"
						className="mr-6 flex items-center space-x-2 font-bold text-xl transition-colors hover:text-primary/90"
					>
						<LifeBuoy className="h-6 w-6 text-primary" />
						<span>HelpDesk</span>
					</Link>
					<nav className="flex items-center space-x-4 text-sm font-medium">
						<TrackTicketDialog />
						<Link
							href="/admin/login"
							className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"
						>
							<User className="w-4 h-4" /> Admin
						</Link>
					</nav>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-32">
				<div className="container relative z-10 flex flex-col items-center text-center">
					<div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-6 animate-fade-in-up">
						<Rocket className="w-4 h-4 mr-2 text-primary" /> 24/7 Priority
						Support
					</div>
					<h1 className="text-4xl font-extrabold tracking-tight !leading-tight sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 max-w-4xl">
						How can we help you today?
					</h1>
					<p className="max-w-[700px] text-lg text-muted-foreground leading-relaxed">
						Our dedicated support team is ready to assist you. Submit a new
						ticket or track the status of your existing request instantly.
					</p>
				</div>

				{/* Background Gradients */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px] opacity-30"></div>
				<div className="absolute top-0 right-0 -z-10 h-[300px] w-[300px] rounded-full bg-blue-400/20 blur-[80px] opacity-20"></div>
			</section>

			<section id="create" className="container pb-20 -mt-20 relative z-20">
				<TicketForm categories={categories} />
			</section>

			<footer className="border-t py-8 bg-white mt-auto">
				<div className="container flex flex-col items-center justify-between gap-4 md:flex-row text-sm text-muted-foreground">
					<p>
						&copy; {new Date().getFullYear()} Helpdesk System. All rights
						reserved.
					</p>
					<div className="flex gap-4">
						<Link href="#" className="hover:underline">
							Privacy Policy
						</Link>
						<Link href="#" className="hover:underline">
							Terms of Service
						</Link>
					</div>
				</div>
			</footer>
		</main>
	);
}
