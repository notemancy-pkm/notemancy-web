import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import * as simpleAuth from "$lib/server/simpleAuth";

export const GET: RequestHandler = async (event) => {
	// Delete the session cookie
	simpleAuth.deleteSessionCookie(event);

	// Get the returnUrl query parameter or default to homepage
	const returnUrl = event.url.searchParams.get("returnUrl") || "/";

	// Redirect to the return URL
	return redirect(302, returnUrl);
};
