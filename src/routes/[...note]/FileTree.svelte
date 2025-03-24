<script lang="ts">
	import { onMount } from 'svelte';
	import TreeItem from './TreeItem.svelte';

	// Updated tree node type – note that the endpoint now returns an array of TreeNode.
	export type TreeNode = {
		name: string;
		is_dir: boolean;
		relpath?: string;
		title?: string;
		children?: TreeNode[];
	};

	let tree: TreeNode[] | null = null;
	let error: string | null = null;

	onMount(async () => {
		try {
			const res = await fetch('http://127.0.0.1:8000/notes/tree');
			if (!res.ok) {
				throw new Error('Failed to fetch file tree');
			}
			tree = await res.json();
		} catch (err: any) {
			error = err.message;
		}
	});
</script>

{#if error}
	<div class="p-4 text-red-600">
		<p>Error loading file tree: {error}</p>
	</div>
{:else if tree}
	<nav class="custom-scrollbar mt-0 h-[95svh] w-[300px] overflow-y-auto p-4 pt-0">
		<ul class="m-0 list-none">
			{#each tree as node}
				<TreeItem {node} />
			{/each}
		</ul>
	</nav>
{:else}
	<div class="p-4">
		<p>Loading file tree...</p>
	</div>
{/if}

<style>
	/* Custom scrollbar styling */
	.custom-scrollbar {
		/* Move scrollbar to the left instead of right */
		direction: rtl;
	}

	.custom-scrollbar > * {
		/* Fix the text direction back to normal */
		direction: ltr;
	}

	/* Width of the scrollbar */
	.custom-scrollbar::-webkit-scrollbar {
		width: 1px; /* Even thinner */
	}

	/* Track - the area behind the scrollbar - make it transparent */
	.custom-scrollbar::-webkit-scrollbar-track {
		background-color: transparent;
	}

	/* Handle/thumb - the draggable scrolling element */
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: var(--color-gray-100, #e0e0e0);
		border-radius: 0; /* No border radius for a clean line */
	}

	/* Handle on hover - barely visible increase in contrast */
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: var(--color-gray-200, #c6c6c6);
	}

	/* Firefox scrollbar support */
	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: var(--color-gray-100, #e0e0e0) transparent;
	}
</style>
