"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export function TrackTicketDialog() {
	const [isOpen, setIsOpen] = useState(false);
	const [code, setCode] = useState("");
	const router = useRouter();

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (code.trim()) {
			router.push(`/${code.trim()}`);
			setIsOpen(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<button className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2 text-sm font-medium">
					<Search className="w-4 h-4" />
				</button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
				<div className="bg-white">
					<DialogHeader className="p-6 border-b bg-muted/5">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-primary/10 rounded-lg">
								<Search className="w-5 h-5 text-primary" />
							</div>
							<DialogTitle className="text-xl font-bold">
								Track Ticket
							</DialogTitle>
						</div>
					</DialogHeader>
					<form onSubmit={handleSearch} className="p-8 pt-4 space-y-6">
						<div className="space-y-3 text-left">
							<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
								Reference Code
							</label>
							<Input
								type="text"
								placeholder="TIX-XXXXX"
								value={code}
								onChange={(e) => setCode(e.target.value)}
								className="h-16 text-center font-mono text-xl tracking-widest uppercase border-2 focus-visible:ring-primary/20 bg-slate-50/50"
								required
								autoFocus
							/>
						</div>
						<Button
							type="submit"
							size="lg"
							className="w-full h-14 text-lg font-bold"
						>
							Trace Ticket
						</Button>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
