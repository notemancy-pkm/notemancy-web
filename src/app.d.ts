// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import("$lib/server/auth").SessionValidationResult["user"];
			session: import("$lib/server/auth").SessionValidationResult["session"];
			simpleUser: string | null;
			simpleSession: import("$lib/server/simpleAuth").SimpleSession | null;
		}
	}
}

export {};
