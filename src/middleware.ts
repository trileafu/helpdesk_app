import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt, encrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
	const session = request.cookies.get("session")?.value;

	// Cek perizinan admin
	if (
		request.nextUrl.pathname.startsWith("/admin") &&
		!request.nextUrl.pathname.startsWith("/admin/login")
	) {
		if (!session) {
			return NextResponse.redirect(new URL("/admin/login", request.url));
		}
		const parsed = await decrypt(session);
		if (!parsed) {
			return NextResponse.redirect(new URL("/admin/login", request.url));
		}

		// Refresh session setiap ada aktivitas
		const res = NextResponse.next();
		const newExpires = new Date(Date.now() + 5 * 60 * 1000); // Kadaluarsa ditambah 5 menit

		// Enkripsi payload dengan session baru
		const newPayload = { ...parsed, expires: newExpires };

		const newSessionToken = await encrypt(newPayload);

		res.cookies.set({
			name: "session",
			value: newSessionToken,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			expires: newExpires,
			sameSite: "lax",
			path: "/",
		});
		return res;
	}

	// Kalau mencoba membuka halaman login padahal sudah login, langsung ke dasbor
	if (request.nextUrl.pathname === "/admin/login" && session) {
		const parsed = await decrypt(session);
		if (parsed)
			return NextResponse.redirect(new URL("/admin/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*"],
};
