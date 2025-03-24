import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	// Pass auth data to the client
	return {
		// Original auth
		user: locals.user,

		// Simple auth
		simpleUser: locals.simpleUser,
	};
};
