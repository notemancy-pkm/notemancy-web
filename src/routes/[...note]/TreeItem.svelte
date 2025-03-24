<script lang="ts">
	import TreeItem from './TreeItem.svelte';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';

	// The "node" prop represents one file or folder.
	// export let node: {
	// 	name: string;
	// 	is_dir: boolean;
	// 	relpath?: string;
	// 	title?: string;
	// 	children?: any[];
	// };

	let { node } = $props();
	let expanded = $state(false);
</script>

<li class="my-1.5 list-none">
	{#if node.is_dir}
		<div class="cursor-pointer" onclick={() => (expanded = !expanded)}>
			<div class="flex items-center">
				{#if node.children && node.children.length > 0}
					<Icon icon={expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'} class="mr-2" />
				{/if}
				<span class="font-semibold text-gray-500">{node.name}</span>
			</div>
		</div>
		{#if expanded && node.children && node.children.length > 0}
			<ul class="ml-6">
				{#each node.children as child}
					<TreeItem node={child} />
				{/each}
			</ul>
		{/if}
	{:else}
		<div class="flex items-center">
			<a
				href={`/${node.relpath}`}
				class={`no-underline ${$page.url.pathname === '/' + node.relpath ? 'text-blue-500' : 'text-gray-400'}`}
			>
				{node.title || node.name}
			</a>
		</div>
	{/if}
</li>
