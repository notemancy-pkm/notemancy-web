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
	<nav class="h-[95svh] w-[300px] overflow-y-auto p-4">
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
