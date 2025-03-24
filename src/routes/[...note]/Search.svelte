<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createDialog, createScrollArea, melt } from '@melt-ui/svelte';
	import { fly, fade } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	// Create the dialog component
	const {
		elements: { trigger, overlay, content, title, description, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true,
		defaultOpen: false
	});

	// Create the scroll area for results
	const {
		elements: {
			root: scrollRoot,
			content: scrollContent,
			viewport: scrollViewport,
			scrollbarY,
			thumbY
		}
	} = createScrollArea({
		type: 'hover'
	});

	// State for search
	let searchQuery = $state('');
	let searchResults = $state<SearchResult[]>([]);
	let isSearching = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Interface for search results
	interface SearchResult {
		title: string;
		content: string;
		relpath: string;
	}

	// Export function to open the dialog
	export function openSearchDialog() {
		console.log('Opening search dialog');
		open.set(true);
		// Focus on the search input after dialog is open
		if (browser) {
			setTimeout(() => {
				document.getElementById('search-input')?.focus();
			}, 50);
		}
	}

	// Handle search input changes
	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;

		// Clear previous debounce timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Don't search for empty queries
		if (!searchQuery.trim()) {
			searchResults = [];
			isSearching = false;
			return;
		}

		// Set searching state
		isSearching = true;

		// Debounce the search to avoid too many requests
		debounceTimer = setTimeout(() => {
			performSearch(searchQuery);
		}, 300);
	}

	// Function to perform search request
	async function performSearch(query: string) {
		try {
			const response = await fetch(
				`http://127.0.0.1:8000/notes/search?query=${encodeURIComponent(query)}`
			);

			if (!response.ok) {
				throw new Error('Search failed');
			}

			const data = await response.json();
			searchResults = data.results.map((result: any) => ({
				title: result.title,
				content: result.content,
				relpath: result.relpath
			}));
		} catch (error) {
			console.error('Error searching notes:', error);
			searchResults = [];
		} finally {
			isSearching = false;
		}
	}

	// Function to navigate to a search result
	function navigateToResult(relpath: string) {
		open.set(false);
		if (browser) {
			window.location.href = `/${relpath}`;
		}
	}

	// Function to get a content preview (5 lines)
	function getContentPreview(content: string): string {
		const lines = content.split('\n').filter((line) => line.trim());
		return lines.slice(0, 5).join('\n');
	}

	// Handle keyboard events for the dialog
	function handleKeyDown(event: KeyboardEvent) {
		// Open search dialog on Ctrl+K
		if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
			event.preventDefault();
			openSearchDialog();
		}

		// Close on Escape
		if (event.key === 'Escape' && $open) {
			event.preventDefault();
			open.set(false);
		}
	}

	onMount(() => {
		// Only add event listeners on the client side
		if (browser) {
			// Add the global key event listener
			window.addEventListener('keydown', handleKeyDown);
			console.log('Search component mounted, keyboard listener attached');
		}
	});

	onDestroy(() => {
		// Only remove event listeners on the client side
		if (browser) {
			window.removeEventListener('keydown', handleKeyDown);
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
		}
	});
</script>

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		/>
		<div
			class="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg"
			transition:fly={{ duration: 150, y: 8 }}
			use:melt={$content}
		>
			<h2 use:melt={$title} class="m-0 mb-4 text-lg font-medium text-black">Search Notes</h2>

			<div class="mb-4 flex items-center">
				<div class="relative w-full">
					<Icon icon="mdi:magnify" class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
					<input
						id="search-input"
						type="text"
						placeholder="Search for notes..."
						class="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:outline-none"
						value={searchQuery}
						oninput={handleSearchInput}
					/>
					{#if searchQuery && !isSearching}
						<button
							class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							onclick={() => {
								searchQuery = '';
								searchResults = [];
							}}
						>
							<Icon icon="mdi:close" />
						</button>
					{/if}
					{#if isSearching}
						<div class="absolute top-1/2 right-3 -translate-y-1/2">
							<Icon icon="mdi:loading" class="animate-spin text-blue-500" />
						</div>
					{/if}
				</div>
			</div>

			<!-- Results area with scroll -->
			<div
				use:melt={$scrollRoot}
				class="relative h-[50vh] overflow-hidden rounded-md bg-white text-gray-900"
			>
				<div use:melt={$scrollViewport} class="h-full w-full rounded-[inherit]">
					<div use:melt={$scrollContent}>
						{#if searchResults.length === 0}
							<div class="flex h-32 items-center justify-center text-gray-500">
								{#if isSearching}
									Searching...
								{:else if searchQuery}
									No results found for "{searchQuery}"
								{:else}
									Enter a search term to find notes
								{/if}
							</div>
						{:else}
							<div class="p-2">
								{#each searchResults as result (result.relpath)}
									<button
										class="my-2 cursor-pointer rounded-md p-3 text-left hover:bg-gray-100"
										onclick={() => navigateToResult(result.relpath)}
									>
										<h3 class="font-semibold text-blue-600">{result.title || result.relpath}</h3>
										<div class="mt-1 text-sm text-gray-600">
											<p class="truncate text-xs text-gray-400">{result.relpath}</p>
											<pre class="mt-2 overflow-hidden text-xs text-gray-700">{getContentPreview(
													result.content
												)}</pre>
										</div>
									</button>
									<div role="separator" class="my-2 h-px w-full bg-gray-200" />
								{/each}
							</div>
						{/if}
					</div>
				</div>
				<div
					use:melt={$scrollbarY}
					class="flex h-full w-1 touch-none bg-gray-100 p-px transition-colors select-none"
				>
					<div
						use:melt={$thumbY}
						class="relative flex-1 rounded-full bg-blue-400 hover:bg-blue-500"
					/>
				</div>
			</div>

			<div class="mt-4 flex items-center justify-between text-sm text-gray-500">
				<div class="flex items-center gap-1">
					<kbd class="rounded border px-1.5 py-0.5 text-xs">Ctrl</kbd>
					<span>+</span>
					<kbd class="rounded border px-1.5 py-0.5 text-xs">K</kbd>
					<span class="ml-2">to open search</span>
				</div>
				<button use:melt={$close} class="rounded-md px-3 py-1 hover:bg-gray-100"> Close </button>
			</div>
		</div>
	</div>
{/if}
