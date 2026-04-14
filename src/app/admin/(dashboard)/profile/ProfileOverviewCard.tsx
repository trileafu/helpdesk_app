import Image from "next/image";
import { Camera } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AdminUser } from "@/lib/types";

export function ProfileOverviewCard({ user }: { user: AdminUser }) {
	return (
		<Card className="md:col-span-1 shadow-sm border-none ring-1 ring-border bg-white h-fit">
			<CardHeader className="text-center pb-2">
				<div className="relative w-24 h-24 mx-auto mb-4 group">
					{user.avatar ? (
						<Image
							src={user.avatar}
							width={96}
							height={96}
							className="w-full h-full rounded-full object-cover border-4 border-muted"
							alt={user.name}
							unoptimized
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
				</div>
			</CardContent>
		</Card>
	);
}
