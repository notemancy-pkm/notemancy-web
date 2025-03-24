import type { Handle } from "@sveltejs/kit";
import * as auth from "$lib/server/auth.js";
import * as simpleAuth from "$lib/server/simpleAuth.js";

// Handle both authentication systems
const handleAuth: Handle = async ({ event, resolve }) => {
	// Original Lucia auth
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		const { session, user } = await auth.validateSessionToken(sessionToken);

		if (session) {
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} else {
			auth.deleteSessionTokenCookie(event);
		}

		event.locals.user = user;
		event.locals.session = session;
	}

	// Simple auth
	const simpleToken = event.cookies.get(simpleAuth.SESSION_COOKIE_NAME);

	if (!simpleToken) {
		event.locals.simpleUser = null;
		event.locals.simpleSession = null;
	} else {
		const { session } = simpleAuth.validateSessionToken(simpleToken);

		if (session) {
			event.locals.simpleUser = session.username;
			event.locals.simpleSession = session;
		} else {
			simpleAuth.deleteSessionCookie(event);
			event.locals.simpleUser = null;
			event.locals.simpleSession = null;
		}
	}

	return resolve(event);
};

export const handle: Handle = handleAuth;
