import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionPayload } from "@/lib/types";

const key = new TextEncoder().encode("secret_key_change_me_to_env_var");

export async function encrypt(payload: SessionPayload) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("5m")
		.sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
	try {
		const { payload } = await jwtVerify(input, key, {
			algorithms: ["HS256"],
		});
		return payload as SessionPayload;
	} catch {
		return null;
	}
}

export async function createSession(
	userId: number,
	email: string,
	role: string,
) {
	const expires = new Date(Date.now() + 5 * 60 * 1000);
	const session = await encrypt({ userId, email, role, expires });

	const cookieStore = await cookies();
	cookieStore.set("session", session, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		expires: expires,
		sameSite: "lax",
		path: "/",
	});
}

export async function getSession() {
	const cookieStore = await cookies();
	const session = cookieStore.get("session")?.value;
	if (!session) return null;
	return await decrypt(session);
}

export async function logout() {
	const cookieStore = await cookies();
	cookieStore.set("session", "", { expires: new Date(0) });
}
