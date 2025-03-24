import { dev } from "$app/environment";
import type { RequestEvent } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export const SESSION_COOKIE_NAME = "simple-auth-session";

// One day in milliseconds - session duration
const DAY_IN_MS = 1000 * 60 * 60 * 24;

// Simple session object
export type SimpleSession = {
	username: string;
	expiresAt: Date;
};

// Create a JWT-like token (simplified for demo purposes)
// In production, use a proper JWT library with signing
export function createSessionToken(username: string): string {
	const expiresAt = new Date(Date.now() + DAY_IN_MS * 7); // 7 days

	// Base64 encode a simple JSON object
	const payload = JSON.stringify({
		username,
		expiresAt: expiresAt.toISOString(),
	});

	return Buffer.from(payload).toString("base64");
}

// Validate the token and return session info
export function validateSessionToken(token: string): {
	session: SimpleSession | null;
} {
	try {
		// Decode the base64 token
		const payload = JSON.parse(Buffer.from(token, "base64").toString());

		// Check if the session has expired
		const expiresAt = new Date(payload.expiresAt);
		const sessionExpired = Date.now() >= expiresAt.getTime();

		if (sessionExpired) {
			return { session: null };
		}

		return {
			session: {
				username: payload.username,
				expiresAt,
			},
		};
	} catch (error) {
		// Return null if token is invalid
		return { session: null };
	}
}

// Validate login credentials against environment variables
export function validateCredentials(
	username: string,
	password: string,
): boolean {
	// Get credentials from environment variables
	const validUsername = env.AUTH_USERNAME;
	const validPassword = env.AUTH_PASSWORD;

	// In development, provide fallbacks for testing
	if (dev && !validUsername && !validPassword) {
		return username === "admin" && password === "password";
	}

	if (!validUsername || !validPassword) {
		console.warn(
			"AUTH_USERNAME or AUTH_PASSWORD not set in environment variables",
		);
		return false;
	}

	return username === validUsername && password === validPassword;
}

// Set the session cookie
export function setSessionCookie(
	event: RequestEvent,
	token: string,
	expiresAt: Date,
) {
	event.cookies.set(SESSION_COOKIE_NAME, token, {
		path: "/",
		httpOnly: true,
		secure: !dev, // Use secure cookies in production
		sameSite: "strict",
		expires: expiresAt,
	});
}

// Delete the session cookie
export function deleteSessionCookie(event: RequestEvent) {
	event.cookies.delete(SESSION_COOKIE_NAME, {
		path: "/",
	});
}
