import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
	// If the catch-all parameter is provided as an array, join it to form the relative path.
	// If no note is provided, default to "errors.md".
	const notePath = params.note
		? Array.isArray(params.note)
			? params.note.join("/")
			: params.note
		: "errors.md";

	// Call the Rocket API's note content endpoint.
	const response = await fetch(
		`http://127.0.0.1:8000/notes/content?relpath=${encodeURIComponent(notePath)}`,
	);

	// If the API returns an error, you can handle it here.
	if (!response.ok) {
		return {
			note: {
				title: "Error",
				content: "Could not load note.",
				frontmatter: {},
			},
		};
	}

	const data = await response.json();
	return { note: data };
};
