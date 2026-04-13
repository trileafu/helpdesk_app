"use client";

import { useState } from "react";
import { updateAdminProfile, changeAdminPassword } from "@/app/admin/actions";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Lock, Camera, Check, AlertCircle, Loader2 } from "lucide-react";
import { useActionState } from "react";

export default function ProfilePage({ initialUser }: { initialUser: any }) {
	const [user, setUser] = useState(initialUser);
	const [loading, setLoading] = useState(false);
	const [profileMsg, setProfileMsg] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [pwState, pwAction, pwPending] = useActionState(
		changeAdminPassword,
		null,
	);

	const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setProfileMsg(null);

		const formData = new FormData(e.currentTarget);
		const result = await updateAdminProfile(formData);

		if (result.success) {
			setUser(result.user);
			setProfileMsg({ type: "success", text: "Profile updated successfully!" });
		} else {
			setProfileMsg({ type: "error", text: "Failed to update profile." });
		}
		setLoading(false);
	};

	return (
		<div className="space-y-8 animate-fade-in px-2 font-sans">
			<div className="flex flex-col gap-1">
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					Account Settings
				</h1>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{/* Profile Overview */}
				<Card className="md:col-span-1 shadow-sm border-none ring-1 ring-border bg-white h-fit">
					<CardHeader className="text-center pb-2">
						<div className="relative w-24 h-24 mx-auto mb-4 group">
							{user.avatar ? (
								<img
									src={user.avatar}
									className="w-full h-full rounded-full object-cover border-4 border-muted"
									alt={user.name}
								/>
							) : (
								<div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-muted">
									{user.name.charAt(0)}
								</div>
							)}
							<div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
								<Camera className="w-6 h-6 text-white" />
							</div>
						</div>
						<CardTitle className="text-xl font-bold">{user.name}</CardTitle>
						<CardDescription className="text-xs font-medium uppercase tracking-widest text-primary mt-1">
							{user.role}
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center pt-0">
						<p className="text-xs text-muted-foreground">{user.email}</p>
						<div className="mt-6 pt-6 border-t space-y-3">
							<div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
								<span>Account Created</span>
								<span className="text-foreground">
									{new Date(user.createdAt).toLocaleDateString()}
								</span>
							</div>
							<div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
								<span>Last Security Check</span>
								<span className="text-foreground">Today</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Edit Forms */}
				<div className="md:col-span-2 space-y-8">
					{/* Basic Info */}
					<Card className="shadow-sm border-none ring-1 ring-border bg-white">
						<CardHeader className="border-b bg-muted/5">
							<CardTitle className="text-lg font-bold flex items-center gap-2">
								<User className="w-5 h-5 text-primary" /> Basic Information
							</CardTitle>
						</CardHeader>
						<form onSubmit={handleProfileUpdate}>
							<CardContent className="pt-6 space-y-6">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
											Full Name
										</label>
										<Input
											name="name"
											defaultValue={user.name}
											required
											className="h-11 font-medium"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
											Email Address
										</label>
										<Input
											name="email"
											type="email"
											defaultValue={user.email}
											required
											className="h-11 font-medium"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
										Profile Picture
									</label>
									<Input
										name="avatar"
										type="file"
										accept="image/*"
										className="h-11 cursor-pointer pt-2 bg-muted/20 border-dashed hover:bg-muted/40 transition-colors"
									/>
									<p className="text-[10px] text-muted-foreground italic">
										Recommended: Square JPG or PNG, max 2MB.
									</p>
								</div>

								{profileMsg && (
									<div
										className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
											profileMsg.type === "success"
												? "bg-green-50 text-green-700 border border-green-200"
												: "bg-destructive/10 text-destructive border border-destructive/20"
										}`}
									>
										{profileMsg.type === "success" ? (
											<Check className="w-5 h-5" />
										) : (
											<AlertCircle className="w-5 h-5" />
										)}
										{profileMsg.text}
									</div>
								)}
							</CardContent>
							<CardFooter className="border-t bg-muted/5 px-6 py-4 flex justify-end">
								<Button
									type="submit"
									disabled={loading}
									className="gap-2 font-bold min-w-[140px]"
								>
									{loading ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Check className="w-4 h-4" />
									)}
									Save Changes
								</Button>
							</CardFooter>
						</form>
					</Card>

					{/* Change Password */}
					<Card className="shadow-sm border-none ring-1 ring-border bg-white overflow-hidden">
						<CardHeader className="border-b bg-muted/5">
							<CardTitle className="text-lg font-bold flex items-center gap-2">
								<Lock className="w-5 h-5 text-primary" /> Security & Password
							</CardTitle>
						</CardHeader>
						<form action={pwAction}>
							<CardContent className="pt-6 space-y-6">
								<div className="space-y-2">
									<label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
										Current Password
									</label>
									<Input
										name="currentPassword"
										type="password"
										required
										className="h-11"
									/>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
											New Password
										</label>
										<Input
											name="newPassword"
											type="password"
											required
											className="h-11"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
											Confirm New Password
										</label>
										<Input
											name="confirmPassword"
											type="password"
											required
											className="h-11"
										/>
									</div>
								</div>

								{pwState?.error && (
									<div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-3 text-sm font-medium animate-in shake">
										<AlertCircle className="w-5 h-5" /> {pwState.error}
									</div>
								)}
								{pwState?.success && (
									<div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 flex items-center gap-3 text-sm font-medium animate-in fade-in">
										<Check className="w-5 h-5" /> Password updated successfully!
									</div>
								)}
							</CardContent>
							<CardFooter className="border-t bg-muted/5 px-6 py-4 flex justify-end">
								<Button
									type="submit"
									variant="outline"
									disabled={pwPending}
									className="gap-2 font-bold min-w-[140px] border-primary/20 text-primary hover:bg-primary/5"
								>
									{pwPending ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Lock className="w-4 h-4" />
									)}
									Update Password
								</Button>
							</CardFooter>
						</form>
					</Card>
				</div>
			</div>
		</div>
	);
}
