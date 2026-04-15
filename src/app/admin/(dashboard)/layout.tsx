import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "../actions";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Image from "next/image";
import { LifeBuoy, BarChart, Ticket, Users, UserCog } from "lucide-react";

export default async function AdminDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();
	if (!session?.userId) return redirect("/admin/login");

	const user = await prisma.user.findUnique({
		where: { id: session.userId },
	});

	if (!user) return redirect("/admin/login");

	return (
		<div className="flex h-screen bg-muted/40 font-sans">
			{/* Sidebar */}
			<aside className="w-64 bg-slate-900 text-slate-100 flex-shrink-0 hidden md:flex flex-col border-r border-slate-800 z-20">
				<div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
					<span className="font-bold text-xl tracking-tight flex items-center gap-2">
						<LifeBuoy className="text-primary h-6 w-6" /> HelpDesk
						<span className="font-light text-slate-500 text-sm ml-1">
							ADMIN
						</span>
					</span>
				</div>

				<div className="p-6 border-b border-slate-800">
					<div className="flex items-center gap-4">
						{user.avatar ? (
							<Image
								src={user.avatar}
								width={48}
								height={48}
								className="w-12 h-12 rounded-full border-2 border-slate-700 shadow-inner object-cover"
								alt={user.name}
								unoptimized
							/>
						) : (
							<div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xl border-2 border-slate-700 shadow-inner">
								{user.name.charAt(0)}
							</div>
						)}
						<div className="overflow-hidden">
							<div className="font-bold text-slate-100 text-sm truncate">
								{user.name}
							</div>
							<div className="text-[10px] text-primary font-bold uppercase tracking-wider opacity-80">
								{user.role}
							</div>
						</div>
					</div>
				</div>

				<nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
					<Link
						href="/admin/dashboard"
						className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white text-slate-300 transition-all group"
					>
						<BarChart className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
						<span className="font-medium text-sm">Dashboard</span>
					</Link>

					<Link
						href="/admin/tickets"
						className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white text-slate-300 transition-all group"
					>
						<Ticket className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
						<span className="font-medium text-sm">Tickets</span>
					</Link>

					{user.role === "superadmin" && (
						<Link
							href="/admin/users"
							className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white text-slate-300 transition-all group"
						>
							<Users className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
							<span className="font-medium text-sm">Users</span>
						</Link>
					)}

					<Link
						href="/admin/profile"
						className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 hover:text-white text-slate-300 transition-all group"
					>
						<UserCog className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
						<span className="font-medium text-sm">Profile</span>
					</Link>
				</nav>
			</aside>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden bg-background">
				{/* Header */}
				<header className="bg-background/80 backdrop-blur-md border-b h-16 flex items-center justify-between px-6 sticky top-0 z-30">
					<div className="flex items-center gap-4">
						<button className="md:hidden text-muted-foreground p-2 -ml-2">
							<span className="sr-only">Open menu</span>☰
						</button>
						<h1 className="font-semibold text-foreground text-lg hidden sm:block">
							Control Panel
						</h1>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-xs text-muted-foreground hidden sm:block">
							Logged in as{" "}
							<span className="font-semibold text-foreground">
								{user.email}
							</span>
						</div>
						<form action={logoutAdmin}>
							<button className="text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-full transition-colors">
								Sign Out
							</button>
						</form>
					</div>
				</header>

				<main className="flex-1 overflow-auto p-4 md:p-8 bg-muted/20 scroll-smooth">
					<div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
