<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { data, form }: { data: { returnUrl: string }; form: ActionData } = $props();
</script>

<div class="flex h-screen w-screen items-center justify-center bg-gray-50">
	<div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
		<h1 class="mb-6 text-2xl font-bold text-gray-800">Login</h1>

		<form method="post" use:enhance>
			{#if form?.error}
				<div class="mb-4 rounded bg-red-100 p-3 text-red-800">
					{form.error}
				</div>
			{/if}

			<div class="mb-4">
				<label for="username" class="mb-2 block text-sm font-medium text-gray-700">
					Username
				</label>
				<input
					id="username"
					name="username"
					type="text"
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div class="mb-6">
				<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
					Password
				</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<input type="hidden" name="returnUrl" value={data.returnUrl} />

			<div class="flex items-center justify-between">
				<button
					type="submit"
					class="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					Sign in
				</button>
			</div>
		</form>
	</div>
</div>
