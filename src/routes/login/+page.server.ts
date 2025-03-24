import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import * as simpleAuth from "$lib/server/simpleAuth";

export const load: PageServerLoad = async (event) => {
	// If user is already logged in, redirect to homepage
	if (event.locals.simpleUser) {
		return redirect(302, "/");
	}

	// Get the URL to return to after login
	const returnUrl = event.url.searchParams.get("returnUrl") || "/";

	return {
		returnUrl,
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get("username");
		const password = formData.get("password");
		const returnUrl = formData.get("returnUrl") || "/";

		// Validate form data
		if (
			typeof username !== "string" ||
			typeof password !== "string" ||
			!username ||
			!password
		) {
			return fail(400, {
				error: "Username and password are required",
			});
		}

		// Validate credentials against environment variables
		if (!simpleAuth.validateCredentials(username, password)) {
			return fail(401, {
				error: "Invalid username or password",
			});
		}

		// Create a session token
		const token = simpleAuth.createSessionToken(username);

		// Get session info
		const { session } = simpleAuth.validateSessionToken(token);

		if (!session) {
			return fail(500, {
				error: "Failed to create session",
			});
		}

		// Set the session cookie
		simpleAuth.setSessionCookie(event, token, session.expiresAt);

		// Redirect to the return URL
		return redirect(302, returnUrl.toString());
	},
};
