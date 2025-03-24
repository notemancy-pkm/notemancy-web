<script lang="ts">
	import DOMPurify from 'isomorphic-dompurify';
	import { Carta, Markdown } from 'carta-md';
	import FileTree from './FileTree.svelte';
	import ToC from './ToC.svelte';
	import { getCartaInstance } from './getCarta';
	import 'katex/dist/katex.css';
	import { math } from '@cartamd/plugin-math';
	import { anchor } from '@cartamd/plugin-anchor';
	import { onMount, onDestroy } from 'svelte';

	// The data property is populated by the load function in +page.server.ts
	let { data } = $props();
	let carta = $state(getCartaInstance('light'));

	// const carta = new Carta({
	// 	extensions: [math(), anchor()],
	// 	sanitizer: DOMPurify.sanitize
	// });
	let value = $state('');
	$effect(() => {
		value = data.note.content;
	});

	onMount(() => {
		// Hide unwanted elements when printing
		const beforePrint = () => {
			// Hide fixed elements (logo, FileTree, ToC)
			document.querySelectorAll('.fixed').forEach((el) => {
				(el as HTMLElement).style.display = 'none';
			});
			// Hide the title container; assuming it's the first child of the prose container
			// document.querySelectorAll('.prose > div:first-child').forEach((el) => {
			// 	(el as HTMLElement).style.display = 'none';
			// });
		};

		const afterPrint = () => {
			// Restore the display settings after printing
			document.querySelectorAll('.fixed').forEach((el) => {
				(el as HTMLElement).style.display = '';
			});
			// document.querySelectorAll('.prose > div:first-child').forEach((el) => {
			// 	(el as HTMLElement).style.display = '';
			// });
		};

		window.addEventListener('beforeprint', beforePrint);
		window.addEventListener('afterprint', afterPrint);
		return () => {
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
			{#key value}
				<div class="content" id="content">
					<div class="mt-24 mb-20">
						<h1 class="mb-4 font-[Noto_Sans] font-semibold">{data.note.title}</h1>
						<div
							class="flex items-center justify-start gap-8 font-[Noto_Sans] text-sm text-gray-400"
						>
							<div class="flex items-center gap-1 text-gray-700">
								by <div class="font-semibold">Rishikanth</div>
							</div>
							<div class="">{formatDate(data.note.frontmatter.last_modified)}</div>
							{#if data.note.frontmatter}
								<div class="flex items-center gap-2">
									{#each data.note.frontmatter.tags as tag}
										<div class="">#{tag}</div>
									{/each}
								</div>
							{/if}
						</div>
						<hr class="border-blue-400" />
					</div>
					<Markdown {carta} {value} />
				</div>
			{/key}
		</div>
		<div class="fixed top-[5svh] left-0 font-[Noto_Sans] text-base">
			<FileTree />
		</div>
		<div class="fixed top-[5svh] right-0 flex w-[300px] justify-end p-2 text-xs">
			<ToC noteKey={value} />
		</div>
	</article>
</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Noto+Sans+Mono:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

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
