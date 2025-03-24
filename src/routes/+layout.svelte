<script lang="ts">
	import '../app.css';
	import AuthStatus from '$lib/components/AuthStatus.svelte';

	let { children, data } = $props();
</script>

<div class="min-h-screen">
	<div class="fixed top-0 right-0 left-0 z-10 flex items-center justify-between p-4">
		<div>
			<a href="/">
				<img src="/logo.svg" alt="Logo" class="h-6 w-auto" />
			</a>
		</div>
		<AuthStatus {data} />
	</div>

	<div class="pt-16">
		{@render children()}
	</div>
</div>
