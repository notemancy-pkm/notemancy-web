<script lang="ts">
	import Icon from '@iconify/svelte';

	// Import data from parent component
	let { data } = $props();
</script>

<div class="flex items-center gap-3">
	{#if data?.simpleUser}
		<div class="text-sm text-gray-700">
			<span class="font-semibold">{data.simpleUser}</span>
		</div>
		<a
			href="/logout"
			class="flex items-center justify-center text-gray-700 hover:text-blue-500"
			title="Log out"
		>
			<Icon icon="solar:logout-3-bold-duotone" width="28" height="28" />
		</a>
	{:else}
		<a
			href="/login"
			class="flex items-center justify-center rounded-full text-gray-700 hover:text-blue-500"
			title="Log in"
		>
			<Icon icon="solar:login-3-bold-duotone" width="28" height="28" />
		</a>
	{/if}
</div>
