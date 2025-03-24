<script lang="ts">
	import { page } from '$app/stores';

	// Access data from props for better reactivity
	let { data } = $props();
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-2xl font-bold">Homepage</h1>

	<div class="mb-6 rounded-lg bg-white p-6 shadow-lg">
		{#if data.simpleUser}
			<p class="mb-4">
				You are logged in as <span class="font-semibold">{data.simpleUser}</span>!
			</p>
			<div class="flex gap-4">
				<a href="/protected" class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
					Go to protected page
				</a>
				<a href="/logout" class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
					Log out
				</a>
			</div>
		{:else}
			<p class="mb-4">You are not logged in.</p>
			<a href="/login" class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
				Log in
			</a>
		{/if}
	</div>

	<div class="rounded-lg bg-white p-6 shadow-lg">
		<h2 class="mb-4 text-xl font-semibold">Environment Setup</h2>
		<p class="mb-2">
			To configure the login credentials, set these environment variables in a <code
				class="rounded bg-gray-100 px-2 py-1">.env</code
			> file:
		</p>
		<pre class="rounded bg-gray-100 p-4">AUTH_USERNAME=your_username
AUTH_PASSWORD=your_password</pre>
		<p class="mt-2 text-sm text-gray-600">
			(In development mode, if these are not set, the default credentials are username:
			<code class="rounded bg-gray-100 px-2 py-1">admin</code> and password:
			<code class="rounded bg-gray-100 px-2 py-1">password</code>)
		</p>
	</div>
</div>
