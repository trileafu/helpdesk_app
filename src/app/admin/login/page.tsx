"use client";

import { useActionState } from "react";
import { loginAdmin } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Lock, Mail, AlertCircle, Loader2, LifeBuoy } from "lucide-react";
import Link from "next/link";
import type { ActionResult } from "@/lib/types";

export default function LoginPage() {
	const initialState: ActionResult = null;
	const [state, formAction, isPending] = useActionState(
		loginAdmin,
		initialState,
	);

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 font-sans">
			<div className="w-full max-w-md space-y-6">
				<div className="text-center space-y-2">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-90 transition-opacity"
					>
						<LifeBuoy className="w-8 h-8" />
						<span>HelpDesk</span>
					</Link>
				</div>

				<Card className="shadow-2xl border-none ring-1 ring-border bg-white/80 backdrop-blur">
					<CardHeader className="text-center border-b bg-muted/10 pb-6 pt-8">
						<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-primary/5">
							<Lock className="w-6 h-6 text-primary" />
						</div>
						<CardTitle className="text-2xl font-bold tracking-tight">
							Admin Login
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-8 pb-6">
						<form action={formAction} className="space-y-5">
							<div className="space-y-1.5">
								<label
									htmlFor="email"
									className="text-xs font-bold uppercase text-muted-foreground ml-1"
								>
									Email Address
								</label>
								<div className="relative group">
									<Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
									<Input
										type="email"
										name="email"
										id="email"
										required
										placeholder="superadmin@bonet.co.id"
										defaultValue="superadmin@bonet.co.id"
										className="pl-10 h-10"
									/>
								</div>
							</div>
							<div className="space-y-1.5">
								<div className="flex justify-between items-center ml-1">
									<label
										htmlFor="password"
										className="text-xs font-bold uppercase text-muted-foreground"
									>
										Password
									</label>
									<span className="text-[10px] text-muted-foreground cursor-help hover:text-primary underline transition-colors">
										Forgot password?
									</span>
								</div>
								<div className="relative group">
									<Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
									<Input
										type="password"
										name="password"
										id="password"
										required
										defaultValue="admin123"
										className="pl-10 h-10"
									/>
								</div>
							</div>

							{state?.error && (
								<div className="bg-destructive/10 text-destructive text-sm p-3.5 rounded-lg border border-destructive/20 flex items-center gap-3 animate-shake">
									<AlertCircle className="w-5 h-5 flex-shrink-0" />
									<span className="font-medium">{state.error}</span>
								</div>
							)}

							<Button
								type="submit"
								className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
								disabled={isPending}
							>
								{isPending ? (
									<span className="flex items-center gap-2">
										<Loader2 className="w-5 h-5 animate-spin" />{" "}
										Authenticating...
									</span>
								) : (
									"Sign In to Dashboard"
								)}
							</Button>
						</form>
					</CardContent>
					<div className="p-6 text-center border-t bg-muted/5">
						<p className="text-xs text-muted-foreground">
							&copy; {new Date().getFullYear()} PT Bonet Utama. All rights
							reserved.
						</p>
					</div>
				</Card>

				<div className="text-center">
					<Link
						href="/"
						className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline transition-all"
					>
						&larr; Return to Homepage
					</Link>
				</div>
			</div>
		</div>
	);
}
