import { Prisma } from "@prisma/client";
import { JWTPayload } from "jose";

export type SessionPayload = JWTPayload & {
	userId: number;
	email: string;
	role: string;
	expires: string | Date;
};

export type ActionResult = {
	success?: boolean;
	error?: string;
} | null;

export type TicketWithCategory = Prisma.TicketGetPayload<{
	include: { category: true };
}>;

export type TicketReplyWithUser = Prisma.TicketReplyGetPayload<{
	include: { user: true };
}>;

export type TicketWithDetails = Prisma.TicketGetPayload<{
	include: {
		category: true;
		replies: { include: { user: true } };
		aiSuggestion: true;
	};
}>;

export type AdminUser = Prisma.UserGetPayload<Record<string, never>>;

export type MonthlyStatPoint = {
	name: string;
	Created: number;
	Closed: number;
};

export type TopCategoryPoint = {
	name: string;
	count: number;
};
