<script lang="ts">
	import DOMPurify from 'isomorphic-dompurify';
	import { Carta, Markdown, MarkdownEditor } from 'carta-md';
	import 'carta-md/default.css'; /* Default theme */
	import FileTree from './FileTree.svelte';
	import ToC from './ToC.svelte';
	import './tw.css';
	import { getCartaInstance } from './getCarta';
	import 'katex/dist/katex.css';
	import { math } from '@cartamd/plugin-math';
	import { anchor } from '@cartamd/plugin-anchor';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';

	// The data property is populated by the load function in +page.server.ts
	let { data } = $props();
	let carta = $state(getCartaInstance('light'));

	// State for editing mode
	let isEditMode = $state(false);
	let editableContent = $state('');
	let isSaving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state(false);

	// Get the relpath from page parameters
	let relpath = $derived(
		Array.isArray($page.params.note) ? $page.params.note.join('/') : $page.params.note || ''
	);

	let value = $state('');
	$effect(() => {
		value = data.note.content;
		editableContent = data.note.content;
	});

	// Automatically save changes when exiting edit mode
	async function saveChanges() {
		if (!data.simpleUser) return;

		isSaving = true;
		saveError = null;
		saveSuccess = false;

		try {
			const response = await fetch('http://127.0.0.1:8000/notes/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					relpath,
					content: editableContent
				})
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to update note');
			}

			// Update the displayed content
			value = editableContent;
			saveSuccess = true;

			// After a short delay, hide the success message
			setTimeout(() => {
				saveSuccess = false;
			}, 1500);
		} catch (error) {
			saveError = error instanceof Error ? error.message : 'Unknown error occurred';
			console.error('Error saving note:', error);
		} finally {
			isSaving = false;
		}
	}

	// Function to toggle edit mode
	function toggleEditMode() {
		// Only allow toggling if user is logged in
		if (!data.simpleUser) {
			return;
		}

		if (isEditMode) {
			// Exiting edit mode
			if (editableContent !== value) {
				// Content has changed, save it
				saveChanges().then(() => {
					isEditMode = false;
				});
			} else {
				// No changes, just toggle the mode
				isEditMode = false;
			}
		} else {
			// Entering edit mode
			editableContent = value;
			isEditMode = true;
		}
	}

	// Handle keyboard shortcut
	function handleKeyDown(event: KeyboardEvent) {
		// Check for Ctrl+L (or Cmd+L on Mac)
		if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
			event.preventDefault(); // Prevent browser's "focus address bar" action
			toggleEditMode();
		}
	}

	onMount(() => {
		// Add the keydown event listener to the window
		window.addEventListener('keydown', handleKeyDown);

		// Hide unwanted elements when printing
		const beforePrint = () => {
			// Hide fixed elements (logo, FileTree, ToC)
			document.querySelectorAll('.fixed').forEach((el) => {
				(el as HTMLElement).style.display = 'none';
			});
		};

		const afterPrint = () => {
			// Restore the display settings after printing
			document.querySelectorAll('.fixed').forEach((el) => {
				(el as HTMLElement).style.display = '';
			});
		};

		window.addEventListener('beforeprint', beforePrint);
		window.addEventListener('afterprint', afterPrint);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('beforeprint', beforePrint);
			window.removeEventListener('afterprint', afterPrint);
		};
	});

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const day = date.getDate();
		const month = date.toLocaleString('default', { month: 'long' });
		const year = date.getFullYear();

		const getOrdinalSuffix = (d: number): string => {
			// Special case for 11th, 12th, 13th
			if (d >= 11 && d <= 13) return 'th';
			switch (d % 10) {
				case 1:
					return 'st';
				case 2:
					return 'nd';
				case 3:
					return 'rd';
				default:
					return 'th';
			}
		};

		return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
	}
</script>

<main>
	<article>
		<div
			class="prose prose-base prose-headings:font-[Noto_Sans] mx-auto max-w-[784px] pb-16 font-[IBM_Plex_Serif] text-gray-700"
		>
			{#if isEditMode}
				<div class="mt-20 mb-4">
					<div class="mb-4">
						<h1 class="mb-4 font-[Noto_Sans] font-semibold">{data.note.title}</h1>
						<div
							class="flex items-center justify-start gap-8 font-[Noto_Sans] text-sm text-gray-400"
						>
							<div class="flex items-center gap-1 text-gray-700">
								by <div class="font-semibold">Rishikanth</div>
							</div>
							<div class="">{formatDate(data.note.frontmatter.last_modified)}</div>
							{#if data.note.frontmatter && data.note.frontmatter.tags}
								<div class="flex items-center gap-2">
									{#each data.note.frontmatter.tags as tag}
										<div class="">#{tag}</div>
									{/each}
								</div>
							{/if}
						</div>
						<hr class="border-[#ff7eb6]" />
					</div>

					{#if saveSuccess}
						<div class="mb-4 rounded-md bg-green-100 p-2 font-[Noto_Sans] text-sm text-green-800">
							Note saved successfully!
						</div>
					{/if}
					{#if saveError}
						<div class="mb-4 rounded-md bg-red-100 p-2 font-[Noto_Sans] text-sm text-red-800">
							Error: {saveError}
						</div>
					{/if}
					{#if isSaving}
						<div class="mb-4 rounded-md bg-blue-50 p-2 font-[Noto_Sans] text-sm text-blue-800">
							Saving changes...
						</div>
					{/if}

					<div class="mx-auto h-[70vh] w-full overflow-hidden">
						<MarkdownEditor
							{carta}
							bind:value={editableContent}
							disableToolbar={true}
							scroll={'sync'}
							theme="tw"
							mode={'tabs'}
						/>
					</div>
				</div>
			{:else}
				<div class="content" id="content">
					<div class="mt-20 mb-20">
						<div>
							<h1 class="mb-4 font-[Noto_Sans] font-semibold">{data.note.title}</h1>
						</div>
						<div
							class="flex items-center justify-start gap-8 font-[Noto_Sans] text-sm text-gray-400"
						>
							<div class="flex items-center gap-1 text-gray-700">
								by <div class="font-semibold">Rishikanth</div>
							</div>
							<div class="">{formatDate(data.note.frontmatter.last_modified)}</div>
							{#if data.note.frontmatter && data.note.frontmatter.tags}
								<div class="flex items-center gap-2">
									{#each data.note.frontmatter.tags as tag}
										<div class="">#{tag}</div>
									{/each}
								</div>
							{/if}
						</div>
						<hr class="border-blue-400" />
					</div>
					{#key value}
						<Markdown {carta} {value} />
					{/key}
				</div>
			{/if}
		</div>
		<div class="fixed top-[5svh] left-0 font-[Noto_Sans] text-base">
			<FileTree />
		</div>
		{#if !isEditMode}
			<div class="fixed top-[5svh] right-0 flex w-[350px] justify-end p-2 text-xs">
				<ToC noteKey={value} />
			</div>
		{/if}
	</article>
</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Noto+Sans+Mono:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

	/* Set monospace font for the editor */
	:global(.carta-font-code) {
		font-family: 'Noto Sans Mono', monospace;
		font-size: 1rem;
		line-height: 1.5;
		letter-spacing: normal;
	}

	@media print {
		.fixed {
			display: none !important;
		}
		body * {
			visibility: hidden;
		}
		#content,
		#content * {
			visibility: visible;
		}
		#content {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
		}
	}
</style>
