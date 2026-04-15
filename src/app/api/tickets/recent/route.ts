import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RecentTicketsRequest = {
	codes?: unknown;
};

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as RecentTicketsRequest;
		const codes = Array.isArray(body.codes)
			? body.codes.filter((code): code is string => typeof code === "string")
			: [];

		if (codes.length === 0) {
			return NextResponse.json({ tickets: [] });
		}

		const uniqueCodes = [...new Set(codes)];
		const tickets = await prisma.ticket.findMany({
			where: {
				ticket_code: {
					in: uniqueCodes,
				},
			},
			select: {
				ticket_code: true,
				title: true,
				status: true,
			},
		});

		const ticketMap = new Map(
			tickets.map((ticket) => [ticket.ticket_code, ticket]),
		);

		return NextResponse.json({
			tickets: uniqueCodes
				.map((code) => ticketMap.get(code))
				.filter(
					(
						ticket,
					): ticket is { ticket_code: string; title: string; status: string } =>
						Boolean(ticket),
				),
		});
	} catch {
		return NextResponse.json({ tickets: [] }, { status: 500 });
	}
}
