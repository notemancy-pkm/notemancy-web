<script lang="ts">
	let { data } = $props();
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-2xl font-bold">Protected Page</h1>

	<div class="rounded-lg bg-white p-6 shadow-lg">
		<p class="mb-4">
			Welcome, <span class="font-semibold">{data.simpleUser}</span>! This is a protected page that
			only authenticated users can see.
		</p>

		<p>
			You can <a href="/logout" class="text-blue-500 hover:underline">log out</a> to test the protection.
		</p>
	</div>
</div>
