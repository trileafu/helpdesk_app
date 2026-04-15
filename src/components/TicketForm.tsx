"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTicket, ActionState } from "@/app/actions";
import { Category } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle, Paperclip } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { addRecentTicketCode } from "@/lib/utils";

const initialState: ActionState = {};

export default function TicketForm({ categories }: { categories: Category[] }) {
	const [state, formAction, isPending] = useActionState(
		createTicket,
		initialState,
	);
	const recaptchaRef = useRef<ReCAPTCHA>(null);
	const savedTicketCodeRef = useRef<string | null>(null);

	useEffect(() => {
		if (!state.success || !state.ticketCode) {
			return;
		}

		if (savedTicketCodeRef.current === state.ticketCode) {
			return;
		}

		addRecentTicketCode(state.ticketCode);
		savedTicketCodeRef.current = state.ticketCode;
	}, [state.success, state.ticketCode]);

	if (state.success) {
		return (
			<Card className="max-w-xl mx-auto text-center border-green-200 bg-green-50/50">
				<CardHeader className="pt-8">
					<div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
						<CheckCircle className="h-10 w-10 text-green-600" />
					</div>
					<CardTitle className="text-2xl text-green-800">
						Ticket Submitted!
					</CardTitle>
					<CardDescription>
						We have received your request and our team is on it.
					</CardDescription>
				</CardHeader>
				<CardContent className="pb-8">
					<p className="text-muted-foreground mb-4">
						Your ticket ID for tracking:
					</p>
					<div className="text-3xl font-mono font-bold text-primary select-all bg-white py-6 border-2 border-primary/20 rounded-xl shadow-inner tracking-wider mb-6">
						{state.ticketCode}
					</div>
					<div className="space-y-4 text-sm text-muted-foreground bg-white/40 p-4 rounded-lg border border-green-100">
						<p>
							A confirmation email has been sent to your address. Use the code
							above to check your ticket status at any time.
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col sm:flex-row gap-3 justify-center border-t border-green-100 bg-green-50/30 p-6">
					<Link href={`/${state.ticketCode}`}>
						<Button className="font-bold gap-2">
							<CheckCircle className="h-4 w-4" /> View Your Ticket
						</Button>
					</Link>
					<Button
						onClick={() => window.location.reload()}
						variant="outline"
						className="font-semibold"
					>
						Submit Another Request
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card className="max-w-3xl mx-auto shadow-2xl border-none ring-1 ring-border">
			<CardHeader className="border-b bg-muted/5 pb-6">
				<CardTitle className="text-2xl font-bold">
					Support Request Form
				</CardTitle>
				<CardDescription>
					Describe your issue as clearly as possible for our technicians.
				</CardDescription>
			</CardHeader>

			<CardContent className="pt-8">
				<form
					action={(formData) => {
						if (recaptchaRef.current) {
							const token = recaptchaRef.current.getValue();
							if (token) {
								formData.set("g-recaptcha-response", token);
							}
						}
						formAction(formData);
					}}
					className="space-y-6"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label
								htmlFor="name"
								className="text-sm font-bold uppercase text-muted-foreground/80 tracking-wider"
							>
								Full Name <span className="text-red-500">*</span>
							</label>
							<Input
								id="name"
								name="name"
								required
								placeholder="John Doe"
								className="h-11"
							/>
						</div>
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="text-sm font-bold uppercase text-muted-foreground/80 tracking-wider"
							>
								Email Address <span className="text-red-500">*</span>
							</label>
							<Input
								type="email"
								id="email"
								name="email"
								required
								placeholder="john@company.com"
								className="h-11"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="title"
							className="text-sm font-bold uppercase text-muted-foreground/80 tracking-wider"
						>
							Subject <span className="text-red-500">*</span>
						</label>
						<Input
							id="title"
							name="title"
							required
							placeholder="Brief summary of the issue"
							className="h-11"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="category"
							className="text-sm font-bold uppercase text-muted-foreground/80 tracking-wider"
						>
							Category <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<select
								id="category"
								name="category"
								required
								defaultValue=""
								className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-medium"
							>
								<option value="" disabled>
									Select a category
								</option>
								{categories.map((c) => (
									<option key={c.id} value={c.id}>
										{c.category_name}
									</option>
								))}
							</select>
							<div className="absolute right-3 top-3.5 pointer-events-none opacity-50">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="description"
							className="text-sm font-bold uppercase text-muted-foreground/80 tracking-wider"
						>
							Problem Description <span className="text-red-500">*</span>
						</label>
						<Textarea
							id="description"
							name="description"
							rows={6}
							required
							placeholder="Tell us what happened..."
							className="resize-none"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="attachment"
							className="text-sm font-bold uppercase text-muted-foreground/80 tracking-wider flex items-center gap-2"
						>
							<Paperclip className="h-3.5 w-3.5" /> Attachment (Optional)
						</label>
						<Input
							type="file"
							id="attachment"
							name="attachment"
							className="cursor-pointer font-medium p-2 border-dashed bg-muted/20 hover:bg-muted/40 transition-colors"
						/>
						<p className="text-[10px] text-muted-foreground">
							Upload screenshots or logs that might help us investigate (max
							5MB).
						</p>
					</div>

					{/* Real Google reCAPTCHA */}
					<div className="pt-2">
						<ReCAPTCHA
							ref={recaptchaRef}
							sitekey={
								process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
								"6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
							}
						/>
					</div>

					{state?.error && (
						<div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20 flex items-center gap-3 animate-shake font-medium">
							<AlertTriangle className="h-5 w-5 flex-shrink-0" /> {state.error}
						</div>
					)}

					<div className="flex justify-end pt-4">
						<Button
							type="submit"
							size="lg"
							className="w-full md:w-auto h-12 px-10 text-base font-bold shadow-lg shadow-primary/20"
							disabled={isPending}
						>
							{isPending ? (
								<span className="flex items-center gap-2">
									<Loader2 className="animate-spin h-5 w-5" /> Submitting...
								</span>
							) : (
								"Submit Support Ticket"
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
